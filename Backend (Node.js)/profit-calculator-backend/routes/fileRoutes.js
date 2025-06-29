// routes/fileRoutes.js
const express = require('express');
const { processFile } = require('../controllers/fileController');
const upload = require('../middleware/fileUpload');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.post('/upload', authenticateToken, upload.single('file'), processFile);

module.exports = router;