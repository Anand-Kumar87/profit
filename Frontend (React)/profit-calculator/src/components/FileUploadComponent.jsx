// FileUploadComponent.jsx
import React, { useState, useContext } from 'react';
import { Button, Typography, LinearProgress, Paper, Grid } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { DataContext } from '../contexts/DataContext';
import axios from 'axios';

const FileUploadComponent = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { setTransactions, setError } = useContext(DataContext);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'application/json',
        'application/xml',
        'text/xml',
        'application/pdf',
        'image/jpeg',
        'image/jpg'
      ];
      
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Invalid file type. Please upload Excel, CSV, JSON, XML, PDF or JPG files.');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    setUploading(true);
    
    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });
      
      setTransactions(response.data.transactions);
      setUploading(false);
      setUploadProgress(0);
      setFile(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Error uploading file');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload Company Data
      </Typography>
      
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            fullWidth
          >
            Select File
            <input
              type="file"
              hidden
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv,.json,.xml,.pdf,.jpg,.jpeg"
            />
          </Button>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!file || uploading}
            fullWidth
          >
            Upload and Process
          </Button>
        </Grid>
        
        {file && (
          <Grid item xs={12}>
            <Typography variant="body2">
              Selected file: {file.name}
            </Typography>
          </Grid>
        )}
        
        {uploading && (
          <Grid item xs={12}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="caption" align="center" display="block">
              {uploadProgress}% Uploaded
            </Typography>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default FileUploadComponent;