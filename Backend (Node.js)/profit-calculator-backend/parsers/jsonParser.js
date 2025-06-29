// parsers/jsonParser.js
const fs = require('fs');
const { normalizeTransactionData } = require('../utils/dataFormatter');

/**
 * Parse JSON files and extract transaction data
 * @param {string} filePath - Path to the uploaded JSON file
 * @returns {Array} - Array of normalized transaction objects
 */
const parseJSONFile = (filePath) => {
  try {
    // Read and parse JSON file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    // Check if data exists
    if (!data) {
      throw new Error('No data found in JSON file');
    }
    
    // Handle different JSON structures
    let transactions = [];
    
    // If data is an array, assume it's an array of transactions
    if (Array.isArray(data)) {
      transactions = data;
    } 
    // If data has a transactions property that is an array
    else if (data.transactions && Array.isArray(data.transactions)) {
      transactions = data.transactions;
    }
    // If data has a data property that is an array
    else if (data.data && Array.isArray(data.data)) {
      transactions = data.data;
    }
    // If data is an object with multiple properties, try to extract transactions
    else if (typeof data === 'object') {
      // Look for arrays in the object
      for (const key in data) {
        if (Array.isArray(data[key]) && data[key].length > 0) {
          // Check if array items look like transactions
          const firstItem = data[key][0];
          if (firstItem && (
              firstItem.amount !== undefined || 
              firstItem.description !== undefined || 
              firstItem.date !== undefined
          )) {
            transactions = data[key];
            break;
          }
        }
      }
      
      // If no arrays found, treat the object itself as a single transaction
      if (transactions.length === 0 && (
          data.amount !== undefined || 
          data.description !== undefined || 
          data.date !== undefined
      )) {
        transactions = [data];
      }
    }
    
    // If still no transactions found, throw error
    if (transactions.length === 0) {
      throw new Error('No transaction data found in JSON file');
    }
    
    // Map transactions to standard format
    const mappedTransactions = transactions.map((transaction, index) => {
      // Determine transaction type
      let type = transaction.type || 'expense';
      if (typeof type === 'string') {
        type = type.toLowerCase();
        if (type.includes('income') || type.includes('revenue') || type.includes('credit')) {
          type = 'revenue';
        } else if (type.includes('expense') || type.includes('debit')) {
          type = 'expense';
        }
      }
      
      // Extract amount
      let amount = 0;
      if (transaction.amount !== undefined) {
        if (typeof transaction.amount === 'string') {
          amount = parseFloat(transaction.amount.replace(/[^\d.-]/g, ''));
        } else {
          amount = parseFloat(transaction.amount);
        }
        
        // If type is not explicitly defined, try to determine from amount sign
        if (!transaction.type && amount !== 0) {
          type = amount > 0 ? 'revenue' : 'expense';
        }
      }
      
      // Create transaction object
      return {
        id: transaction.id || `json-${index}-${Date.now()}`,
        date: transaction.date ? new Date(transaction.date) : new Date(),
        description: transaction.description || transaction.name || transaction.title || `Transaction ${index + 1}`,
        amount: Math.abs(amount), // Store absolute value
        type: type,
        category: transaction.category || 'Other'
      };
    });
    
    // Normalize and return the data
    return normalizeTransactionData(mappedTransactions);
  } catch (error) {
    console.error('Error parsing JSON file:', error);
    throw new Error(`Failed to parse JSON file: ${error.message}`);
  }
};

module.exports = {
  parseJSONFile
};