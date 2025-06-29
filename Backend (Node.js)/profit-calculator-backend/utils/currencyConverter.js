// utils/currencyConverter.js
const axios = require('axios');

// Cache exchange rates to reduce API calls
let exchangeRates = null;
let lastFetchTime = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch latest exchange rates
 * @returns {Promise<Object>} - Exchange rates
 */
const fetchExchangeRates = async () => {
  try {
    // Check if we have cached rates that are still valid
    const now = Date.now();
    if (exchangeRates && lastFetchTime && (now - lastFetchTime < CACHE_DURATION)) {
      return exchangeRates;
    }
    
    // In a real app, you would use a paid API service
    // For this demo, we'll use a free API with limited functionality
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    
    exchangeRates = response.data.rates;
    lastFetchTime = now;
    
    return exchangeRates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Return fallback rates if API call fails
    return getFallbackRates();
  }
};

/**
 * Get fallback exchange rates
 * @returns {Object} - Fallback exchange rates
 */
const getFallbackRates = () => {
  return {
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    JPY: 110.42,
    CAD: 1.25,
    AUD: 1.36,
    CNY: 6.47,
    INR: 74.38
  };
};

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {Promise<number>} - Converted amount
 */
const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    // If currencies are the same, no conversion needed
    if (fromCurrency === toCurrency) {
      return amount;
    }
    
    // Get exchange rates
    const rates = await fetchExchangeRates();
    
    // Check if currencies are supported
    if (!rates[fromCurrency] || !rates[toCurrency]) {
      throw new Error('Unsupported currency');
    }
    
    // Convert to USD first (base currency)
    const amountInUSD = amount / rates[fromCurrency];
    
    // Convert from USD to target currency
    const convertedAmount = amountInUSD * rates[toCurrency];
    
    return convertedAmount;
  } catch (error) {
    console.error('Currency conversion error:', error);
    throw new Error(`Failed to convert currency: ${error.message}`);
  }
};

/**
 * Get supported currencies
 * @returns {Promise<Array>} - Array of currency objects
 */
const getSupportedCurrencies = async () => {
  try {
    const rates = await fetchExchangeRates();
    
    // Currency metadata
    const currencyMeta = {
      USD: { name: 'US Dollar', symbol: '$' },
      EUR: { name: 'Euro', symbol: '€' },
      GBP: { name: 'British Pound', symbol: '£' },
      JPY: { name: 'Japanese Yen', symbol: '¥' },
      CAD: { name: 'Canadian Dollar', symbol: 'C$' },
      AUD: { name: 'Australian Dollar', symbol: 'A$' },
      CNY: { name: 'Chinese Yuan', symbol: '¥' },
      INR: { name: 'Indian Rupee', symbol: '₹' }
      // Add more currencies as needed
    };
    
    // Create array of currency objects
    return Object.keys(rates)
      .filter(code => currencyMeta[code]) // Only include currencies with metadata
      .map(code => ({
        code,
        name: currencyMeta[code].name || code,
        symbol: currencyMeta[code].symbol || code,
        rate: rates[code]
      }));
  } catch (error) {
    console.error('Error getting supported currencies:', error);
    
    // Return fallback currencies if API call fails
    return Object.keys(getFallbackRates())
      .map(code => ({
        code,
        name: code === 'USD' ? 'US Dollar' : code,
        symbol: code === 'USD' ? '$' : code,
        rate: getFallbackRates()[code]
      }));
  }
};

module.exports = {
  convertCurrency,
  getSupportedCurrencies
};