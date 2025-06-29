// DataExportComponent.jsx
import React, { useContext } from 'react';
import { 
  Button, Typography, Paper, Grid, 
  FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
import { 
  FileDownload as DownloadIcon,
  Save as SaveIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { DataContext } from '../contexts/DataContext';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const DataExportComponent = () => {
  const { transactions, saveSession } = useContext(DataContext);
  const [exportFormat, setExportFormat] = React.useState('xlsx');
  
  const handleExportFormatChange = (event) => {
    setExportFormat(event.target.value);
  };
  
  const handleExport = () => {
    if (transactions.length === 0) {
      alert('No data to export');
      return;
    }
    
    const exportData = transactions.map(t => ({
      Date: new Date(t.date).toLocaleDateString(),
      Description: t.description,
      Type: t.type.charAt(0).toUpperCase() + t.type.slice(1),
      Category: t.category,
      Amount: t.type === 'revenue' ? t.amount : -t.amount
    }));
    
    switch (exportFormat) {
      case 'xlsx':
        exportToExcel(exportData);
        break;
      case 'csv':
        exportToCSV(exportData);
        break;
      case 'pdf':
        exportToPDF(exportData);
        break;
      case 'json':
        exportToJSON(transactions);
        break;
      default:
        exportToExcel(exportData);
    }
  };
  
  const exportToExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'profit_calculator_data.xlsx');
  };
  
  const exportToCSV = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'profit_calculator_data.csv');
  };
  
  const exportToPDF = (data) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Profit Calculator Report', 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Calculate totals
    const totalRevenue = transactions
      .filter(t => t.type === 'revenue')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    const profit = totalRevenue - totalExpenses;
    
    // Add summary
    doc.setFontSize(14);
    doc.text('Summary', 14, 40);
    
    doc.setFontSize(10);
    doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 14, 48);
    doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, 14, 54);
    doc.text(`Net Profit: $${profit.toFixed(2)}`, 14, 60);
    
    // Add transactions table
    doc.autoTable({
      head: [['Date', 'Description', 'Type', 'Category', 'Amount']],
      body: data.map(item => [
        item.Date,
        item.Description,
        item.Type,
        item.Category,
        `$${Math.abs(item.Amount).toFixed(2)}`
      ]),
      startY: 70,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    doc.save('profit_calculator_report.pdf');
  };
  
  const exportToJSON = (data) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    saveAs(blob, 'profit_calculator_data.json');
  };
  
  const handleSaveSession = () => {
    saveSession();
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Export & Save Data
      </Typography>
      
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={5}>
          <FormControl fullWidth size="small">
            <InputLabel>Export Format</InputLabel>
            <Select
              value={exportFormat}
              label="Export Format"
              onChange={handleExportFormatChange}
            >
              <MenuItem value="xlsx">Excel (.xlsx)</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="pdf">PDF Report</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={7}>
          <Grid container spacing={1}>
           // DataExportComponent.jsx (continued)
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
              >
                Export Data
              </Button>
            </Grid>
            
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<SaveIcon />}
                onClick={handleSaveSession}
              >
                Save Session
              </Button>
            </Grid>
            
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<PdfIcon />}
                onClick={() => setExportFormat('pdf') || handleExport()}
              >
                Generate PDF Report
              </Button>
            </Grid>
          </Grid>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary">
            Export your data in various formats or save your current session to continue later.
            All saved sessions are stored securely and can be imported at any time.
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DataExportComponent;