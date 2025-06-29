// controllers/fileController.js
const fs = require('fs');
const path = require('path');
const { parseExcelFile } = require('../parsers/excelParser');
const { parseCSVFile } = require('../parsers/csvParser');
const { parseJSONFile } = require('../parsers/jsonParser');
const { parseXMLFile } = require('../parsers/xmlParser');
const { parsePDFFile } = require('../parsers/pdfParser');
const { parseImageFile } = require('../parsers/imageParser');
const { categorizeTranactions } = require('../utils/dataFormatter');

/**
 * Process uploaded file and extract transaction data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processFile = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    let transactions = [];
    
    // Parse file based on extension
    switch (fileExtension) {
      case '.xlsx':
      case '.xls':
        transactions = parseExcelFile(filePath);
        break;
        
      case '.csv':
        transactions = await parseCSVFile(filePath);
        break;
        
      case '.json':
        transactions = parseJSONFile(filePath);
        break;
        
      case '.xml':
        transactions = await parseXMLFile(filePath);
        break;
        
      case '.pdf':
        transactions = await parsePDFFile(filePath);
        break;
        
      case '.jpg':
      case '.jpeg':
        transactions = await parseImageFile(filePath);
        break;
        
      default:
        // Clean up file
        fs.unlinkSync(filePath);
        return res.status(400).json({ message: 'Unsupported file format' });
    }
    
    // Categorize transactions
    const categorizedTransactions = categorizeTranactions(transactions);
    
    // Clean up file
    fs.unlinkSync(filePath);
    
    // Return processed data
    res.json({
      message: 'File processed successfully',
      transactions: categorizedTransactions,
      summary: {
        total: categorizedTransactions.length,
        revenue: categorizedTransactions.filter(t => t.type === 'revenue').length,
        expenses: categorizedTransactions.filter(t => t.type === 'expense').length
      }
    });
  } catch (error) {
    console.error('Error processing file:', error);
    
    // Clean up file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({ message: error.message || 'Error processing file' });
  }
};

module.exports = {
  processFile
};