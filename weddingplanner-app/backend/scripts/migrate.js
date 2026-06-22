require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'config', 'schema.sql'), 'utf8');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  await connection.query(sql);

  // Idempotent column addition for databases created before this column existed.
  const [columns] = await connection.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = 'weddingplanner' AND TABLE_NAME = 'budget_items' AND COLUMN_NAME = 'remark'`
  );
  if (columns.length === 0) {
    await connection.query('ALTER TABLE weddingplanner.budget_items ADD COLUMN remark TEXT');
    console.log('Added remark column to budget_items.');
  }

  console.log('Migration complete: database and tables are ready.');
  await connection.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
