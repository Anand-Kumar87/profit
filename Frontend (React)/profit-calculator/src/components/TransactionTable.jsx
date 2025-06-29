// TransactionTable.jsx
import React, { useContext, useState } from 'react';
import { DataContext } from '../contexts/DataContext';
import { useTable, useSortBy, useFilters, usePagination } from 'react-table';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, TextField, Button, IconButton,
  MenuItem, Select, FormControl, InputLabel,
  TablePagination, Tooltip
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon
} from '@mui/icons-material';

const TransactionTable = () => {
  const { 
    transactions, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction,
    categories
  } = useContext(DataContext);
  
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    description: '',
    amount: 0,
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const columns = React.useMemo(
    () => [
      {
        Header: 'Date',
        accessor: 'date',
        Cell: ({ row, value }) => {
          return editingId === row.original.id ? (
            <TextField
              type="date"
              value={editFormData.date}
              onChange={(e) => handleEditChange('date', e.target.value)}
              size="small"
              fullWidth
            />
          ) : (
            new Date(value).toLocaleDateString()
          );
        }
      },
      {
        Header: 'Description',
        accessor: 'description',
        Cell: ({ row, value }) => {
          return editingId === row.original.id ? (
            <TextField
              value={editFormData.description}
              onChange={(e) => handleEditChange('description', e.target.value)}
              size="small"
              fullWidth
            />
          ) : (
            value
          );
        }
      },
      {
        Header: 'Type',
        accessor: 'type',
        Cell: ({ row, value }) => {
          return editingId === row.original.id ? (
            <FormControl fullWidth size="small">
              <Select
                value={editFormData.type}
                onChange={(e) => handleEditChange('type', e.target.value)}
              >
                <MenuItem value="revenue">Revenue</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>
          ) : (
            value.charAt(0).toUpperCase() + value.slice(1)
          );
        }
      },
      {
        Header: 'Category',
        accessor: 'category',
        Cell: ({ row, value }) => {
          return editingId === row.original.id ? (
            <FormControl fullWidth size="small">
              <Select
                value={editFormData.category}
                onChange={(e) => handleEditChange('category', e.target.value)}
              >
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            value
          );
        }
      },
      {
        Header: 'Amount',
        accessor: 'amount',
        Cell: ({ row, value }) => {
          return editingId === row.original.id ? (
            <TextField
              type="number"
              value={editFormData.amount}
              onChange={(e) => handleEditChange('amount', parseFloat(e.target.value))}
              size="small"
              fullWidth
            />
          ) : (
            <span style={{ 
              color: row.original.type === 'revenue' ? 'green' : 'red',
              fontWeight: 'bold'
            }}>
              {row.original.type === 'revenue' ? '+' : '-'}
              ${Math.abs(value).toFixed(2)}
            </span>
          );
        }
      },
      {
        Header: 'Actions',
        Cell: ({ row }) => {
          return editingId === row.original.id ? (
            <>
              <Tooltip title="Save">
                <IconButton color="primary" onClick={() => handleSaveEdit()}>
                  <SaveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel">
                <IconButton color="secondary" onClick={() => setEditingId(null)}>
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip title="Edit">
                <IconButton color="primary" onClick={() => handleEdit(row.original)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton color="error" onClick={() => deleteTransaction(row.original.id)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </>
          );
        }
      }
    ],
    [editingId, editFormData, categories]
  );
  
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state: { pageIndex, pageSize },
    gotoPage,
    setPageSize,
  } = useTable(
    { 
      columns, 
      data: transactions,
      initialState: { pageSize: 10 }
    },
    useFilters,
    useSortBy,
    usePagination
  );
  
  const handleEdit = (transaction) => {
    setEditingId(transaction.id);
    setEditFormData({
      description: transaction.description,
      amount: Math.abs(transaction.amount),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date
    });
  };
  
  const handleEditChange = (field, value) => {
    setEditFormData({
      ...editFormData,
      [field]: value
    });
  };
  
  const handleSaveEdit = () => {
    const updatedTransaction = {
      ...editFormData,
      id: editingId,
      amount: editFormData.type === 'expense' 
        ? -Math.abs(editFormData.amount) 
        : Math.abs(editFormData.amount)
    };
    
    updateTransaction(updatedTransaction);
    setEditingId(null);
  };
  
  const handleAddNew = () => {
    const newTransaction = {
      id: Date.now().toString(),
      description: 'New Transaction',
      amount: 0,
      type: 'expense',
      category: categories[0] || 'Other',
      date: new Date().toISOString().split('T')[0]
    };
    
    addTransaction(newTransaction);
    setEditingId(newTransaction.id);
    setEditFormData({
      description: newTransaction.description,
      amount: 0,
      type: 'expense',
      category: categories[0] || 'Other',
      date: newTransaction.date
    });
  };
  
  const handleChangePage = (event, newPage) => {
    gotoPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
  };
  
  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAddNew}
        sx={{ mb: 2 }}
      >
        Add Transaction
      </Button>
      
      <TableContainer>
        <Table {...getTableProps()} size="small">
          <TableHead>
            {headerGroups.map(headerGroup => (
              <TableRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <TableCell 
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {column.render('Header')}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? ' 🔽'
                          : ' 🔼'
                        : ''}
                    </span>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            {page.map(row => {
              prepareRow(row);
              return (
                <TableRow {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <TableCell {...cell.getCellProps()}>
                      {cell.render('Cell')}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={transactions.length}
        rowsPerPage={pageSize}
        page={pageIndex}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default TransactionTable;