// parsers/csvParser.js
const fs = require('fs');
const csv = require('csv-parser');
const { normalizeTransactionData } = require('../utils/dataFormatter');

/**
 * Parse CSV files and extract transaction data
 * @param {string} filePath - Path to the uploaded CSV file
 * @returns {Promise<Array>} - Promise resolving to array of normalized transaction objects
 */
const parseCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        try {
          // Check if data exists
          if (!results || results.length === 0) {
            throw new Error('No data found in CSV file');
          }
          
          // Detect column structure
          const firstRow = results[0];
          const columns = Object.keys(firstRow);
          
          // Try to identify key columns
          const dateColumn = columns.find(col => 
            col.toLowerCase().includes('date') || 
            col.toLowerCase().includes('time')
          );
          
          const descriptionColumn = columns.find(col => 
            col.toLowerCase().includes('desc') || 
            col.toLowerCase().includes('narration') || 
            col.toLowerCase().includes('particular')
          );
          
          const amountColumn = columns.find(col => 
            col.toLowerCase().includes('amount') || 
            col.toLowerCase().includes('value') || 
            col.toLowerCase().includes('sum')
          );
          
          const typeColumn = columns.find(col => 
            col.toLowerCase().includes('type') || 
            col.toLowerCase().includes('category')
          );
          
          // Map data to standard format
          const transactions = results.map((row, index) => {
            // Determine transaction type
            let type = 'expense';
            let amount = 0;
            
            if (typeColumn && row[typeColumn]) {
              const typeValue = row[typeColumn].toString().toLowerCase();
              type = typeValue.includes('income') || 
                     typeValue.includes('revenue') || 
                     typeValue.includes('credit') ? 'revenue' : 'expense';
            }
            
            // Extract amount
            if (amountColumn && row[amountColumn] !== undefined) {
              // Try to parse amount
              amount = parseFloat(row[amountColumn].toString().replace(/[^\d.-]/g, ''));
              
              // If type is not explicitly defined, try to determine from amount sign
              if (!typeColumn && amount !== 0) {
                type = amount > 0 ? 'revenue' : 'expense';
              }
            }
            
            // Create transaction object
            return {
              id: `csv-${index}-${Date.now()}`,
              date: dateColumn && row[dateColumn] ? new Date(row[dateColumn]) : new Date(),
              description: descriptionColumn && row[descriptionColumn] ? 
                          row[descriptionColumn].toString() : `Transaction ${index + 1}`,
              amount: Math.abs(amount), // Store absolute value
              type: type,
              category: row.category || 'Other'
            };
          });
          
          // Normalize and return the data
          resolve(normalizeTransactionData(transactions));
        } catch (error) {
          console.error('Error parsing CSV file:', error);
          reject(new Error(`Failed to parse CSV file: ${error.message}`));
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        reject(new Error(`Failed to read CSV file: ${error.message}`));
      });
  });
};

module.exports = {
  parseCSVFile
};