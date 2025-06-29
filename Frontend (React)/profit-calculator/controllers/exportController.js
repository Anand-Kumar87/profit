// controllers/exportController.js
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { getDataFilePath } = require('../utils/fileHelpers');
const { generateTransactionReport } = require('../utils/pdfGenerator');

/**
 * Export transactions to Excel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const exportToExcel = (req, res) => {
  try {
    const userId = req.user.id;
    const dataFilePath = getDataFilePath(userId);
    
    // Check if user data file exists
    if (!fs.existsSync(dataFilePath)) {
      return res.status(404).json({ message: 'No data found' });
    }
    
    // Read user data
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const userData = JSON.parse(data);
    const { transactions } = userData;
    
    // Prepare data for Excel
    const excelData = transactions.map(t => ({
      Date: new Date(t.date).toLocaleDateString(),
      Description: t.description,
      Type: t.type.charAt(0).toUpperCase() + t.type.slice(1),
      Category: t.category || 'Other',
      Amount: t.type === 'revenue' ? Math.abs(t.amount) : -Math.abs(t.amount)
    }));
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    
    // Create buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    // Send file
    res.send(buffer);
  } catch (error) {
    console.error('Export to Excel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Export transactions to CSV
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const exportToCSV = (req, res) => {
  try {
    const userId = req.user.id;
    const dataFilePath = getDataFilePath(userId);
    
    // Check if user data file exists
    if (!fs.existsSync(dataFilePath)) {
      return res.status(404).json({ message: 'No data found' });
    }
    
    // Read user data
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const userData = JSON.parse(data);
    const { transactions } = userData;
    
    // Prepare data for CSV
    const csvData = transactions.map(t => ({
      Date: new Date(t.date).toLocaleDateString(),
      Description: t.description,
      Type: t.type.charAt(0).toUpperCase() + t.type.slice(1),
      Category: t.category || 'Other',
      Amount: t.type === 'revenue' ? Math.abs(t.amount) : -Math.abs(t.amount)
    }));
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(csvData);
    
    // Convert to CSV
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    
    // Set headers
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.setHeader('Content-Type', 'text/csv');
    
    // Send file
    res.send(csv);
  } catch (error) {
    console.error('Export to CSV error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Export transactions to JSON
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const exportToJSON = (req, res) => {
  try {
    const userId = req.user.id;
    const dataFilePath = getDataFilePath(userId);
    
    // Check if user data file exists
    if (!fs.existsSync(dataFilePath)) {
      return res.status(404).json({ message: 'No data found' });
    }
    
    // Read user data
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const userData = JSON.parse(data);
    const { transactions } = userData;
    
    // Set headers
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.json');
    res.setHeader('Content-Type', 'application/json');
    
    // Send file
    res.json(transactions);
  } catch (error) {
    console.error('Export to JSON error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Export transactions to PDF
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const exportToPDF = async (req, res) => {
  try {
    const userId = req.user.id;
    const dataFilePath = getDataFilePath(userI