const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const hotelRoutes = require('./routes/hotelRoutes');

require('dotenv').config();

const app = express();

// ✅ Autoriser plusieurs origines (local + frontend Render)
const allowedOrigins = [
  'http://localhost:3000',
  'https://red-product-frontend-rpp0.onrender.com' // ← Remplace par ton vrai domaine Render
];

app.use(cors({
  origin: function (origin, callback) {
    // autorise requêtes sans origin (comme Postman) ou depuis frontend connu
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✅ Middleware pour parser JSON et cookies
app.use(express.json());
app.use(cookieParser());

// ✅ Route statique pour les images uploadées
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Routes principales
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);

// ✅ Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
