const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// ✅ Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email déjà utilisé.' });

    const newAdmin = await Admin.create({ name, email, password });
    res.status(201).json({ message: 'Admin créé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email);

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log('Utilisateur non trouvé');
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }

    const isMatch = await admin.comparePassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.log('Mot de passe incorrect');
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log('Connexion réussie');

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({ message: 'Connexion réussie' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ✅ Obtenir les infos de l'utilisateur connecté (grâce au token dans le cookie)
router.get('/me', async (req, res) => {
  const token = req.cookies.token; // nécessite cookie-parser

  if (!token) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password'); // 🔐 exclure mot de passe

    if (!admin) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    res.json(admin);
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
});
// ✅ Déconnexion (supprime le cookie côté client)
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
  });
  res.json({ message: 'Déconnecté avec succès' });
});
// ✅ GET tous les utilisateurs
router.get('/users', async (req, res) => {
  try {
    const users = await Admin.find({}, 'name email'); // tu peux ajouter d'autres champs si tu veux
    res.json({ count: users.length, users });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /users/count : retourne le nombre total d'utilisateurs
router.get('/users/count', async (req, res) => {
  try {
    const count = await Admin.countDocuments();
    res.json({ count }); // <-- c'est bien du JSON ici
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
// ✅ 1. Demande de réinitialisation
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Admin.findOne({ email });
    if (!user) return res.status(400).json({ message: "Utilisateur introuvable" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // Envoie d’un e-mail (à personnaliser avec ton vrai transporteur SMTP)
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      }
    });

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Réinitialisation de mot de passe',
      html: `<p>Cliquez ici pour réinitialiser votre mot de passe :</p><a href="${resetLink}">${resetLink}</a>`
    });

    res.json({ message: 'E-mail envoyé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ 2. Réinitialisation effective
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Admin.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    user.password = password;
    await user.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (err) {
    res.status(400).json({ message: 'Lien invalide ou expiré' });
  }
});





module.exports = router;
