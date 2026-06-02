const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectRabbitMQ } = require('./config/rabbitmq'); 

// Import kumpulan rute API
const apiRoutes = require('./routes/api');
const profileRoutes = require('./routes/profileRoutes');

const app = express();
const PORT = process.env.PORT || 5000; 

// Middleware Agar bisa menerima data JSON dan tidak diblokir React
app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);
app.use('/api/profiles', profileRoutes);

app.get('/', (req, res) => {
  res.status(200).send('Server is running and healthy!');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server Back-End berjalan di http://0.0.0.0:${PORT}`);
  // Nyalakan koneksi RabbitMQ 
  if (connectRabbitMQ) {
    try {
      await connectRabbitMQ();
      console.log('RabbitMQ berhasil disambungkan!');
    } catch (err) {
      console.error('Gagal menyambungkan RabbitMQ:', err.message);
    }
  }
});