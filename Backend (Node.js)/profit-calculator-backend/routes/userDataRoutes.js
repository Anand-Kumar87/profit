// routes/userDataRoutes.js
const express = require('express');
const {
  getUserData,
  saveUserData,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  updateSettings
} = require('../controllers/userDataController');
const { authenticateToken } = require('../middleware/auth');
const { validateTransaction } = require('../middleware/validator');

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

// User data routes
router.get('/data', getUserData);
router.post('/data', saveUserData);

// Transaction routes
router.post('/transactions', validateTransaction, addTransaction);
router.put('/transactions/:id', validateTransaction, updateTransaction);
router.delete('/transactions/:id', deleteTransaction);

// Settings routes
router.put('/settings', updateSettings);

module.exports = router;