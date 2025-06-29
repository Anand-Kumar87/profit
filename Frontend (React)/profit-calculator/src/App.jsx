// App.jsx
import React, { useState } from 'react';
import { 
  Container, CssBaseline, AppBar, Toolbar, Typography, 
  Box, IconButton, Drawer, List, ListItem, ListItemIcon, 
  ListItemText, Divider, Button, Snackbar, Alert
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  TableChart as TableIcon,
  FilterList as FilterIcon,
  CloudUpload as UploadIcon,
  GetApp as DownloadIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon
} from '@mui/icons-material';
import { DataProvider, DataContext } from './contexts/DataContext';
import FileUploadComponent from './components/FileUploadComponent';
import FilterPanel from './components/FilterPanel';
import SummaryPanel from './components/SummaryPanel';
import TransactionTable from './components/TransactionTable';
import DataExportComponent from './components/DataExportComponent';
import LoginDialog from './components/LoginDialog';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Create theme based on dark mode preference
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#f50057',
      },
    },
  });
  
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setLoginOpen(false);
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
  };
  
  return (
    <ThemeProvider theme={theme}>
      <DataProvider>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="static">
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Profit Calculator
              </Typography>
              
              <DataContext.Consumer>
                {({ canUndo, canRedo, undo, redo }) => (
                  <>
                    <IconButton 
                      color="inherit" 
                      onClick={undo} 
                      disabled={!canUndo}
                      title="Undo"
                    >
                      <UndoIcon />
                    </IconButton>
                    <IconButton 
                      color="inherit" 
                      onClick={redo} 
                      disabled={!canRedo}
                      title="Redo"
                    >
                      <RedoIcon />
                    </IconButton>
                  </>
                )}
              </DataContext.Consumer>
              
              <IconButton 
                color="inherit" 
                onClick={toggleDarkMode}
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              
              {isLoggedIn ? (
                <>
                  <Typography variant="body2" sx={{ mx: 1 }}>
                    {currentUser?.name || 'User'}
                  </Typography>
                  <Button color="inherit" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button color="inherit" onClick={() => setLoginOpen(true)}>
                  Login
                </Button>
              )}
            </Toolbar>
          </AppBar>
          
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={toggleDrawer(false)}
          >
            <Box
              sx={{ width: 250 }}
              role="presentation"
              onClick={toggleDrawer(false)}
              onKeyDown={toggleDrawer(false)}
            >
              <List>
                <ListItem button>
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItem>
                // App.jsx (continued)
                <ListItem button>
                  <ListItemIcon>
                    <TableIcon />
                  </ListItemIcon>
                  <ListItemText primary="Transactions" />
                </ListItem>
                <ListItem button>
                  <ListItemIcon>
                    <FilterIcon />
                  </ListItemIcon>
                  <ListItemText primary="Filters" />
                </ListItem>
              </List>
              <Divider />
              <List>
                <ListItem button>
                  <ListItemIcon>
                    <UploadIcon />
                  </ListItemIcon>
                  <ListItemText primary="Upload Data" />
                </ListItem>
                <ListItem button>
                  <ListItemIcon>
                    <DownloadIcon />
                  </ListItemIcon>
                  <ListItemText primary="Export Data" />
                </ListItem>
              </List>
            </Box>
          </Drawer>
          
          <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
            <DataContext.Consumer>
              {({ error }) => (
                <Snackbar 
                  open={!!error} 
                  autoHideDuration={6000} 
                  onClose={() => {}}
                >
                  <Alert onClose={() => {}} severity="error" sx={{ width: '100%' }}>
                    {error}
                  </Alert>
                </Snackbar>
              )}
            </DataContext.Consumer>
            
            <SummaryPanel />
            <FileUploadComponent />
            <FilterPanel />
            <TransactionTable />
            <DataExportComponent />
          </Container>
          
          <Box component="footer" sx={{ py: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Profit Calculator App. All rights reserved.
            </Typography>
          </Box>
        </Box>
        
        <LoginDialog 
          open={loginOpen} 
          onClose={() => setLoginOpen(false)}
          onLogin={handleLogin}
        />
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
 
// App.jsx (continued)
// import React from 'react'; 