// utils/validators.js

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} date - Date string to validate
 * @returns {boolean} - True if date is valid
 */
const isValidDate = (date) => {
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
 * @param {string} mimetype - File MIME type
 * @returns {boolean} - True if file type is valid
 */
const isValidFileType = (mimetype) => {
  const validTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/json',
    'application/xml',
    'text/xml',
    'application/pdf',
    'image/jpeg',
    'image/jpg'
  ];
  
  return validTypes.includes(mimetype);
};

/**
 * Validate transaction object
 * @param {Object} transaction - Transaction object to validate
 * @returns {Object} - Validation result
 */
const validateTransactionObject = (transaction) => {
  const errors = [];
  
  // Check required fields
  if (!transaction.description) {
    errors.push('Description is required');
  }
  
  if (transaction.amount === undefined) {
    errors.push('Amount is required');
  } else if (isNaN(parseFloat(transaction.amount))) {
    errors.push('Amount must be a number');
  }
  
  if (!transaction.date) {
    errors.push('Date is required');
  } else if (!isValidDate(transaction.date)) {
    errors.push('Date must be in YYYY-MM-DD format');
  }
  
  if (!transaction.type) {
    errors.push('Type is required');
  } else if (transaction.type !== 'revenue' && transaction.type !== 'expense') {
    errors.push('Type must be either "revenue" or "expense"');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  isValidEmail,
  isValidDate,
  isValidFileType,
  validateTransactionObject
};