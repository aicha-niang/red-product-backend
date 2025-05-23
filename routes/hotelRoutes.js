const express = require('express');
const multer = require('multer');
const path = require('path'); // <== Important
const Hotel = require('../models/hotel');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
router.delete('/:id', async (req, res) => {
  try {
    await Hotel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Hôtel supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


// Supprimer tous les hôtels (à utiliser temporairement)
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


// recuperer tous les hôtels (à utiliser temporairement)
router.get('/', async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.json(hotels);
  } catch (err) {
    res.status(400).send('Error fetching hotels');
  }
});

// ✅ POST avec upload d'image
router.post('/', upload.single('image'), async (req, res) => {
  const { name, location, price, description } = req.body;

  let image = '';
  if (req.file) {
    image = req.file.filename;
  }

  const newHotel = new Hotel({
    name,
    location,
    price,
    description,
    image
  });

  try {
    const savedHotel = await newHotel.save();
    res.status(201).json(savedHotel);
  } catch (err) {
    console.error(err);
    res.status(400).send('Error saving hotel');
  }
});

// GET /hotels/count
router.get('/count', async (req, res) => {
  try {
    const count = await Hotel.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


module.exports = router;
