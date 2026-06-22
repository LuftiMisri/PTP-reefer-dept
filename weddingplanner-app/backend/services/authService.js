const bcrypt = require('bcrypt');
const db = require('../config/db');
const defaultCategories = require('../utils/defaultCategories');

const SALT_ROUNDS = 10;

async function createUser({ email, password, partnerName1, partnerName2, weddingDate }) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [result] = await db.query(
    `INSERT INTO users (email, password_hash, partner_name_1, partner_name_2, wedding_date)
     VALUES (?, ?, ?, ?, ?)`,
    [email, passwordHash, partnerName1 || null, partnerName2 || null, weddingDate || null]
  );

  const userId = result.insertId;

  const categoryRows = defaultCategories.map((name) => [userId, name]);
  await db.query('INSERT INTO categories (user_id, name) VALUES ?', [categoryRows]);

  return { id: userId, email };
}

async function findUserByEmail(email) {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

async function verifyPassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

module.exports = { createUser, findUserByEmail, verifyPassword };
