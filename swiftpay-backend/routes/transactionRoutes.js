const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// The route maps exactly to the controller's transferMoney function
router.post('/transfer', transactionController.transferMoney);

// Optional: create a simple GET route to fetch users and their wallets for the Demo UI
router.get('/users', async (req, res) => {
  const { User, Wallet } = require('../models');
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email'],
      include: [{
        model: Wallet,
        attributes: ['balance']
      }]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Optional: create a GET route to fetch transactions
router.get('/transactions', async (req, res) => {
  const { Transaction } = require('../models');
  try {
    const tx = await Transaction.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;