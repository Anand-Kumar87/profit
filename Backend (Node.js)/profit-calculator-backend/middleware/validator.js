// middleware/validator.js

/**
 * Validate user registration request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;
  
  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  
  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }
  
  next();
};

/**
 * Validate user login request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  
  next();
};

/**
 * Validate transaction data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateTransaction = (req, res, next) => {
  const { description, amount, date, type } = req.body;
  
  // Validate required fields
  if (!description || amount === undefined || !date || !type) {
    return res.status(400).json({ message: 'Description, amount, date, and type are required' });
  }
  
  // Validate amount
  if (isNaN(parseFloat(amount))) {
    return res.status(400).json({ message: 'Amount must be a number' });
  }
  
  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({ message: 'Date must be in YYYY-MM-DD format' });
  }
  
  // Validate type
  if (type !== 'revenue' && type !== 'expense') {
    return res.status(400).json({ message: 'Type must be either "revenue" or "expense"' });
  }
  
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateTransaction
};