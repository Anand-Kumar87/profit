// parsers/xmlParser.js
const fs = require('fs');
const xml2js = require('xml2js');
const { normalizeTransactionData } = require('../utils/dataFormatter');

/**
 * Parse XML files and extract transaction data
 * @param {string} filePath - Path to the uploaded XML file
 * @returns {Promise<Array>} - Promise resolving to array of normalized transaction objects
 */
const parseXMLFile = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      // Read XML file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Create XML parser
      const parser = new xml2js.Parser({
        explicitArray: false,
        mergeAttrs: true
      });
      
      // Parse XML
      parser.parseString(fileContent, (err, result) => {
        if (err) {
          console.error('Error parsing XML:', err);
          return reject(new Error(`Failed to parse XML: ${err.message}`));
        }
        
        try {
          // Check if result exists
          if (!result) {
            throw new Error('No data found in XML file');
          }
          
          // Extract transactions from various possible XML structures
          let transactions = [];
          
          // Common XML structures for financial data
          if (result.transactions && result.transactions.transaction) {
            // Direct transaction array
            transactions = Array.isArray(result.transactions.transaction) ? 
                          result.transactions.transaction : [result.transactions.transaction];
          } else if (result.data && result.data.transaction) {
            // Nested in data element
            transactions = Array.isArray(result.data.transaction) ? 
                          result.data.transaction : [result.data.transaction];
          } else if (result.financialData && result.financialData.entries) {
            // Financial data format
            transactions = Array.isArray(result.financialData.entries.entry) ? 
                          result.financialData.entries.entry : [result.financialData.entries.entry];
          } else {
            // Search for any array that might contain transactions
            const searchForTransactions = (obj, path = '') => {
              if (!obj || typeof obj !== 'object') return;
              
              for (const key in obj) {
                const newPath = path ? `${path}.${key}` : key;
                
                if (Array.isArray(obj[key])) {
                  // Check if array items look like transactions
                  if (obj[key].length > 0 && (
                      obj[key][0].amount !== undefined || 
                      obj[key][0].description !== undefined || 
                      obj[key][0].date !== undefined
                  )) {
                    transactions = obj[key];
                    return;
                  }
                } else if (typeof obj[key] === 'object') {
                  // If it's a single object that looks like a transaction
                  if (obj[key].amount !== undefined || 
                      obj[key].description !== undefined || 
                      obj[key].date !== undefined) {
                    transactions = [obj[key]];
                    return;
                  }
                  
                  // Continue searching deeper
                  searchForTransactions(obj[key], newPath);
                  
                  // If transactions found, stop searching
                  if (transactions.length > 0) return;
                }
              }
            };
            
            searchForTransactions(result);
          }
          
          // If still no transactions found, throw error
          if (transactions.length === 0) {
            throw new Error('No transaction data found in XML file');
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
              id: transaction.id || `xml-${index}-${Date.now()}`,
              date: transaction.date ? new Date(transaction.date) : new Date(),
              description: transaction.description || transaction.name || transaction.title || `Transaction ${index + 1}`,
              amount: Math.abs(amount), // Store absolute value
              type: type,
              category: transaction.category || 'Other'
            };
          });
          
          // Normalize and return the data
          resolve(normalizeTransactionData(mappedTransactions));
        } catch (error) {
          console.error('Error processing XML data:', error);
          reject(new Error(`Failed to process XML data: ${error.message}`));
        }
      });
    } catch (error) {
      console.error('Error reading XML file:', error);
      reject(new Error(`Failed to read XML file: ${error.message}`));
    }
  });
};

module.exports = {
  parseXMLFile
};