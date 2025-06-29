// FilterPanel.jsx
import React, { useState, useContext } from 'react';
import { 
  Paper, Typography, Grid, TextField, Button, 
  FormControl, InputLabel, Select, MenuItem, Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DataContext } from '../contexts/DataContext';

const FilterPanel = () => {
  const { applyFilters, resetFilters, categories } = useContext(DataContext);
  
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    minAmount: '',
    maxAmount: '',
    type: '',
    category: '',
    searchTerm: ''
  });
  
  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };
  
  const handleApplyFilters = () => {
    applyFilters(filters);
  };
  
  const handleResetFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      minAmount: '',
      maxAmount: '',
      type: '',
      category: '',
      searchTerm: ''
    });
    resetFilters();
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Filter Transactions
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(date) => handleFilterChange('startDate', date)}
              renderInput={(params) => <TextField {...params} fullWidth size="small" />}
            />
          </LocalizationProvider>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="End Date"
              value={filters.endDate}
              onChange={(date) => handleFilterChange('endDate', date)}
              renderInput={(params) => <TextField {...params} fullWidth size="small" />}
            />
          </LocalizationProvider>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Min Amount"
            type="number"
            value={filters.minAmount}
            onChange={(e) => handleFilterChange('minAmount', e.target.value)}
            fullWidth
            size="small"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Max Amount"
            type="number"
            value={filters.maxAmount}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
            fullWidth
            size="small"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type}
              label="Type"
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="revenue">Revenue</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
              label="Category"
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            label="Search"
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            placeholder="Search by description"
            fullWidth
            size="small"
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button 
          variant="outlined" 
          onClick={handleResetFilters}
        >
          Reset
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleApplyFilters}
        >
          Apply Filters
        </Button>
      </Box>
    </Paper>
  );
};

export default FilterPanel;