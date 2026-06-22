const budgetItemService = require('../services/budgetItemService');
const asyncHandler = require('../utils/asyncHandler');

async function create(req, res) {
  const { categoryId, name } = req.body;
  if (!categoryId || !name) {
    return res.status(400).json({ error: 'categoryId and name are required.' });
  }

  const item = await budgetItemService.createItem(categoryId, req.session.userId, req.body);
  if (!item) return res.status(404).json({ error: 'Category not found.' });
  res.status(201).json(item);
}

async function update(req, res) {
  const item = await budgetItemService.updateItem(req.params.id, req.session.userId, req.body);
  if (!item) return res.status(404).json({ error: 'Budget item not found.' });
  res.json(item);
}

async function remove(req, res) {
  const deleted = await budgetItemService.deleteItem(req.params.id, req.session.userId);
  if (!deleted) return res.status(404).json({ error: 'Budget item not found.' });
  res.status(204).end();
}

module.exports = {
  create: asyncHandler(create),
  update: asyncHandler(update),
  remove: asyncHandler(remove),
};
