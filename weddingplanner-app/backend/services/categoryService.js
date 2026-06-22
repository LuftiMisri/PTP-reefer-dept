const db = require('../config/db');

async function listCategoriesWithItems(userId) {
  const [categories] = await db.query(
    'SELECT id, name FROM categories WHERE user_id = ? ORDER BY id',
    [userId]
  );

  const [items] = await db.query(
    `SELECT bi.* FROM budget_items bi
     JOIN categories c ON bi.category_id = c.id
     WHERE c.user_id = ?
     ORDER BY bi.id`,
    [userId]
  );

  return categories.map((category) => ({
    ...category,
    items: items.filter((item) => item.category_id === category.id),
  }));
}

async function getCategoryForUser(categoryId, userId) {
  const [rows] = await db.query(
    'SELECT id, name FROM categories WHERE id = ? AND user_id = ?',
    [categoryId, userId]
  );
  return rows[0] || null;
}

async function getCategoryWithItems(categoryId, userId) {
  const category = await getCategoryForUser(categoryId, userId);
  if (!category) return null;

  const [items] = await db.query(
    'SELECT * FROM budget_items WHERE category_id = ? ORDER BY id',
    [categoryId]
  );

  return { ...category, items };
}

async function renameCategory(categoryId, userId, name) {
  const category = await getCategoryForUser(categoryId, userId);
  if (!category) return null;

  await db.query('UPDATE categories SET name = ? WHERE id = ?', [name, categoryId]);
  return { id: category.id, name };
}

module.exports = { listCategoriesWithItems, getCategoryForUser, getCategoryWithItems, renameCategory };
