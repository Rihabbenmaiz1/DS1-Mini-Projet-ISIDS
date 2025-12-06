const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// -------- REGISTER --------
router.post(
  '/register',
  [
    body('nom').notEmpty().withMessage('الاسم مطلوب'),
    body('login').notEmpty().withMessage('login مطلوب'),
    body('password').isLength({ min: 6 }).withMessage('كلمة السر لازم تكون على الأقل 6 حروف'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { nom, login, password, role } = req.body;
    try {
      let user = await User.findOne({ login });
      if (user) return res.status(400).json({ msg: 'هذا اليوزر موجود مسبقاً' });

      // NE PAS hasher ici : le pre('save') dans UserSchema s'en charge
      user = new User({ nom, login, password, role: role || 'user' });
      await user.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(201).json({ token });
    } catch (err) {
      console.error('Erreur complète REGISTER:', err);
      res.status(500).send('Server Error');
    }
  }
);

// -------- LOGIN --------
router.post(
  '/login',
  [
    body('login').notEmpty().withMessage('login مطلوب'),
    body('password').notEmpty().withMessage('كلمة السر مطلوبة'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { login, password } = req.body;
    try {
      const user = await User.findOne({ login });
      if (!user) return res.status(400).json({ msg: 'يوزر غير موجود' });

      // Logs pour debug
      console.log('Mot de passe entré:', password);
      console.log('Mot de passe hashé DB:', user.password);

      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Résultat compare:', isMatch);

      if (!isMatch) return res.status(400).json({ msg: 'كلمة السر خاطئة' });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (err) {
      console.error('Erreur complète LOGIN:', err);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;






