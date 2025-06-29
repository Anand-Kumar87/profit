import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon
} from '@mui/icons-material';

// Components
import SummaryPanel from '../components/SummaryPanel';
import FileUploadComponent from '../components/FileUploadComponent';
import FilterPanel from '../components/FilterPanel';
import TransactionTable from '../components/TransactionTable';
import DataExportComponent from '../components/DataExportComponent';
import AdvancedChartComponent from '../components/AdvancedChartComponent';

// Context
import { useData } from '../contexts/DataContext';

const Dashboard = ({ toggleDarkMode, darkMode }) => {
  const navigate = useNavigate();
  const { error, clearError } = useData();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  const handleNavigate = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };
  
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'User' };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Profit Calculator
          </Typography>
          <IconButton color="inherit" onClick={toggleDarkMode}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
        >
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
          <Divider />
          <List>
            <ListItem button onClick={() => handleNavigate('/')}>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button onClick={() => handleNavigate('/settings')}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      
      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        <SummaryPanel />
        <FileUploadComponent />
        <FilterPanel />
        <TransactionTable />
        <AdvancedChartComponent />
        <DataExportComponent />
      </Container>
      
      <Box component="footer" sx={{ py: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Website developed by Anand Kumar
        </Typography>
      </Box>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={clearError}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={clearError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;