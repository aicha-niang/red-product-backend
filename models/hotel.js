const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  image: {
    type: String // Nom du fichier image stocké
  }
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);
