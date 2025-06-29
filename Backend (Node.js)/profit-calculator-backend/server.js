// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const csv = require('csv-parser');
const xml2js = require('xml2js');
const pdf = require('pdf-parse');
const { createWorker } = require('tesseract.js');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
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
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Excel, CSV, JSON, XML, PDF, and JPG files are allowed.'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Helper function to normalize data
const normalizeData = (data) => {
  return data.map(item => {
    // Ensure consistent structure
    const transaction = {
      id: item.id || String(Date.now() + Math.random()),
      description: item.description || item.name || item.title || 'Unknown',
      date: item.date || new Date().toISOString().split('T')[0],
      amount: parseFloat(item.amount) || 0,
      type: item.type || (parseFloat(item.amount) >= 0 ? 'revenue' : 'expense'),
      category: item.category || 'Other'
    };
    
    // Ensure type is correct based on amount
    if (!item.type) {
      transaction.type = transaction.amount >= 0 ? 'revenue' : 'expense';
    }
    
    // Ensure amount is positive for revenue and negative for expense
    if (transaction.type === 'revenue' && transaction.amount < 0) {
      transaction.amount = Math.abs(transaction.amount);
    } else if (transaction.type === 'expense' && transaction.amount > 0) {
      transaction.amount = -Math.abs(transaction.amount);
    }
    
    return transaction;
  });
};

// Parse Excel files
const parseExcel = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  return normalizeData(data);
};

// Parse CSV files
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(normalizeData(results));
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Parse JSON files
const parseJSON = (filePath) => {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return normalizeData(Array.isArray(data) ? data : [data]);
};

// Parse XML files
const parseXML = (filePath) => {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser({ explicitArray: false });
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      
      parser.parseString(data, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Extract transactions from XML structure
        let transactions = [];
        if (result.transactions && result.transactions.transaction) {
          transactions = Array.isArray(result.transactions.transaction) 
            ? result.transactions.transaction 
            : [result.transactions.transaction];
        }
        
        resolve(normalizeData(transactions));
      });
    });
  });
};

// Parse PDF files
const parsePDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  
  // Simple text extraction - in a real app, you'd use a more sophisticated approach
  const text = data.text;
  
  // Very basic parsing - this would need to be much more robust in a real app
  const lines = text.split('\n').filter(line => line.trim());
  const transactions = [];
  
  for (const line of lines) {
    // Try to extract date, description, and amount using regex
    const dateMatch = line.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
    const amountMatch = line.match(/\$?(\d+,?)+(\.\d{2})?/);
    
    if (dateMatch && amountMatch) {
      const date = dateMatch[0];
      const amount = parseFloat(amountMatch[0].replace(/[$,]/g, ''));
      const description = line
        .replace(dateMatch[0], '')
        .replace(amountMatch[0], '')
        .trim();
      
      transactions.push({
        date: date,
        description: description,
        amount: amount,
        type: amount >= 0 ? 'revenue' : 'expense',
        category: 'Other'
      });
    }
  }
  
  return normalizeData(transactions);
};

// Parse JPG files using OCR
const parseJPG = async (filePath) => {
  const worker = await createWorker();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  
  const { data } = await worker.recognize(filePath);
  await worker.terminate();
  
  const text = data.text;
  
  // Similar basic parsing as PDF
  const lines = text.split('\n').filter(line => line.trim());
  const transactions = [];
  
  // server.js (continued)
  for (const line of lines) {
    const dateMatch = line.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
    const amountMatch = line.match(/\$?(\d+,?)+(\.\d{2})?/);
    
    if (dateMatch && amountMatch) {
      const date = dateMatch[0];
      const amount = parseFloat(amountMatch[0].replace(/[$,]/g, ''));
      const description = line
        .replace(dateMatch[0], '')
        .replace(amountMatch[0], '')
        .trim();
      
      transactions.push({
        date: date,
        description: description,
        amount: amount,
        type: amount >= 0 ? 'revenue' : 'expense',
        category: 'Other'
      });
    }
  }
  
  return normalizeData(transactions);
};

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
};

// Routes

// File upload and parsing
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    let transactions = [];
    
    // Parse file based on extension
    switch (fileExt) {
      case '.xlsx':
      case '.xls':
        transactions = parseExcel(filePath);
        break;
      case '.csv':
        transactions = await parseCSV(filePath);
        break;
      case '.json':
        transactions = parseJSON(filePath);
        break;
      case '.xml':
        transactions = await parseXML(filePath);
        break;
      case '.pdf':
        transactions = await parsePDF(filePath);
        break;
      case '.jpg':
      case '.jpeg':
        transactions = await parseJPG(filePath);
        break;
      default:
        return res.status(400).json({ message: 'Unsupported file format' });
    }
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    res.json({ transactions });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ message: 'Error processing file', error: error.message });
  }
});

// User authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // In a real app, you would validate against a database
  if (email === 'demo@example.com' && password === 'password') {
    const user = {
      id: '1',
      name: 'Demo User',
      email: 'demo@example.com'
    };
    
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
    
    res.json({
      user,
      token
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  // In a real app, you would save to a database and check for existing users
  const user = {
    id: Date.now().toString(),
    name,
    email
  };
  
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
  
  res.status(201).json({
    user,
    token
  });
});

// Protected routes
app.get('/api/user/data', authenticateToken, (req, res) => {
  // In a real app, you would fetch user data from a database
  res.json({
    transactions: [],
    settings: {
      currency: 'USD',
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
      ]
    }
  });
});

app.post('/api/user/data', authenticateToken, (req, res) => {
  const { transactions } = req.body;
  
  // In a real app, you would save to a database
  res.json({ message: 'Data saved successfully' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});