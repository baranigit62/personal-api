const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// 🔥 MongoDB bağlantısı — senin URI’nle ayarlanmış
const MONGO_URI = "mongodb+srv://barandenemr:u1Bsu5H0NrKLZ1vb@cluster0.rbmj97m.mongodb.net/personelTakip?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB bağlandı!'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// 🔥 Log şeması
const logSchema = new mongoose.Schema({
  uid: String,
  name: String,
  action: String,      // GIRIS / CIKIS
  timestamp: String,   // 2025-11-28 11:23:10
  createdAt: { type: Date, default: Date.now }
});

const Log = mongoose.model('Log', logSchema);

// 🔥 ESP32 log gönderme endpoint’i
app.post('/log', async (req, res) => {
  try {
    const { uid, name, action, timestamp } = req.body;

    if (!uid || !action) {
      return res.status(400).json({ ok: false, error: "uid ve action zorunlu" });
    }

    const log = new Log({ uid, name, action, timestamp });
    await log.save();

    res.json({ ok: true });
  } catch (err) {
    console.error("Log kayıt hatası:", err);
    res.status(500).json({ ok: false, error: "server hata" });
  }
});

// 🔥 Test endpoint’i: kayıtları görmek için
app.get('/logs', async (req, res) => {
  const logs = await Log.find().sort({ createdAt: -1 }).limit(50);
  res.json(logs);
});

// 🔥 Server başlat
app.listen(3000, () => {
  console.log("API ayakta! → http://localhost:3000");
});
