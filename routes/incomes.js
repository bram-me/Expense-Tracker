const express = require('express');
const router = express.Router();
const { Income } = require('../models');
const { verifyToken } = require('../middleware/auth');

// Get all incomes
router.get('/', verifyToken, async (req, res) => {
  try {
    const incomes = await Income.findAll();
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incomes' });
  }
});

// Create a new income
router.post('/', verifyToken, async (req, res) => {
  try {
    const income = await Income.create(req.body);
    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create income' });
  }
});

// Update an existing income
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const income = await Income.findByPk(req.params.id);
    if (!income) return res.status(404).json({ error: 'Income not found' });
    await income.update(req.body);
    res.json(income);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update income' });
  }
});

// Delete an income
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const income = await Income.findByPk(req.params.id);
    if (!income) return res.status(404).json({ error: 'Income not found' });
    await income.destroy();
    res.json({ message: 'Income deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete income' });
  }
});

module.exports = router;
