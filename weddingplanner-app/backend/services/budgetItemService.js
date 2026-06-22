const db = require('../config/db');
const categoryService = require('./categoryService');

const STATUSES = ['Not Started', 'In Progress', 'Done'];

function computePending(actual, paid) {
  const pending = Number(actual || 0) - Number(paid || 0);
  return pending > 0 ? pending : 0;
}

async function createItem(categoryId, userId, data) {
  const category = await categoryService.getCategoryForUser(categoryId, userId);
  if (!category) return null;

  const budgetAmount = Number(data.budgetAmount || 0);
  const actualAmount = Number(data.actualAmount || 0);
  const paidAmount = Number(data.paidAmount || 0);
  const pendingAmount = data.pendingAmount != null ? Number(data.pendingAmount) : computePending(actualAmount, paidAmount);
  const status = STATUSES.includes(data.status) ? data.status : 'Not Started';

  const [result] = await db.query(
    `INSERT INTO budget_items
      (category_id, name, budget_amount, actual_amount, paid_amount, pending_amount, status, assignee, remark)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [categoryId, data.name, budgetAmount, actualAmount, paidAmount, pendingAmount, status, data.assignee || null, data.remark || null]
  );

  return getItemForUser(result.insertId, userId);
}

async function getItemForUser(itemId, userId) {
  const [rows] = await db.query(
    `SELECT bi.* FROM budget_items bi
     JOIN categories c ON bi.category_id = c.id
     WHERE bi.id = ? AND c.user_id = ?`,
    [itemId, userId]
  );
  return rows[0] || null;
}

async function updateItem(itemId, userId, data) {
  const existing = await getItemForUser(itemId, userId);
  if (!existing) return null;

  const name = data.name ?? existing.name;
  const budgetAmount = data.budgetAmount != null ? Number(data.budgetAmount) : existing.budget_amount;
  const actualAmount = data.actualAmount != null ? Number(data.actualAmount) : existing.actual_amount;
  const paidAmount = data.paidAmount != null ? Number(data.paidAmount) : existing.paid_amount;
  const pendingAmount = data.pendingAmount != null ? Number(data.pendingAmount) : computePending(actualAmount, paidAmount);
  const status = STATUSES.includes(data.status) ? data.status : existing.status;
  const assignee = data.assignee !== undefined ? data.assignee : existing.assignee;
  const remark = data.remark !== undefined ? data.remark : existing.remark;

  await db.query(
    `UPDATE budget_items
     SET name = ?, budget_amount = ?, actual_amount = ?, paid_amount = ?, pending_amount = ?, status = ?, assignee = ?, remark = ?
     WHERE id = ?`,
    [name, budgetAmount, actualAmount, paidAmount, pendingAmount, status, assignee, remark, itemId]
  );

  return getItemForUser(itemId, userId);
}

async function deleteItem(itemId, userId) {
  const existing = await getItemForUser(itemId, userId);
  if (!existing) return false;

  await db.query('DELETE FROM budget_items WHERE id = ?', [itemId]);
  return true;
}

module.exports = { createItem, updateItem, deleteItem, getItemForUser, STATUSES };
