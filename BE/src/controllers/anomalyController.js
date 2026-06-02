// Fungsi untuk menghitung Rata-rata (Mean)
const calculateMean = (data) => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, val) => acc + val, 0);
    return sum / data.length;
};

// Fungsi pembantu untuk menghitung Standar Deviasi
const calculateStandardDeviation = (data, mean) => {
    if (data.length === 0) return 0;
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
};

// Fungsi Utama: Cek Anomali Transaksi Baru
const checkAnomaly = async (req, res) => {
    try {
        const { current_transaction_amount, user_id } = req.body;

        // 1. Nanti di sini kita tarik data transaksi historis dari Supabase
        // Dummy data sementara (misal ini riwayat 5 transaksi terakhir user)
        const historyTransactions = [50000, 45000, 55000, 60000, 48000]; 

        // Kalau data historis kurang dari batas minimum (misal 3), belum bisa deteksi
        if (historyTransactions.length < 3) {
            return res.json({
                is_anomaly: false,
                message: "Data riwayat belum cukup untuk mendeteksi anomali."
            });
        }

        // 2. Hitung Mean (Rata-rata)
        const mean = calculateMean(historyTransactions);

        // 3. Hitung Standar Deviasi (Sigma)
        const stdDev = calculateStandardDeviation(historyTransactions, mean);

        // 4. Hitung Z-Score
        let zScore = 0;
        if (stdDev > 0) {
            zScore = (current_transaction_amount - mean) / stdDev;
        }

        // 5. Tentukan status anomali (Threshold umum Z-Score adalah > 2)
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
        console.error("Error detecting anomaly:", error);
        return res.status(500).json({ error: "Gagal memproses analisis anomali" });
    }
};

module.exports = {
    checkAnomaly
};