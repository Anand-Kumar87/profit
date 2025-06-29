// LoginDialog.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const LoginDialog = ({ open, onClose, onLogin }) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
  };
  
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      // Simple validation
      if (loginData.email === 'demo@example.com' && loginData.password === 'password') {
        onLogin({
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com'
        });
        setLoading(false);
      } else {
        setError('Invalid email or password');
        setLoading(false);
      }
    }, 1000);
  };
  
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simple validation
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      onLogin({
        id: '2',
        name: registerData.name,
        email: registerData.email
      });
      setLoading(false);
    }, 1000);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        )}
        
        <TabPanel value={tabValue} index={0}>
          <form onSubmit={handleLoginSubmit}>
            <TextField
              label="Email"
              type="email"
              name="email"
              value={loginData.email}
              onChange={handleLoginChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Password"
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleLoginChange}
              fullWidth
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <form onSubmit={handleRegisterSubmit}>
            <TextField
              label="Name"
              type="text"
              name="name"
              value={registerData.name}
              onChange={handleRegisterChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Email"
              type="email"
              name="email"
              value={registerData.email}
              onChange={handleRegisterChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Password"
              type="password"
              name="password"
              value={registerData.password}
              onChange={handleRegisterChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={registerData.confirmPassword}
              onChange={handleRegisterChange}
              fullWidth
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
          </form>
        </TabPanel>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Demo credentials: demo@example.com / password
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginDialog;