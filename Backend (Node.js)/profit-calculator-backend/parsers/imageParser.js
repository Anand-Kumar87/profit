// parsers/imageParser.js
const { createWorker } = require('tesseract.js');
const { normalizeTransactionData } = require('../utils/dataFormatter');

/**
 * Parse image files (JPG, JPEG) using OCR and extract transaction data
 * @param {string} filePath - Path to the uploaded image file
 * @returns {Promise<Array>} - Promise resolving to array of normalized transaction objects
 */
const parseImageFile = async (filePath) => {
  try {
    // Initialize Tesseract worker
    const worker = await createWorker();
    
    // Set OCR language
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    // Set page segmentation mode to automatic
    await worker.setParameters({
      tessedit_pageseg_mode: '3', // Fully automatic page segmentation, but no OSD
    });
    
    // Perform OCR
    const { data } = await worker.recognize(filePath);
    
    // Extract text content
    const text = data.text;
    
    // Terminate worker
    await worker.terminate();
    
    // Check if text exists
    if (!text || text.trim() === '') {
      throw new Error('No text content extracted from image');
    }
    
    // Split text into lines
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // Regular expressions for common patterns
    const dateRegex = /\b(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4}|\d{4}[-/\.]\d{1,2}[-/\.]\d{1,2})\b/;
    const amountRegex = /\$?\s?(\d{1,3}(,\d{3})*(\.\d{2})?|\d+(\.\d{2})?)/;
    const currencySymbolRegex = /[$€£¥₹]/;
    
    // Process lines to extract transactions
    const transactions = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip short lines
      if (line.length < 10) continue;
      
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
        
        // Extract description
        let description = line
          .replace(dateStr, '')
          .replace(amountStr, '')
          .replace(currencySymbolRegex, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Create transaction object
        transactions.push({
          id: `image-${i}-${Date.now()}`,
          date: new Date(dateStr),
          description: description || `Transaction ${i + 1}`,
          amount: Math.abs(amount),
          type: type,
          category: 'Other'
        });
      }
    }
    
    // If no transactions found using pattern matching, try a more aggressive approach
    if (transactions.length === 0) {
      // Look for any lines with dates
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
              id: `image-scan-${i}-${Date.now()}`,
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
    
    // If still no transactions found, try to extract any numbers that look like amounts
    if (transactions.length === 0) {
      let transactionCount = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip short lines
        if (line.length < 5) continue;
        
        // Look for amount patterns
        const amountMatch = line.match(amountRegex);
        if (amountMatch) {
          // Extract amount
          const amountStr = amountMatch[0];
          const amount = parseFloat(amountStr.replace(/[$,]/g, ''));
          
          // Create a basic transaction
          transactions.push({
            id: `image-basic-${i}-${Date.now()}`,
            date: new Date(), // Use current date as fallback
            description: line.replace(amountStr, '').trim() || `Item ${++transactionCount}`,
            amount: Math.abs(amount),
            type: 'expense', // Default to expense
            category: 'Other'
          });
        }
      }
    }
    
    // If no transactions found, throw error
    if (transactions.length === 0) {
      throw new Error('No transaction data could be extracted from image');
    }
    
    // Normalize and return the data
    return normalizeTransactionData(transactions);
  } catch (error) {
    console.error('Error parsing image file:', error);
    throw new Error(`Failed to parse image file: ${error.message}`);
  }
};

module.exports = {
  parseImageFile
};