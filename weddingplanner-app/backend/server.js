require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const db = require('./config/db');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const budgetItemRoutes = require('./routes/budgetItems');
const dashboardRoutes = require('./routes/dashboard');
const requireAuth = require('./middleware/requireAuth');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }, // 7 days
  })
);
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'landing', 'index.html'));
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', requireAuth, categoryRoutes);
app.use('/api/budget-items', requireAuth, budgetItemRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);

app.use(errorHandler);

async function start() {
  try {
    await db.query('SELECT 1');
    console.log('Connected to MySQL.');
  } catch (err) {
    console.error('Could not connect to MySQL:', err.message);
    console.error('Run `npm run migrate` after setting up backend/.env (copy from .env.example).');
  }

  app.listen(PORT, () => {
    console.log(`Wedding Planner server running at http://localhost:${PORT}`);
  });
}

start();
