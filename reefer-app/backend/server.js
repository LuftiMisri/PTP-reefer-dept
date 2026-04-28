const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql2/promise');

const app = express();

// configure MySQL pool (set via environment or defaults to localhost)
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'Reef@123',
    database: process.env.DB_NAME || 'ptpdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

function normalizeStoredPath(rawPath) {
    if (typeof rawPath !== 'string') return rawPath;

    const trimmed = rawPath.trim();
    if (!trimmed) return trimmed;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;

    let normalized = trimmed.replace(/\\/g, '/');
    normalized = normalized.replace(/^[a-zA-Z]:\//, '/');
    normalized = normalized.replace(/^\/WEBSITE\//i, '/');
    normalized = normalized.replace(/^WEBSITE\//i, '');
    normalized = normalized.replace(/\/+/g, '/');

    if (!normalized.startsWith('/')) {
        normalized = `/${normalized}`;
    }

    return normalized;
}

async function normalizeColumnPaths(tableName, idColumn, pathColumn) {
    try {
        const [rows] = await pool.query(
            `SELECT ${idColumn} AS row_id, ${pathColumn} AS raw_path FROM ${tableName}`
        );

        let updatedCount = 0;
        for (const row of rows) {
            const currentPath = row.raw_path;
            const normalizedPath = normalizeStoredPath(currentPath);

            if (typeof currentPath === 'string' && normalizedPath !== currentPath) {
                await pool.query(
                    `UPDATE ${tableName} SET ${pathColumn} = ? WHERE ${idColumn} = ?`,
                    [normalizedPath, row.row_id]
                );
                updatedCount += 1;
            }
        }

        if (updatedCount > 0) {
            console.log(`Normalized ${updatedCount} path(s) in ${tableName}.${pathColumn}`);
        }
    } catch (err) {
        if (err.code !== 'ER_NO_SUCH_TABLE' && err.code !== 'ER_BAD_FIELD_ERROR') {
            throw err;
        }
    }
}

async function normalizeDbPaths() {
    const targets = [
        { table: 'images', id: 'id', column: 'path' },
        { table: 'images', id: 'id', column: 'filepath' },
        { table: 'images', id: 'id', column: 'image_path' },
        { table: 'staff', id: 'id', column: 'image_path' },
        { table: 'documents', id: 'id', column: 'path' },
        { table: 'documents', id: 'id', column: 'filepath' },
        { table: 'DOCS', id: 'id', column: 'path' },
        { table: 'DOCS', id: 'id', column: 'filepath' }
    ];

    for (const target of targets) {
        await normalizeColumnPaths(target.table, target.id, target.column);
    }
}

// optional in-memory fallback (for quick testing/debug)
const users = {
    'admin': 'password123',
    'user1': 'pass1'
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'replace-this-with-a-secure-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 2 * 60 * 60 * 1000 } // 2 hours
}));

const reeferRootDir = path.join(__dirname, 'reefer');
const reeferWebsiteDir = path.join(reeferRootDir, 'reefer-website');
const reeferDocsDir = path.join(reeferRootDir, 'docs');
const reeferLoginPagePath = path.join(reeferRootDir, 'login-page', 'index.html');
const isoUploadDir = path.join(reeferDocsDir, 'ISO DOCS');

// authentication check for protected paths
app.use((req, res, next) => {
    const requestPath = req.path.toLowerCase();
    // protect internal.html and any files under /docs
    if ((requestPath === '/internal.html' || requestPath.startsWith('/docs')) && !req.session.authenticated) {
        return res.redirect('/?error=invalid');
    }
    next();
});

// serve static frontend assets from reefer structure
app.use('/reefer', express.static(reeferRootDir));
app.use('/js', express.static(path.join(reeferWebsiteDir, 'js')));
app.use('/css', express.static(path.join(reeferWebsiteDir, 'css')));
app.use('/assets', express.static(path.join(reeferWebsiteDir, 'assets')));
app.use('/IMG', express.static(path.join(reeferWebsiteDir, 'assets', 'images')));
app.use('/docs/iso', express.static(isoUploadDir));
app.use('/docs', express.static(reeferDocsDir));

// serve public website as the root page
app.get('/', (req, res) => {
    res.sendFile(path.join(reeferWebsiteDir, 'index.html'));
});

// keep legacy internal route path unchanged
app.get('/internal.html', (req, res) => {
    res.sendFile(reeferLoginPagePath);
});

app.post('/login', async (req, res) => {
    const { id, pass } = req.body;
    console.log('Login attempt:', id);
    try {
        // query database for user
        const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [id]);
        if (rows.length && rows[0].password === pass) {
            req.session.authenticated = true;
            req.session.user = id;
            console.log('Login successful for:', id);
            return res.redirect('/internal.html');
        }
        // fallback to in-memory list if not found in DB
        if (users[id] && users[id] === pass) {
            req.session.authenticated = true;
            req.session.user = id;
            console.log('Login successful (fallback) for:', id);
            return res.redirect('/internal.html');
        }
    } catch (err) {
        console.error('DB error during login:', err);
    }
    console.log('Login failed for:', id);
    res.redirect('/?error=invalid');
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.get('/me', (req, res) => {
    if (!req.session.authenticated || !req.session.user) {
        return res.json({ user: null });
    }
    res.json({ user: req.session.user });
});

app.get('/api/team', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT name, role, role_group, image_path, description FROM staff ORDER BY role_group DESC, sort_order ASC'
        );
        res.json(rows);
    } catch (err) {
        console.error('DB error fetching team:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Fetch images with optional filtering by path or category

app.get('/api/images', async (req, res) => {
    try {
        const requestedPath = (req.query.path || '').trim();
        const category = (req.query.category || '').trim();

        let rows;
        if (requestedPath) {
            const pathCandidates = [
                'SELECT * FROM images WHERE LOWER(REPLACE(path, "\\\\", "/")) = LOWER(REPLACE(?, "\\\\", "/"))',
                'SELECT * FROM images WHERE LOWER(REPLACE(filepath, "\\\\", "/")) = LOWER(REPLACE(?, "\\\\", "/"))',
                'SELECT * FROM images WHERE LOWER(REPLACE(image_path, "\\\\", "/")) = LOWER(REPLACE(?, "\\\\", "/"))',
                'SELECT * FROM images WHERE LOWER(REPLACE(url, "\\\\", "/")) = LOWER(REPLACE(?, "\\\\", "/"))',
                'SELECT * FROM images WHERE LOWER(filename) = LOWER(?)'
            ];

            for (const sql of pathCandidates) {
                try {
                    const lookupValue = /filename/i.test(sql)
                        ? requestedPath.split(/\\|\//).pop()
                        : requestedPath;
                    [rows] = await pool.query(sql, [lookupValue]);
                    if (rows.length) break;
                } catch (queryErr) {
                    if (queryErr.code !== 'ER_BAD_FIELD_ERROR') {
                        throw queryErr;
                    }
                }
            }

            rows = rows || [];
        } else if (category) {
            [rows] = await pool.query(
                `SELECT
                    id,
                    path AS image_path,
                    alt_text,
                    category,
                    filename,
                    created_at
                 FROM images
                 WHERE LOWER(TRIM(category)) = LOWER(TRIM(?))
                 ORDER BY id ASC`,
                [category]
            );
        } else {
            [rows] = await pool.query(
                `SELECT
                    id,
                    path AS image_path,
                    alt_text,
                    category,
                    filename,
                    created_at
                 FROM images
                 ORDER BY id ASC`
            );
        }
        res.json(rows);
    } catch (err) {
        console.error('DB error fetching images:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Fetch all documents from the database
app.get('/api/docs', async (req, res) => {
    if (!req.session.authenticated) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const category = (req.query.category || '').trim();
        const categoryClause = category ? ' WHERE LOWER(TRIM(category)) = LOWER(TRIM(?))' : '';
        const queryParams = category ? [category] : [];

        const candidateQueries = [
            `SELECT title, path AS path, category FROM documents${categoryClause}`,
            `SELECT title, filepath AS path, category FROM documents${categoryClause}`,
            `SELECT title, path AS path, category FROM DOCS${categoryClause}`,
            `SELECT title, filepath AS path, category FROM DOCS${categoryClause}`
        ];

        for (const sql of candidateQueries) {
            try {
                const [rows] = await pool.query(sql, queryParams);
                return res.json(rows);
            } catch (queryErr) {
                if (queryErr.code !== 'ER_BAD_FIELD_ERROR' && queryErr.code !== 'ER_NO_SUCH_TABLE') {
                    throw queryErr;
                }
            }
        }

        return res.status(500).json({ error: 'Documents table/columns not found. Expected documents or DOCS with path/filepath.' });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;

(async function bootstrap() {
    try {
        await normalizeDbPaths();
    } catch (err) {
        console.error('DB path normalization failed:', err);
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT  }`);
    });
})();
