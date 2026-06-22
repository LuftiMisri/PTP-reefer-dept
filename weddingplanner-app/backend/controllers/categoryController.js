const categoryService = require('../services/categoryService');
const asyncHandler = require('../utils/asyncHandler');

async function list(req, res) {
  const categories = await categoryService.listCategoriesWithItems(req.session.userId);
  res.json(categories);
}

async function getOne(req, res) {
  const category = await categoryService.getCategoryWithItems(req.params.id, req.session.userId);
  if (!category) return res.status(404).json({ error: 'Category not found.' });
  res.json(category);
}

async function rename(req, res) {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'name is required.' });
  }

  const category = await categoryService.renameCategory(req.params.id, req.session.userId, name.trim());
  if (!category) return res.status(404).json({ error: 'Category not found.' });
  res.json(category);
}

module.exports = {
  list: asyncHandler(list),
  getOne: asyncHandler(getOne),
  rename: asyncHandler(rename),
};
