// controllers/userDataController.js
const fs = require('fs');
const path = require('path');

// In a real app, this would be a database
// For this demo, we'll use a JSON file to store user data
const getDataFilePath = (userId) => {
  return path.join(__dirname, `../data/user_${userId}.json`);
};

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Get user data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserData = (req, res) => {
  try {
    const userId = req.user.id;
    const dataFilePath = getDataFilePath(userId);
    
    // Check if user data file exists
    if (!fs.existsSync(dataFilePath)) {
      // Return empty data if file doesn't exist
      return res.json({
        transactions: [],
        settings: {
          currency: 'USD',
          categories: [
            'Sales', 
            'Services', 
            'Investments', 
            'Other Income',
            'Salaries', 
            'Rent', 
            'Utilities', 
            'Supplies', 
            'Marketing', 
            'Insurance',
            'Taxes',
            'Other Expenses'
          ]
        }
      });
    }
    
    // Read user data
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const userData = JSON.parse(data);
    
    res.json(userData);
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Save user data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const saveUserData = (req, res) => {
  try {
    const userId = req.user.id;
    const { transactions, settings } = req.body;
    
    // Validate data
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ message: 'Invalid transactions data' });
    }
    
    // Create user data object
    const userData = {
      transactions,
      settings: settings || {
        currency: 'USD',
        categories: [
          'Sales', 
          'Services', 
          'Investments', 
          'Other Income',
          'Salaries', 
          'Rent', 
          'Utilities', 
          'Supplies', 
          'Marketing', 
          'Insurance',
          'Taxes',
          'Other Expenses'
        ]
      },
      lastUpdated: new Date().toISOString()
    };
    
    // Save user data
    const dataFilePath = getDataFilePath(userId);
    fs.writeFileSync(dataFilePath, JSON.stringify(userData, null, 2));
    
    res.json({
      message: 'Data saved successfully',
      lastUpdated: userData.lastUpdated
    });
  } catch (error) {
    console.error('Save user data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
/**
 * Add transaction
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addTransaction = (req, res) => {
  try {
    const userId = req.user.id;
    const transaction = req.body;
    
    // Validate transaction
    if (!transaction.description || 
        transaction.amount === undefined || 
        !transaction.date || 
        !transaction.type) {
      return res.status(400).json({ message: 'Missing required transaction fields' });
    }
    
    const dataFilePath = getDataFilePath(userId);
    
    // Initialize userData if file doesn't exist
    let userData = {
      transactions: [],
      settings: {
        currency: 'USD',
        categories: [
          'Sales', 
          'Services', 
          'Investments', 
          'Other Income',
          'Salaries', 
          'Rent', 
          'Utilities', 
          'Supplies', 
          'Marketing', 
          'Insurance',
          'Taxes',
          'Other Expenses'
        ]
      },
      lastUpdated: new Date().toISOString()
    };
    
    // Read existing data if file exists
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      userData = JSON.parse(data);
    }
    
    // Add ID and timestamp to transaction
    const newTransaction = {
      ...transaction,
      id: transaction.id || `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    // Add transaction to array
    userData.transactions.push(newTransaction);
    userData.lastUpdated = new Date().toISOString();
    
    // Save updated data
    fs.writeFileSync(dataFilePath, JSON.stringify(userData, null, 2));
    
    res.status(201).json({
      message: 'Transaction added successfully',
      transaction: newTransaction
    });
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update transaction
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateTransaction = (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updatedTransaction = req.body;
    
    // Validate transaction ID
    if (!id) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }
    
    const dataFilePath = getDataFilePath(userId);
    
    // Check if user data file exists
    if (!fs.existsSync(dataFilePath)) {
      return res.status(404).json({ message: 'No transactions found' });
    }
    
    // Read user data
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const userData = JSON.parse(data);
    
    // Find transaction index
    const transactionIndex = userData.transactions.findIndex(t => t.id === id);
    
    // Check if transaction exists
    if (transactionIndex === -1) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Update transaction
    userData.transactions[transactionIndex] = {
      ...userData.transactions[transactionIndex],
      ...updatedTransaction,
      updatedAt: new Date().toISOString()
    };
    
    userData.lastUpdated = new Date().toISOString();
    
    // Save updated data
    fs.writeFileSync(dataFilePath, JSON.stringify(userData, null, 2));
    
    res.json({
      message: 'Transaction updated successfully',
      transaction: userData.transactions[transactionIndex]
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete transaction
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteTransaction = (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // Validate transaction ID
    if (!id) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }
    
    const dataFilePath = getDataFilePath(userId);
    
    // Check if user data file exists
    if (!fs.existsSync(dataFilePath)) {
      return res.status(404).json({ message: 'No transactions found' });
    }
    
    // Read user data
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const userData = JSON.parse(data);
    
    // Find transaction
    const transaction = userData.transactions.find(t => t.id === id);
    
    // Check if transaction exists
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Remove transaction
    userData.transactions = userData.transactions.filter(t => t.id !== id);
    userData.lastUpdated = new Date().toISOString();
    
    // Save updated data
    fs.writeFileSync(dataFilePath, JSON.stringify(userData, null, 2));
    
    res.json({
      message: 'Transaction deleted successfully',
      transactionId: id
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user settings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateSettings = (req, res) => {
  try {
    const userId = req.user.id;
    const { settings } = req.body;
    
    // Validate settings
    if (!settings) {
      return res.status(400).json({ message: 'Settings are required' });
    }
    
    const dataFilePath = getDataFilePath(userId);
    
    // Initialize userData if file doesn't exist
    let userData = {
      transactions: [],
      settings: {
        currency: 'USD',
        categories: [
          'Sales', 
          'Services', 
          'Investments', 
          'Other Income',
          'Salaries', 
          'Rent', 
          'Utilities', 
          'Supplies', 
          'Marketing', 
          'Insurance',
          'Taxes',
          'Other Expenses'
        ]
      },
      lastUpdated: new Date().toISOString()
    };
    
    // Read existing data if file exists
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      userData = JSON.parse(data);
    }
    
    // Update settings
    userData.settings = {
      ...userData.settings,
      ...settings
    };
    
    userData.lastUpdated = new Date().toISOString();
    
    // Save updated data
    fs.writeFileSync(dataFilePath, JSON.stringify(userData, null, 2));
    
    res.json({
      message: 'Settings updated successfully',
      settings: userData.settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserData,
  saveUserData,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  updateSettings
};