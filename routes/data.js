const express = require('express');
const { Income, Expense, FinancialGoal } = require('../models'); 

const router = express.Router();

// Route for adding an expense
router.post('/expenses', async (req, res) => {
  const { amount, date, category, userId } = req.body;
  
  try {
    const expense = await Expense.create({ amount, date, category, userId });
    res.json(expense);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Route for adding income
router.post('/incomes', async (req, res) => {
  const { amount, date, source, userId } = req.body;
  
  try {
    const income = await Income.create({ amount, date, source, userId });
    res.json(income);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Route for adding a financial goal
router.post('/goals', async (req, res) => {
  const { User_ID, Goal_Description, Target_Amount, Deadline_Date, Achieved } = req.body;
  
  try {
    const goal = await FinancialGoal.create({ User_ID, Goal_Description, Target_Amount, Deadline_Date, Achieved });
    res.json(goal);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
