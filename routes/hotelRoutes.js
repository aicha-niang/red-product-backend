const express = require('express');
const multer = require('multer');
const path = require('path');
const Hotel = require('../models/hotel');

const router = express.Router();

// ✅ Configuration du stockage multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ✅ Ajouter un hôtel avec image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, location, price, description } = req.body;

    const newHotel = new Hotel({
      name,
      location,
      price,
      description,
      image: req.file ? req.file.filename : ''
    });

    const savedHotel = await newHotel.save();
    res.status(201).json(savedHotel);
  } catch (err) {
    console.error('Erreur lors de la création de l’hôtel :', err);
    res.status(400).json({ message: 'Erreur lors de l’enregistrement de l’hôtel' });
  }
});

// ✅ Récupérer tous les hôtels
router.get('/', async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Supprimer un hôtel par ID
router.delete('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hôtel non trouvé' });
    }
    res.json({ message: 'Hôtel supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ✅ Nombre total d’hôtels
router.get('/count', async (req, res) => {
  try {
    const count = await Hotel.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
