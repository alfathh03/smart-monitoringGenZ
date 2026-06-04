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

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'https://alfathnafis-ai-smartbudget.hf.space';

const detectAnomaly = async (req, res) => {
  try {
    const { transactions } = req.body;
    
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return res.status(200).json({ success: true, anomalies: [], model: "Z-Score" });
    }

    const expenses = transactions.filter(t => (t.type || 'expense') === 'expense');
    
    const amounts = expenses.map(t => {
      let val = t.amount;
      if (typeof val === 'string') {
        val = val.replace(/[^0-9.-]+/g, ""); 
      }
      return Number(val) || 0;
    });
    
    if (amounts.length === 0) {
      return res.status(200).json({ success: true, anomalies: [], model: "Z-Score" });
    }

    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance) || 1; 

    const anomalies = [];
    expenses.forEach((tx, index) => {
      const cleanAmount = amounts[index];
      const zScore = Math.abs((cleanAmount - mean) / stdDev);
      if (zScore > 2) {
        anomalies.push({
          transaction_id: tx.id,
          z_score: parseFloat(zScore.toFixed(2)), 
          severity: zScore > 3 ? 'high' : 'medium',
          alert_type: 'unusual_spending',
          message: `Terdeteksi pengeluaran mencurigakan sebesar Rp${cleanAmount.toLocaleString('id-ID')}`
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
    
    console.log("Menerima data dari FE - Total:", total, "Avg:", avg_pengeluaran);

    if (!process.env.GEMINI_API_KEY) {
      console.error("KUNCI GEMINI KOSONG DI SERVER!");
      return res.status(500).json({ success: false, message: "Kunci Gemini belum dipasang di backend!" });
    }

    const prompt = `Kamu adalah asisten keuangan cerdas, asik, dan gaul untuk anak Gen Z di aplikasi Smart Budget.\nBulan ini, pengguna telah menghabiskan total pengeluaran sebesar Rp${total} dengan rata-rata Rp${avg_pengeluaran} per transaksi.\nBerikan 1 paragraf pendek (maksimal 3 kalimat) berisi insight dan saran keuangan berdasarkan angka tersebut. Gunakan bahasa gaul yang santai (seperti pakai kata lu/gue), memotivasi, dan WAJIB HINDARI penggunaan pemformatan markdown (jangan pakai tanda bintang atau cetak tebal).`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      { 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

    const insightMessage = response.data.candidates[0].content.parts[0].text;
    
    res.status(200).json({ success: true, insight: insightMessage });

  } catch (error) {
    const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error("GEMINI DIRECT API ERROR:", errorMsg);
    
    res.status(500).json({ 
        success: false, 
        message: "Gagal memproses insight dengan AI", 
        error_detail: errorMsg 
    });
  }
};

const calculateMean = (data) => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, val) => acc + val, 0);
    return sum / data.length;
};

const calculateStandardDeviation = (data, mean) => {
    if (data.length === 0) return 0;
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
};

const checkAnomaly = async (req, res) => {
    try {
        let { current_transaction_amount, user_id } = req.body;

        if (typeof current_transaction_amount === 'string') {
            current_transaction_amount = parseFloat(current_transaction_amount.replace(/[^0-9.-]+/g, ""));
        }

        const historyTransactions = [50000, 45000, 55000, 60000, 48000]; 

        if (historyTransactions.length < 3) {
            return res.json({
                is_anomaly: false,
                message: "Data riwayat belum cukup untuk mendeteksi anomali."
            });
        }

        const mean = calculateMean(historyTransactions);
        const stdDev = calculateStandardDeviation(historyTransactions, mean);

        let zScore = 0;
        if (stdDev > 0) {
            zScore = (current_transaction_amount - mean) / stdDev;
        }

        const isAnomaly = zScore > 2;

        return res.json({
            transaction_amount: current_transaction_amount,
            mean_history: Math.round(mean),
            z_score: parseFloat(zScore.toFixed(2)),
            is_anomaly: isAnomaly,
            message: isAnomaly 
                ? "Peringatan: Pengeluaran ini bengkak dan di luar kebiasaanmu!" 
                : "Pengeluaran masih dalam batas wajar."
        });

    } catch (error) {
        return res.status(500).json({ error: "Gagal memproses analisis anomali" });
    }
};

module.exports = { detectAnomaly, processOCR, getFinancialInsight, checkAnomaly };