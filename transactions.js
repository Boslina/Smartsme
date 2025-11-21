const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// GET all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new transaction
router.post('/', async (req, res) => {
  try {
    const { description, amount, category, date } = req.body;
    
    const transaction = new Transaction({
      description,
      amount,
      category,
      date: date || new Date()
    });
    
    const savedTransaction = await transaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE transaction
router.delete('/:id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
