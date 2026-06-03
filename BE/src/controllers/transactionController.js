const supabase = require('../config/supabaseClient');
const redisClient = require('../config/redisClient');
const { sendToQueue } = require('../config/rabbitmq');

const getTransactions = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : 'd7628eef-242e-4142-80d4-cb8fadba041b'; 
        const cacheKey = `dashboard_data_${userId}`;

        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            return res.status(200).json({
                message: 'Berhasil mengambil data transaksi',
                source: 'Redis Cache',
                data: JSON.parse(cachedData)
            });
        }

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false }); 

        if (error) throw error;

        await redisClient.setEx(cacheKey, 3600, JSON.stringify(data));

        return res.status(200).json({
            message: 'Berhasil mengambil data transaksi',
            source: 'Supabase Database',
            data: data
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const addTransaction = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : 'd7628eef-242e-4142-80d4-cb8fadba041b';
        
        let { type, amount, category, description, source, date, is_ocr, image_url } = req.body;

        let cleanAmount = amount;
        if (typeof amount === 'string') {
            cleanAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10);
        }

        const { data: transaction, error: txError } = await supabase
            .from('transactions')
            .insert([{ 
                user_id: userId, 
                type: type,             
                amount: cleanAmount, 
                category: category,          
                description: description,     
                source: source,         
                date: date, 
                is_ocr: is_ocr || false,              
                image_url: image_url 
            }])
            .select();

        if (txError) throw txError;

        const cacheKey = `dashboard_data_${userId}`;
        if (typeof redisClient !== 'undefined') {
            await redisClient.del(cacheKey);
        }

        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('points')
                .eq('id', userId)
                .single();

            const currentPoints = profile?.points || 0;
            const poinDidapat = 10;

            await supabase
                .from('profiles')
                .update({ points: currentPoints + poinDidapat })
                .eq('id', userId);
        } catch (pointError) {
            console.error(pointError.message);
        }

        if (is_ocr && image_url) {
            try {
                sendToQueue('ocr_tasks', { 
                    transaction_id: transaction[0].id, 
                    user_id: userId,
                    image_url: image_url,
                    timestamp: new Date()
                });
            } catch (qErr) {
                console.error(qErr.message);
            }
        }

        return res.status(201).json({
            message: 'Transaksi berhasil disimpan dan poin bertambah!',
            data: transaction
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = { getTransactions, addTransaction };