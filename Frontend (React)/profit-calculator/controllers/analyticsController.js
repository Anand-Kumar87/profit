// controllers/analyticsController.js
const fs = require('fs');
const path = require('path');
const { getDataFilePath } = require('../utils/fileHelpers');

/**
 * Get summary statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSummaryStats = (req, res) => {
  try {
    const userId = req.user.id;
    const dataFilePath = getDataFilePath(userId);
    
    // Check if user data file exists
    if (!fs.existsSync(dataFilePath)) {
      return res.json({
        totalTransactions: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        averageTransaction: 0,
        revenueByCategory: {},
        expensesByCategory: {}
      });
    }
    
    // Read user data
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const userData = JSON.parse(data);
    const { transactions } = userData;
    
    // Calculate summary statistics
    const totalTransactions = transactions.length;
    
    const totalRevenue = transactions
      .filter(t => t.type === 'revenue')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    const netProfit = totalRevenue - totalExpenses;
    
    const averageTransaction = totalTransactions > 0
      ? (totalRevenue + totalExpenses) / totalTransactions
      : 0;
    
    // Calculate revenue by category
    const revenueByCategory = transactions
      .filter(t => t.type === 'revenue')
      .reduce((categories, t) => {
        const category = t.category || 'Other';
        categories[category] = (categories[category] || 0) + Math.abs(t.amount);
        return categories;
      }, {});
    
    // Calculate expenses by category
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((categories, t) => {
        const category = t.category || 'Other';
        categories[category] = (categories[category] || 0) + Math.abs(t.amount);
        return categories;
      }, {});
    
    res.json({
      totalTransactions,
      totalRevenue,
      totalExpenses,
      netProfit,
      averageTransaction,
      revenueByCategory,
      expensesByCategory
    });
  } catch (error) {
    console.error('Get summary stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get time series data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTimeSeriesData = (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'monthly', startDate, endDate } = req.query;
    const dataFilePath = getDataFilePath(userId);
    
    // Check if user data file exists
    if (!fs.existsSync(dataFilePath)) {
      return res.json({
        labels: [],
        revenue: [],
        expenses: [],
        profit: []
      });
    }
    
    // Read user data
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const userData = JSON.parse(data);
    const { transactions } = userData;
    
    // Filter transactions by date range if provided
    let filteredTransactions = [...transactions];
    
    if (startDate) {
      filteredTransactions = filteredTransactions.filter(t => 
        new Date(t.date) >= new Date(startDate)
      );
    }
    
    if (endDate) {
      filteredTransactions = filteredTransactions.filter(t => 
        new Date(t.date) <= new Date(endDate)
      );
    }
    
    // Group transactions by period
    const groupedData = {};
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      let periodKey;
      
      switch (period) {
        case 'daily':
          periodKey = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          // Get the week number
          const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
          const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
          const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
          periodKey = `Week ${weekNum}, ${date.getFullYear()}`;
          break;
        case 'monthly':
          periodKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
          break;
        case 'quarterly':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          periodKey = `Q${quarter} ${date.getFullYear()}`;
          break;
        case 'yearly':
          periodKey = date.getFullYear().toString();
          break;
        default:
          periodKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      }
      
      if (!groupedData[periodKey]) {
        groupedData[periodKey] = {
          revenue: 0,
          expenses: 0
        };
      }
      
      if (transaction.type === 'revenue') {
        groupedData[periodKey].revenue += Math.abs(transaction.amount);
      } else {
        groupedData[periodKey].expenses += Math.abs(transaction.amount);
      }
    });
    
    // Sort periods chronologically
    const sortedPeriods = Object.keys(groupedData).sort((a, b) => {
      if (period === 'daily') {
        return new Date(a) - new Date(b);
      } else if (period === 'weekly') {
        const [weekA, yearA] = a.split(', ');
        const [weekB, yearB] = b.split(', ');
        return yearA - yearB || weekA.split(' ')[1] - weekB.split(' ')[1];
      } else if (period === 'monthly') {
        const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        return yearA - yearB || monthsOrder.indexOf(monthA) - monthsOrder.indexOf(monthB);
      } else if (period === 'quarterly') {
        const [quarterA, yearA] = a.split(' ');
        const [quarterB, yearB] = b.split(' ');
        return yearA - yearB || quarterA.substring(1) - quarterB.substring(1);
      } else {
        return a - b;
      }
    });
    
    // Prepare chart data
    const labels = sortedPeriods;
    const revenue = sortedPeriods.map(period => groupedData[period].revenue);
    const expenses = sortedPeriods.map(period => groupedData[period].expenses);
    const profit = sortedPeriods.map(period => 
      groupedData[period].revenue - groupedData[period].expenses
    );
    
    res.json({
      labels,
      revenue,
      expenses,
      profit
    });
  } catch (error) {
    console.error('Get time series data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get category breakdown
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCategoryBreakdown = (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'all' } = req.query;
    const dataFilePath = getDataFilePath(userId);
    
    // Check if user data file exists
    if (!fs.existsSync(dataFilePath)) {
      return res.json({
        categories: [],
        values: [],
        percentages: []
      });
    }
    
    // Read user data
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const userData = JSON.parse(data);
    const { transactions } = userData;
    
    // Filter transactions by type if specified
    let filteredTransactions = [...transactions];
    
    if (type === 'revenue') {
      filteredTransactions = filteredTransactions.filter(t => t.type === 'revenue');
    } else if (type === 'expense') {
      filteredTransactions = filteredTransactions.filter(t => t.type === 'expense');
    }
    
    // Group transactions by category
    const categoryData = filteredTransactions.reduce((categories, t) => {
      const category = t.category || 'Other';
      categories[category] = (categories[category] || 0) + Math.abs(t.amount);
      return categories;
    }, {});
    
    // Calculate total
    const total = Object.values(categoryData).reduce((sum, amount) => sum + amount, 0);
    
    // Prepare chart data
    const categories = Object.keys(categoryData);
    const values = Object.values(categoryData);
    const percentages = values.map(value => (value / total) * 100);
    
    res.json({
      categories,
      values,
      percentages
    });
  } catch (error) {
    console.error('Get category breakdown error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getSummaryStats,
  getTimeSeriesData,
  getCategoryBreakdown
};