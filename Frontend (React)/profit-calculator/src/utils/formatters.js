// src/utils/formatters.js

/**
 * Format currency value
 * @param {number} amount - Amount to format
 * @param {string} currencyCode - Currency code (e.g., USD, EUR)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currencyCode = 'USD') => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
};

/**
 * Format date
 * @param {string|Date} date - Date to format
 * @param {string} format - Format style ('short', 'medium', 'long')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = 'medium') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const options = {
    short: { month: 'numeric', day: 'numeric', year: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' }
  };
  
  return dateObj.toLocaleDateString('en-US', options[format] || options.medium);
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format number with thousands separators
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted number string
 */
export const formatNumber = (value, decimals = 2) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format transaction type
 * @param {string} type - Transaction type ('revenue' or 'expense')
 * @returns {string} - Formatted type
 */
export const formatTransactionType = (type) => {
  if (type === 'revenue') return 'Revenue';
  if (type === 'expense') return 'Expense';
  return type.charAt(0).toUpperCase() + type.slice(1);
};