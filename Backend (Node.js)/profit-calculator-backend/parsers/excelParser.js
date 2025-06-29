// parsers/excelParser.js
const XLSX = require('xlsx');
const { normalizeTransactionData } = require('../utils/dataFormatter');

/**
 * Parse Excel files (.xlsx, .xls) and extract transaction data
 * @param {string} filePath - Path to the uploaded Excel file
 * @returns {Array} - Array of normalized transaction objects
 */
const parseExcelFile = (filePath) => {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    
    // Get the first sheet name
    const sheetName = workbook.SheetNames[0];
    
    // Get the worksheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert sheet to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    
    // Check if data exists
    if (!rawData || rawData.length === 0) {
      throw new Error('No data found in Excel file');
    }
    
    // Detect column structure
    const firstRow = rawData[0];
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
    const transactions = rawData.map((row, index) => {
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
        id: `excel-${index}-${Date.now()}`,
        date: dateColumn && row[dateColumn] ? new Date(row[dateColumn]) : new Date(),
        description: descriptionColumn && row[descriptionColumn] ? 
                    row[descriptionColumn].toString() : `Transaction ${index + 1}`,
        amount: Math.abs(amount), // Store absolute value
        type: type,
        category: row.category || 'Other'
      };
    });
    
    // Normalize and return the data
    return normalizeTransactionData(transactions);
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
};

module.exports = {
  parseExcelFile
};