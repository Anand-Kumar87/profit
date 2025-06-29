// SummaryPanel.jsx
import React, { useContext, useMemo } from 'react';
import { DataContext } from '../contexts/DataContext';
import { Paper, Typography, Grid, Box, Divider } from '@mui/material';
import { 
  TrendingUp as RevenueIcon, 
  TrendingDown as ExpenseIcon,
  AccountBalance as ProfitIcon
} from '@mui/icons-material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const SummaryPanel = () => {
  const { transactions } = useContext(DataContext);
  
  const { totalRevenue, totalExpenses, profit } = useMemo(() => {
    const totalRevenue = transactions
      .filter(t => t.type === 'revenue')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    const profit = totalRevenue - totalExpenses;
    
    return { totalRevenue, totalExpenses, profit };
  }, [transactions]);
  
 // SummaryPanel.jsx (continued)
  const chartData = {
    labels: ['Revenue', 'Expenses'],
    datasets: [
      {
        data: [totalRevenue, totalExpenses],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Financial Summary
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'rgba(75, 192, 192, 0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <RevenueIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2">Total Revenue</Typography>
                </Box>
                <Typography variant="h5" color="success.main">
                  ${totalRevenue.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'rgba(255, 99, 132, 0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ExpenseIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2">Total Expenses</Typography>
                </Box>
                <Typography variant="h5" color="error.main">
                  ${totalExpenses.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 1, 
                bgcolor: profit >= 0 ? 'rgba(75, 192, 192, 0.2)' : 'rgba(255, 99, 132, 0.2)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ProfitIcon sx={{ mr: 1, color: profit >= 0 ? 'success.main' : 'error.main' }} />
                  <Typography variant="subtitle2">Net Profit</Typography>
                </Box>
                <Typography 
                  variant="h5" 
                  color={profit >= 0 ? 'success.main' : 'error.main'}
                >
                  ${Math.abs(profit).toFixed(2)}
                  {profit < 0 && ' (Loss)'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Profit Formula:
            </Typography>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'background.default', 
              borderRadius: 1,
              fontFamily: 'monospace'
            }}>
              <Typography>
                Profit = Total Revenue - Total Expenses
              </Typography>
              <Typography>
                ${profit.toFixed(2)} = ${totalRevenue.toFixed(2)} - ${totalExpenses.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Box sx={{ height: 200 }}>
            <Doughnut data={chartData} options={chartOptions} />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SummaryPanel;