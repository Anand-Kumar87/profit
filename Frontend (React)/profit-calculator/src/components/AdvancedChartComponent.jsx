// AdvancedChartComponent.jsx
import React, { useContext, useState, useMemo } from 'react';
import { 
  Paper, Typography, Box, FormControl, 
  InputLabel, Select, MenuItem, ToggleButtonGroup, 
  ToggleButton, Grid
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { DataContext } from '../contexts/DataContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdvancedChartComponent = () => {
  const { transactions } = useContext(DataContext);
  const [chartType, setChartType] = useState('bar');
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [dataType, setDataType] = useState('both');
  
  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };
  
  const handleTimeFrameChange = (event) => {
    setTimeFrame(event.target.value);
  };
  
  const handleDataTypeChange = (event) => {
    setDataType(event.target.value);
  };
  
  const chartData = useMemo(() => {
    if (!transactions.length) {
      return {
        labels: [],
        datasets: []
      };
    }
    
    // Group transactions by time period
    const groupedData = {};
    const now = new Date();
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      let period;
      
      if (timeFrame === 'daily') {
        period = date.toISOString().split('T')[0];
      } else if (timeFrame === 'weekly') {
        // Get the week number
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        period = `Week ${weekNum}, ${date.getFullYear()}`;
      } else if (timeFrame === 'monthly') {
        period = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      } else if (timeFrame === 'quarterly') {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        period = `Q${quarter} ${date.getFullYear()}`;
      } else {
        period = date.getFullYear().toString();
      }
      
      if (!groupedData[period]) {
        groupedData[period] = {
          revenue: 0,
          expenses: 0
        };
      }
      
      if (transaction.type === 'revenue') {
        groupedData[period].revenue += Math.abs(transaction.amount);
      } else {
        groupedData[period].expenses += Math.abs(transaction.amount);
      }
    });
    
    // Sort periods chronologically
    const sortedPeriods = Object.keys(groupedData).sort((a, b) => {
      if (timeFrame === 'daily') {
        return new Date(a) - new Date(b);
      } else if (timeFrame === 'weekly') {
        const [weekA, yearA] = a.split(', ');
        const [weekB, yearB] = b.split(', ');
        return yearA - yearB || weekA.split(' ')[1] - weekB.split(' ')[1];
      // AdvancedChartComponent.jsx (continued)
      } else if (timeFrame === 'monthly') {
        const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        return yearA - yearB || monthsOrder.indexOf(monthA) - monthsOrder.indexOf(monthB);
      } else if (timeFrame === 'quarterly') {
        const [quarterA, yearA] = a.split(' ');
        const [quarterB, yearB] = b.split(' ');
        return yearA - yearB || quarterA.substring(1) - quarterB.substring(1);
      } else {
        return a - b;
      }
    });
    
    // Prepare chart data
    const labels = sortedPeriods;
    const datasets = [];
    
    if (dataType === 'both' || dataType === 'revenue') {
      datasets.push({
        label: 'Revenue',
        data: sortedPeriods.map(period => groupedData[period].revenue),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      });
    }
    
    if (dataType === 'both' || dataType === 'expenses') {
      datasets.push({
        label: 'Expenses',
        data: sortedPeriods.map(period => groupedData[period].expenses),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      });
    }
    
    if (dataType === 'profit') {
      datasets.push({
        label: 'Profit',
        data: sortedPeriods.map(period => 
          groupedData[period].revenue - groupedData[period].expenses
        ),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      });
    }
    
    return { labels, datasets };
  }, [transactions, timeFrame, dataType]);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} by ${timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} Period`,
      },
    },
    scales: chartType !== 'pie' ? {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount ($)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time Period'
        }
      }
    } : undefined
  };
  
  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return <Line data={chartData} options={chartOptions} />;
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />;
      case 'pie':
        return <Pie data={chartData} options={chartOptions} />;
      default:
        return <Bar data={chartData} options={chartOptions} />;
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Financial Analysis
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Time Frame</InputLabel>
            <Select
              value={timeFrame}
              label="Time Frame"
              onChange={handleTimeFrameChange}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Data Type</InputLabel>
            <Select
              value={dataType}
              label="Data Type"
              onChange={handleDataTypeChange}
            >
              <MenuItem value="both">Revenue & Expenses</MenuItem>
              <MenuItem value="revenue">Revenue Only</MenuItem>
              <MenuItem value="expenses">Expenses Only</MenuItem>
              <MenuItem value="profit">Profit</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            aria-label="chart type"
            size="small"
            fullWidth
          >
            <ToggleButton value="bar" aria-label="bar chart">
              Bar
            </ToggleButton>
            <ToggleButton value="line" aria-label="line chart">
              Line
            </ToggleButton>
            <ToggleButton value="pie" aria-label="pie chart">
              Pie
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>
      
      <Box sx={{ height: 400 }}>
        {transactions.length > 0 ? (
          renderChart()
        ) : (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'background.default',
            borderRadius: 1
          }}>
            <Typography variant="body1" color="text.secondary">
              No data available. Upload or add transactions to see charts.
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default AdvancedChartComponent;