const express = require('express');
const router = express.Router();

// 1. TAMBAHKAN MULTER
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 

// Import Controller
const aiController = require('../controllers/aiController');
const transactionController = require('../controllers/transactionController');

// Import Middleware Joi
const validateTransaction = require('../middleware/validateTransaction');

// --- ROUTE TES DASAR ---
router.get('/status', (req, res) => {
  res.json({ message: "API Backend ready" });
});

// --- ROUTE TRANSAKSI (Redis & RabbitMQ Terintegrasi di Controller) ---
router.get('/transactions', transactionController.getTransactions);
router.post('/transactions', validateTransaction, transactionController.addTransaction);

// --- ROUTE AI & OCR ---
router.post('/anomaly-detect', aiController.detectAnomaly);

router.post('/ocr-receipt', upload.single('receiptImage'), aiController.processOCR);

router.post('/generate-insight', aiController.getFinancialInsight);

module.exports = router;