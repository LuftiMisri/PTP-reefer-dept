const express = require('express');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

router.get('/', categoryController.list);
router.get('/:id', categoryController.getOne);
router.put('/:id', categoryController.rename);

module.exports = router;
