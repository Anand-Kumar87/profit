// CurrencyConverter.jsx
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Button,
  CircularProgress,
  Box
} from '@mui/material';
import { CurrencyExchange as CurrencyIcon } from '@mui/icons-material';

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' }
];

const CurrencyConverter = ({ onCurrencyChange }) => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState(1);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState(null);
  
  // Fetch exchange rates (in a real app, use a real API)
  useEffect(() => {
    // Simulated exchange rates
    const mockRates = {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110.42,
      CAD: 1.25,
      AUD: 1.36,
      CNY: 6.47,
      INR: 74.38
    };
    
    setRates(mockRates);
  }, []);
  
  const handleFromCurrencyChange = (event) => {
    setFromCurrency(event.target.value);
  };
  
  const handleToCurrencyChange = (event) => {
    setToCurrency(event.target.value);
    if (onCurrencyChange) {
      onCurrencyChange(event.target.value);
    }
  };
  
  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };
  
  const handleConvert = () => {
    if (!rates) return;
    
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const result = (amount * rates[toCurrency]) / rates[fromCurrency];
      setConvertedAmount(result);
      setLoading(false);
    }, 500);
  };
  
  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Currency Converter
      </Typography>
      
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={3}>
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={handleAmountChange}
            fullWidth
            size="small"
          />
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth size="small">
            <InputLabel>From</InputLabel>
            <Select
              value={fromCurrency}
              label="From"
              onChange={handleFromCurrencyChange}
            >
              {currencies.map(currency => (
                <MenuItem key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={1} sx={{ textAlign: 'center' }}>
          <Button onClick={handleSwapCurrencies}>
            <CurrencyIcon />
          </Button>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth size="small">
            <InputLabel>To</InputLabel>
            <Select
              value={toCurrency}
              label="To"
              onChange={handleToCurrencyChange}
            >
              {currencies.map(currency => (
                <MenuItem key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={2}>
          <Button
            variant="contained"
            onClick={handleConvert}
            fullWidth
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Convert'}
          </Button>
        </Grid>
        
        {convertedAmount !== null && (
          <Grid item xs={12}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mt: 1 }}>
              <Typography variant="h6" align="center">
                {amount} {fromCurrency} = {convertedAmount.toFixed(2)} {toCurrency}
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary">
                1 {fromCurrency} = {(rates[toCurrency] / rates[fromCurrency]).toFixed(4)} {toCurrency}
              </Typography>
            </Box>
          </Grid>
        )}
        
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary">
            Set your preferred currency for the application. All transactions will be displayed in this currency.
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CurrencyConverter;