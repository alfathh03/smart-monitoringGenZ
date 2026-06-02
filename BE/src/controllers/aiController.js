require('dotenv').config();
global.WebSocket = require('ws');

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:5001';

const detectAnomaly = async (req, res) => {
  try {
    const { transactions } = req.body;
    
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return res.status(200).json({ success: true, anomalies: [], model: "Z-Score" });
    }

    const expenses = transactions.filter(t => (t.type || 'expense') === 'expense');
    const amounts = expenses.map(t => Number(t.amount) || 0);
    
    if (amounts.length === 0) {
      return res.status(200).json({ success: true, anomalies: [], model: "Z-Score" });
    }

    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance) || 1; 

    const anomalies = [];
    expenses.forEach(tx => {
      const zScore = Math.abs((tx.amount - mean) / stdDev);
      if (zScore > 2) {
        anomalies.push({
          transaction_id: tx.id,
          z_score: parseFloat(zScore.toFixed(2)), 
          severity: zScore > 3 ? 'high' : 'medium',
          alert_type: 'unusual_spending',
          message: `Terdeteksi pengeluaran mencurigakan sebesar Rp${Number(tx.amount).toLocaleString('id-ID')}`
        });
      }
    });

    res.status(200).json({ success: true, anomalies, model: "Z-Score Inference Engine" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const processOCR = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "File tidak ditemukan" });

  try {
    const form = new FormData();
    form.append('image', fs.createReadStream(req.file.path), req.file.originalname);

    const pythonResponse = await axios.post(`${AI_SERVICE_URL}/api/scan`, form, {
      headers: { ...form.getHeaders() }
    });

    const aiData = pythonResponse.data;
    let receiptUrl = null;
    
    if (supabase) {
      const fileBuffer = fs.readFileSync(req.file.path);
      const fileName = `receipts/${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`; 
      const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, fileBuffer);

      if (!uploadError) {
        receiptUrl = supabase.storage.from('receipts').getPublicUrl(fileName).data.publicUrl;
      }
    }

    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    res.status(200).json({ success: true, ...aiData, receipt_url: receiptUrl });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: "Gagal memproses struk" });
  }
};

const getFinancialInsight = async (req, res) => {
  try {
    const { total, avg_pengeluaran } = req.body;
    const pythonResponse = await axios.post(`${AI_SERVICE_URL}/api/insight`, { total, avg_pengeluaran });
    
    res.status(200).json({ success: true, insight: pythonResponse.data.insight_message });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal ambil insight" });
  }
};

module.exports = { detectAnomaly, processOCR, getFinancialInsight };