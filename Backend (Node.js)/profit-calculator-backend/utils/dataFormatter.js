// utils/dataFormatter.js

/**
 * Normalize transaction data to ensure consistent structure and format
 * @param {Array} transactions - Array of transaction objects
 * @returns {Array} - Array of normalized transaction objects
 */
const normalizeTransactionData = (transactions) => {
  if (!Array.isArray(transactions)) {
    throw new Error('Input must be an array of transactions');
  }
  
  return transactions.map(transaction => {
    // Ensure all required fields exist
    const normalizedTransaction = {
      id: transaction.id || `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: ensureValidDate(transaction.date),
      description: ensureString(transaction.description, 'Transaction'),
      amount: ensurePositiveNumber(transaction.amount),
      type: normalizeTransactionType(transaction.type),
      category: ensureString(transaction.category, 'Other')
    };
    
    // Ensure amount sign matches type
    if (normalizedTransaction.type === 'expense') {
      normalizedTransaction.amount = -Math.abs(normalizedTransaction.amount);
    } else {
      normalizedTransaction.amount = Math.abs(normalizedTransaction.amount);
    }
    
    return normalizedTransaction;
  });
};

/**
 * Ensure value is a valid date
 * @param {*} date - Date value to validate
 * @returns {string} - ISO date string
 */
const ensureValidDate = (date) => {
  if (!date) {
    return new Date().toISOString().split('T')[0];
  }
  
  try {
    const dateObj = new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    return new Date().toISOString().split('T')[0];
  }
};

/**
 * Ensure value is a string
 * @param {*} value - Value to validate
 * @param {string} defaultValue - Default value if invalid
 * @returns {string} - Validated string
 */
const ensureString = (value, defaultValue = '') => {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  
  return String(value);
};

/**
 * Ensure value is a positive number
 * @param {*} value - Value to validate
 * @returns {number} - Positive number
 */
const ensurePositiveNumber = (value) => {
  if (value === undefined || value === null) {
    return 0;
  }
  
  let number;
  
  if (typeof value === 'string') {
    // Remove currency symbols and commas
    const cleanValue = value.replace(/[$€£¥₹,]/g, '');
    number = parseFloat(cleanValue);
  } else {
    number = parseFloat(value);
  }
  
  if (isNaN(number)) {
    return 0;
  }
  
  return Math.abs(number);
};

/**
 * Normalize transaction type to either 'revenue' or 'expense'
 * @param {*} type - Transaction type to normalize
 * @returns {string} - Normalized type ('revenue' or 'expense')
 */
const normalizeTransactionType = (type) => {
  if (!type) {
    return 'expense'; // Default to expense
  }
  
  const typeStr = String(type).toLowerCase();
  
  // Check for revenue-related terms
  if (typeStr.includes('revenue') || 
      typeStr.includes('income') || 
      typeStr.includes('credit') || 
      typeStr.includes('deposit') || 
      typeStr.includes('sale') || 
      typeStr.includes('inflow') || 
      typeStr === 'r' || 
      typeStr === 'in') {
    return 'revenue';
  }
  
  // Check for expense-related terms
  if (typeStr.includes('expense') || 
      typeStr.includes('debit') || 
      typeStr.includes('payment') || 
      typeStr.includes('withdrawal') || 
      typeStr.includes('purchase') || 
      typeStr.includes('outflow') || 
      typeStr === 'e' || 
      typeStr === 'out') {
    return 'expense';
  }
  
  // Default to expense
  return 'expense';
};

/**
 * Detect and categorize transactions based on description
 * @param {Array} transactions - Array of transaction objects
 * @returns {Array} - Array of transactions with categories
 */
const categorizeTranactions = (transactions) => {
  return transactions.map(transaction => {
    // Skip if already categorized
    if (transaction.category && transaction.category !== 'Other') {
      return transaction;
    }
    
    const description = transaction.description.toLowerCase();
    let category = 'Other';
    
    // Revenue categories
    if (transaction.type === 'revenue') {
      if (description.includes('sale') || 
          description.includes('order') || 
          description.includes('customer') || 
          description.includes('invoice')) {
        category = 'Sales';
      } else if (description.includes('service') || 
                description.includes('consulting') || 
                description.includes('fee')) {
        category = 'Services';
      } else if (description.includes('interest') || 
                description.includes('dividend') || 
                description.includes('investment')) {
        category = 'Investments';
      }
    } 
    // Expense categories
    else {
      if (description.includes('salary') || 
          description.includes('payroll') || 
          description.includes('wage')) {
        category = 'Salaries';
      } else if (description.includes('rent') || 
                description.includes('lease')) {
        category = 'Rent';
      } else if (description.includes('electric') || 
                description.includes('water') || 
                description.includes('gas') || 
                description.includes('internet') || 
                description.includes('phone')) {
        category = 'Utilities';
      } else if (description.includes('office') || 
                description.includes('supplies') || 
                description.includes('equipment')) {
        category = 'Supplies';
      } else if (description.includes('ad') || 
                description.includes('marketing') || 
                description.includes('promotion')) {
        category = 'Marketing';
      } else if (description.includes('insurance')) {
        category = 'Insurance';
      } else if (description.includes('tax')) {
        category = 'Taxes';
      }
    }
    
    return {
      ...transaction,
      category
    };
  });
};

module.exports = {
  normalizeTransactionData,
  ensureValidDate,
  ensureString,
  ensurePositiveNumber,
  normalizeTransactionType,
  categorizeTranactions
};