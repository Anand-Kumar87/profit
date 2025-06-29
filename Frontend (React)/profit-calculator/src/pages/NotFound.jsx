import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Box, Typography, Button, Paper } from '@mui/material';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h1" component="h1" gutterBottom>
            404
          </Typography>
          <Typography variant="h4" component="h2" gutterBottom>
            Page Not Found
          </Typography>
          <Typography variant="body1" paragraph>
            The page you are looking for does not exist or has been moved.
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Go to Dashboard
          </Button>
        </Paper>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Website developed by Anand Kumar
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFound;