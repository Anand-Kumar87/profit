// utils/logger.js
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const errorLogPath = path.join(logsDir, 'error.log');
const accessLogPath = path.join(logsDir, 'access.log');

/**
 * Log error message
 * @param {string} message - Error message
 * @param {Error} error - Error object
 */
const logError = (message, error) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ERROR: ${message}\n${error ? error.stack : ''}\n\n`;
  
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(message, error);
  }
  
  // Append to log file
  fs.appendFile(errorLogPath, logEntry, (err) => {
    if (err) {
      console.error('Error writing to error log:', err);
    }
  });
};

/**
 * Log API request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logRequest = (req, res) => {
  const timestamp = new Date().toISOString();
  const { method, originalUrl, ip } = req;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  
  const logEntry = `[${timestamp}] ${method} ${originalUrl} - ${ip} - ${userAgent}\n`;
  
  // Append to log file
  fs.appendFile(accessLogPath, logEntry, (err) => {
    if (err) {
      console.error('Error writing to access log:', err);
    }
  });
};

/**
 * Request logging middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requestLogger = (req, res, next) => {
  logRequest(req, res);
  next();
};

module.exports = {
  logError,
  logRequest,
  requestLogger
};