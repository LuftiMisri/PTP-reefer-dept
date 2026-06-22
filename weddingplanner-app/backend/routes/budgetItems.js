const express = require('express');
const budgetItemController = require('../controllers/budgetItemController');

const router = express.Router();

router.post('/', budgetItemController.create);
router.put('/:id', budgetItemController.update);
router.delete('/:id', budgetItemController.remove);

module.exports = router;
