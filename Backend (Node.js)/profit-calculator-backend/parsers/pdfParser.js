// parsers/pdfParser.js
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { normalizeTransactionData } = require('../utils/dataFormatter');

/**
 * Parse PDF files and extract transaction data
 * @param {string} filePath - Path to the uploaded PDF file
 * @returns {Promise<Array>} - Promise resolving to array of normalized transaction objects
 */
const parsePDFFile = async (filePath) => {
  try {
    // Read PDF file
    const dataBuffer = fs.readFileSync(filePath);
    
    // Parse PDF
    const data = await pdfParse(dataBuffer);
    
    // Extract text content
    const text = data.text;
    
    // Check if text exists
    if (!text || text.trim() === '') {
      throw new Error('No text content found in PDF file');
    }
    
    // Split text into lines
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // Try to identify table structure
    const transactions = [];
    
    // Regular expressions for common patterns
    const dateRegex = /\b(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4}|\d{4}[-/\.]\d{1,2}[-/\.]\d{1,2})\b/;
    const amountRegex = /\$?\s?(\d{1,3}(,\d{3})*(\.\d{2})?|\d+(\.\d{2})?)/;
    const currencySymbolRegex = /[$€£¥₹]/;
    
    // Try to identify header row
    let headerRow = -1;
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].toLowerCase();
      if ((line.includes('date') && line.includes('amount')) || 
          (line.includes('date') && line.includes('description')) ||
          (line.includes('transaction') && line.includes('amount'))) {
        headerRow = i;
        break;
      }
    }
    
    // Process lines after header row
    for (let i = (headerRow !== -1 ? headerRow + 1 : 0); i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip short lines or lines that look like headers/footers
      if (line.length < 10 || line.includes('page') || line.includes('total')) {
        continue;
      }
      
      // Try to extract date
      const dateMatch = line.match(dateRegex);
      
      // Try to extract amount
      const amountMatch = line.match(amountRegex);
      
      if (dateMatch && amountMatch) {
        // Extract date
        const dateStr = dateMatch[0];
        
        // Extract amount
        let amountStr = amountMatch[0];
        let amount = parseFloat(amountStr.replace(/[$,]/g, ''));
        
        // Determine transaction type based on context
        let type = 'expense';
        
        // Check for keywords indicating revenue
        if (line.toLowerCase().includes('income') || 
            line.toLowerCase().includes('revenue') || 
            line.toLowerCase().includes('credit') ||
            line.toLowerCase().includes('deposit') ||
            line.toLowerCase().includes('received')) {
          type = 'revenue';
        }
        
        // Check for negative sign or parentheses indicating expense
        if (line.includes('-' + amountStr) || 
            line.includes('(' + amountStr + ')') ||
            line.includes('- ' + amountStr)) {
          type = 'expense';
        }
        
        // Extract description
        let description = line
          .replace(dateStr, '')
          .replace(amountStr, '')
          .replace(currencySymbolRegex, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Remove any remaining currency symbols
        description = description.replace(/[$€£¥₹]/g, '').trim();
        
        // Create transaction object
        transactions.push({
          id: `pdf-${i}-${Date.now()}`,
          date: new Date(dateStr),
          description: description || `Transaction ${i + 1}`,
          amount: Math.abs(amount),
          type: type,
          category: 'Other'
        });
      }
    }
    
    // If no transactions found using pattern matching, try table extraction
    if (transactions.length === 0) {
      // Look for table-like structures
      const tableRows = [];
      let inTable = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines
        if (line === '') continue;
        
        // Check if line looks like a table row (contains multiple spaces or tabs)
        const hasMultipleSpaces = /\s{2,}/.test(line);
        const hasTabSeparators = /\t/.test(line);
        
        if (hasMultipleSpaces || hasTabSeparators) {
          inTable = true;
          tableRows.push(line);
        } else if (inTable) {
          // End of table
          inTable = false;
          
          // Process table rows
          if (tableRows.length > 1) {
            // Process table
            for (let j = 1; j < tableRows.length; j++) {
              const row = tableRows[j];
              
              // Split by multiple spaces or tabs
              const columns = row.split(/\s{2,}|\t/).filter(col => col.trim() !== '');
              
              if (columns.length >= 2) {
                // Try to identify date and amount columns
                let dateCol = -1;
                let amountCol = -1;
                let descCol = -1;
                
                for (let k = 0; k < columns.length; k++) {
                  if (dateRegex.test(columns[k])) {
                    dateCol = k;
                  } else if (amountRegex.test(columns[k])) {
                    amountCol = k;
                  } else if (columns[k].length > 5) {
                    // Assume longer text is description
                    descCol = k;
                  }
                }
                
                // If date and amount found, create transaction
                if (dateCol !== -1 && amountCol !== -1) {
                  const dateStr = columns[dateCol].match(dateRegex)[0];
                  const amountStr = columns[amountCol].match(amountRegex)[0];
                  const amount = parseFloat(amountStr.replace(/[$,]/g, ''));
                  
                  // Determine description
                  let description = '';
                  if (descCol !== -1) {
                    description = columns[descCol];
                  } else {
                    // Use all columns except date and amount
                    description = columns
                      .filter((_, idx) => idx !== dateCol && idx !== amountCol)
                      .join(' ');
                  }
                  
                  // Create transaction object
                  transactions.push({
                    id: `pdf-table-${j}-${Date.now()}`,
                    date: new Date(dateStr),
                    description: description || `Transaction ${j}`,
                    amount: Math.abs(amount),
                    type: 'expense', // Default to expense
                    category: 'Other'
                  });
                }
              }
            }
            
            // Clear table rows
            tableRows.length = 0;
          }
        }
      }
    }
    
    // If still no transactions found, try a more aggressive approach
    if (transactions.length === 0) {
      // Look for any lines with dates and amounts
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip short lines
        if (line.length < 10) continue;
        
        // Check for date
        const dateMatch = line.match(dateRegex);
        if (dateMatch) {
          // Look for amount in this line or next few lines
          let amountMatch = line.match(amountRegex);
          let amountLine = line;
          let lineOffset = 0;
          
          // If no amount in this line, check next few lines
          while (!amountMatch && i + lineOffset + 1 < lines.length && lineOffset < 3) {
            lineOffset++;
            amountLine = lines[i + lineOffset].trim();
            amountMatch = amountLine.match(amountRegex);
          }
          
          if (amountMatch) {
            // Extract date
            const dateStr = dateMatch[0];
            
            // Extract amount
            const amountStr = amountMatch[0];
            const amount = parseFloat(amountStr.replace(/[$,]/g, ''));
            
            // Extract description
            let description = line.replace(dateStr, '').trim();
            if (lineOffset > 0) {
              description += ' ' + amountLine.replace(amountStr, '').trim();
            } else {
              description = description.replace(amountStr, '').trim();
            }
            
            // Create transaction object
            transactions.push({
              id: `pdf-scan-${i}-${Date.now()}`,
              date: new Date(dateStr),
              description: description || `Transaction ${i + 1}`,
              amount: Math.abs(amount),
              type: 'expense', // Default to expense
              category: 'Other'
            });
            
            // Skip processed lines
            i += lineOffset;
          }
        }
      }
    }
    
    // If no transactions found, throw error
    if (transactions.length === 0) {
      throw new Error('No transaction data could be extracted from PDF');
    }
    
    // Normalize and return the data
    return normalizeTransactionData(transactions);
  } catch (error) {
    console.error('Error parsing PDF file:', error);
    throw new Error(`Failed to parse PDF file: ${error.message}`);
  }
};

module.exports = {
  parsePDFFile
};