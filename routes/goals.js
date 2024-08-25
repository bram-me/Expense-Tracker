const express = require('express');
const router = express.Router();
const { FinancialGoal } = require('../models');
const { verifyToken } = require('../middleware/auth'); // Ensure correct path

// Get all financial goals
router.get('/', verifyToken, async (req, res) => {
  try {
    const goals = await FinancialGoal.findAll();
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// Create a new financial goal
router.post('/', verifyToken, async (req, res) => {
  try {
    const goal = await FinancialGoal.create(req.body);
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// Update an existing financial goal
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const goal = await FinancialGoal.findByPk(req.params.id);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    await goal.update(req.body);
    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// Delete a financial goal
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const goal = await FinancialGoal.findByPk(req.params.id);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    await goal.destroy();
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

module.exports = router;
