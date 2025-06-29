// CategoryManagementComponent.jsx
import React, { useState, useContext } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Box,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Label as LabelIcon
} from '@mui/icons-material';
import { DataContext } from '../contexts/DataContext';

const CategoryManagementComponent = () => {
  const { categories, transactions } = useContext(DataContext);
  const [categoryList, setCategoryList] = useState(categories);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
  // Count transactions by category
  const categoryCounts = transactions.reduce((counts, transaction) => {
    const category = transaction.category || 'Other';
    counts[category] = (counts[category] || 0) + 1;
    return counts;
  }, {});
  
  const handleAddCategory = () => {
    if (newCategory.trim() && !categoryList.includes(newCategory.trim())) {
      setCategoryList([...categoryList, newCategory.trim()]);
      setNewCategory('');
    }
  };
  
  const handleEditClick = (category) => {
    setEditingCategory(category);
    setNewCategory(category);
    setEditDialogOpen(true);
  };
  
  const handleEditSave = () => {
    if (newCategory.trim() && !categoryList.includes(newCategory.trim())) {
      setCategoryList(categoryList.map(cat => 
        cat === editingCategory ? newCategory.trim() : cat
      ));
      setEditDialogOpen(false);
      setNewCategory('');
      setEditingCategory(null);
    }
  };
  
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    setCategoryList(categoryList.filter(cat => cat !== categoryToDelete));
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Category Management
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', mb: 2 }}>
            <TextField
              label="New Category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              size="small"
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddCategory}
              sx={{ ml: 1 }}
              disabled={!newCategory.trim() || categoryList.includes(newCategory.trim())}
            >
              Add
            </Button>
          </Box>
          
          <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
            {categoryList.map((category) => (
              <ListItem key={category} divider>
                <LabelIcon sx={{ mr: 1, color: 'primary.main' }} />
                <ListItemText 
                  primary={category} 
                  secondary={`${categoryCounts[category] || 0} transactions`} 
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(category)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(category)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {categoryList.length === 0 && (
              <ListItem>
                <ListItemText primary="No categories defined" />
              </ListItem>
            )}
          </List>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Category Usage
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: 'background.paper', 
            borderRadius: 1,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1
          }}>
            {categoryList.map((category) => (
              <Chip
                key={category}
                label={`${category} (${categoryCounts[category] || 0})`}
                color={categoryCounts[category] ? 'primary' : 'default'}
                variant={categoryCounts[category] ? 'filled' : 'outlined'}
                icon={<LabelIcon />}
              />
            ))}
            {categoryList.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No categories available
              </Typography>
            )}
          </Box>
          
          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
            Tips for Categories
          </Typography>
          
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="body2" paragraph>
              Organize your finances by creating specific categories for different types of income and expenses.
            </Typography>
            <Typography variant="body2">
              Examples:
            </Typography>
            <ul>
              <li>Revenue: Sales, Services, Investments, Royalties</li>
              <li>Expenses: Rent, Utilities, Salaries, Marketing, Supplies</li>
            </ul>
          </Box>
        </Grid>
      </Grid>
      
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            type="text"
            fullWidth
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the category "{categoryToDelete}"?
            {categoryCounts[categoryToDelete] > 0 && (
              <Typography color="error" sx={{ mt: 1 }}>
                Warning: This category is used by {categoryCounts[categoryToDelete]} transactions.
                Deleting it will set those transactions to "Other".
              </Typography>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CategoryManagementComponent;