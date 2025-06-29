// src/utils/validators.js

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with strength score and feedback
 */
export const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      score: 0,
      feedback: 'Password is required'
    };
  }
  
  let score = 0;
  const feedback = [];
  
  // Length check
  if (password.length < 6) {
    feedback.push('Password should be at least 6 characters long');
  } else {
    score += 1;
  }
  
  // Contains number
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add numbers for stronger password');
  }
  
  // Contains lowercase
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add lowercase letters for stronger password');
  }
  
  // Contains uppercase
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add uppercase letters for stronger password');
  }
  
  // Contains special character
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add special characters for stronger password');
  }
  
  return {
    isValid: score >= 3,
    score,
    feedback: feedback.length > 0 ? feedback.join('. ') : 'Password is strong'
  };
};

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} date - Date string to validate
 * @returns {boolean} - True if date is valid
 */
export const isValidDate = (date) => {
  // Check format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }
  
  // Check if date is valid
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @returns {boolean} - True if file type is valid
 */
export const isValidFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSize - Maximum size in bytes
 * @returns {boolean} - True if file size is valid
 */
export const isValidFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

/**
 * Validate transaction object
 * @param {Object} transaction - Transaction object to validate
 * @returns {Object} - Validation result
 */
export const validateTransaction = (transaction) => {
  const errors = {};
  
  // Validate description
  if (!transaction.description) {
    errors.description = 'Description is required';
  }
  
  // Validate amount
  if (transaction.amount === undefined || transaction.amount === null) {
    errors.amount = 'Amount is required';
  } else if (isNaN(parseFloat(transaction.amount))) {
    errors.amount = 'Amount must be a number';
  }
  
  // Validate date
  if (!transaction.date) {
    errors.date = 'Date is required';
  } else if (!isValidDate(transaction.date)) {
    errors.date = 'Invalid date format (use YYYY-MM-DD)';
  }
  
  // Validate type
  if (!transaction.type) {
    errors.type = 'Type is required';
  } else if (transaction.type !== 'revenue' && transaction.type !== 'expense') {
    errors.type = 'Type must be either "revenue" or "expense"';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};