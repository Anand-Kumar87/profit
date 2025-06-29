// DataContext.js
import React, { createContext, useState, useEffect, useReducer } from 'react';

// Initial state
const initialState = {
  transactions: [],
  filteredTransactions: [],
  categories: [
    'Sales', 
    'Services', 
    'Investments', 
    'Other Income',
    'Salaries', 
    'Rent', 
    'Utilities', 
    'Supplies', 
    'Marketing', 
    'Insurance',
    'Taxes',
    'Other Expenses'
  ],
  filters: null,
  error: null,
  history: [],
  historyIndex: -1
};

// Action types
const ADD_TRANSACTION = 'ADD_TRANSACTION';
const UPDATE_TRANSACTION = 'UPDATE_TRANSACTION';
const DELETE_TRANSACTION = 'DELETE_TRANSACTION';
const SET_TRANSACTIONS = 'SET_TRANSACTIONS';
const APPLY_FILTERS = 'APPLY_FILTERS';
const RESET_FILTERS = 'RESET_FILTERS';
const SET_ERROR = 'SET_ERROR';
const UNDO = 'UNDO';
const REDO = 'REDO';

// Reducer function
const dataReducer = (state, action) => {
  let newTransactions;
  let newHistory;
  let newHistoryIndex;
  
  switch (action.type) {
    case ADD_TRANSACTION:
      newTransactions = [...state.transactions, action.payload];
      newHistory = [...state.history.slice(0, state.historyIndex + 1), newTransactions];
      newHistoryIndex = newHistory.length - 1;
      
      return {
        ...state,
        transactions: newTransactions,
        filteredTransactions: state.filters ? applyFiltersToData(newTransactions, state.filters) : newTransactions,
        history: newHistory,
        historyIndex: newHistoryIndex
      };
      
    case UPDATE_TRANSACTION:
      newTransactions = state.transactions.map(t => 
        t.id === action.payload.id ? action.payload : t
      );
      newHistory = [...state.history.slice(0, state.historyIndex + 1), newTransactions];
      newHistoryIndex = newHistory.length - 1;
      
      return {
        ...state,
        transactions: newTransactions,
        filteredTransactions: state.filters ? applyFiltersToData(newTransactions, state.filters) : newTransactions,
        history: newHistory,
        historyIndex: newHistoryIndex
      };
      
    case DELETE_TRANSACTION:
      newTransactions = state.transactions.filter(t => t.id !== action.payload);
      newHistory = [...state.history.slice(0, state.historyIndex + 1), newTransactions];
      newHistoryIndex = newHistory.length - 1;
      
      return {
        ...state,
        transactions: newTransactions,
        filteredTransactions: state.filters ? applyFiltersToData(newTransactions, state.filters) : newTransactions,
        history: newHistory,
        historyIndex: newHistoryIndex
      };
      
    case SET_TRANSACTIONS:
      return {
        ...state,
        transactions: action.payload,
        filteredTransactions: action.payload,
        history: [action.payload],
        historyIndex: 0
      };
      
    case APPLY_FILTERS:
      return {
        ...state,
        filters: action.payload,
        filteredTransactions: applyFiltersToData(state.transactions, action.payload)
      };
      
    case RESET_FILTERS:
      return {
        ...state,
        filters: null,
        filteredTransactions: state.transactions
      };
      
    case SET_ERROR:
      return {
        ...state,
        error: action.payload
      };
      
    case UNDO:
      if (state.historyIndex > 0) {
        return {
          ...state,
          historyIndex: state.historyIndex - 1,
          transactions: state.history[state.historyIndex - 1],
          filteredTransactions: state.filters 
            ? applyFiltersToData(state.history[state.historyIndex - 1], state.filters) 
            : state.history[state.historyIndex - 1]
        };
      }
      return state;
      
    case REDO:
      if (state.historyIndex < state.history.length - 1) {
        return {
          ...state,
          historyIndex: state.historyIndex + 1,
          transactions: state.history[state.historyIndex + 1],
          filteredTransactions: state.filters 
            ? applyFiltersToData(state.history[state.historyIndex + 1], state.filters) 
            : state.history[state.historyIndex + 1]
        };
      }
      return state;
      
    default:
      return state;
  }
};

// Helper function to apply filters
const applyFiltersToData = (transactions, filters) => {
  return transactions.filter(transaction => {
    // Date range filter
    if (filters.startDate && new Date(transaction.date) < filters.startDate) {
      return false;
    }
    if (filters.endDate && new Date(transaction.date) > filters.endDate) {
      return false;
    }
    
    // Amount range filter
    const amount = Math.abs(transaction.amount);
    if (filters.minAmount && amount < parseFloat(filters.minAmount)) {
      return false;
    }
    if (filters.maxAmount && amount > parseFloat(filters.maxAmount)) {
      return false;
    }
    
    // Type filter
    if (filters.type && transaction.type !== filters.type) {
      return false;
    }
    
    // Category filter
    if (filters.category && transaction.category !== filters.category) {
      return false;
    }
    
    // Search term filter
    if (filters.searchTerm && !transaction.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
};

// Create context
export const DataContext = createContext();

// Provider component
export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  
  // Load data from localStorage on initial render
  useEffect(() => {
    const savedData = localStorage.getItem('profitCalculatorData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: SET_TRANSACTIONS, payload: parsedData });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);
  
  // Actions
  const addTransaction = (transaction) => {
    dispatch({ type: ADD_TRANSACTION, payload: transaction });
  };
  
  const updateTransaction = (transaction) => {
    dispatch({ type: UPDATE_TRANSACTION, payload: transaction });
  };
  
  const deleteTransaction = (id) => {
    dispatch({ type: DELETE_TRANSACTION, payload: id });
  };
  
  const setTransactions = (transactions) => {
    dispatch({ type: SET_TRANSACTIONS, payload: transactions });
  };
  
  const applyFilters = (filters) => {
    dispatch({ type: APPLY_FILTERS, payload: filters });
  };
  
  const resetFilters = () => {
    dispatch({ type: RESET_FILTERS });
  };
  
  const setError = (error) => {
    dispatch({ type: SET_ERROR, payload: error });
  };
  
  const undo = () => {
    dispatch({ type: UNDO });
  };
  
  const redo = () => {
    dispatch({ type: REDO });
  };
  
  const saveSession = () => {
    try {
      localStorage.setItem('profitCalculatorData', JSON.stringify(state.transactions));
      alert('Session saved successfully!');
    } catch (error) {
      console.error('Error saving session:', error);
      setError('Failed to save session. Please try again.');
    }
  };
  
  const loadSession = () => {
    const savedData = localStorage.getItem('profitCalculatorData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setTransactions(parsedData);
        return true;
      } catch (error) {
        console.error('Error loading saved data:', error);
        setError('Failed to load saved session. Data might be corrupted.');
        return false;
      }
    } else {
      setError('No saved session found.');
      return false;
    }
  };
  
  // Context value
  const value = {
    transactions: state.filteredTransactions,
    allTransactions: state.transactions,
    categories: state.categories,
    error: state.error,
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setTransactions,
    applyFilters,
    resetFilters,
    setError,
    undo,
    redo,
    saveSession,
    loadSession
  };
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};