const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Importer les middlewares
const auth = require('../middleware/authmiddleware');
const role = require('../middleware/role');

// -------- REGISTER --------
router.post(
  '/register',
  [
    body('nom').notEmpty().withMessage('الاسم مطلوب'),
    body('login').notEmpty().withMessage('login مطلوب'),
    body('password').isLength({ min: 6 }).withMessage('كلمة السر لازم تكون على الأقل 6 حروف'),
    body('role').optional().isIn(['user', 'manager']).withMessage('role غير صالح'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { nom, login, password, role: newRole } = req.body;

    try {
      const existingUser = await User.findOne({ login });
      if (existingUser) return res.status(400).json({ msg: 'هذا اليوزر موجود مسبقاً' });

      const userCount = await User.countDocuments();
      let user;

      if (userCount === 0) {
        // ⚡ Premier utilisateur → créer manager
        user = new User({ nom, login, password, role: 'manager' });
      } else {
        // Les suivants → nécessitent token d’un manager
        if (!req.headers.authorization) {
          return res.status(403).json({ msg: "غير مسموحلك" });
        }

        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const requestingUser = await User.findById(decoded.id);

        if (!requestingUser || requestingUser.role !== 'manager') {
          return res.status(403).json({ msg: "غير مسموحلك" });
        }

        user = new User({ nom, login, password, role: newRole || 'user' });
      }

      await user.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.status(201).json({ token, user: { id: user._id, nom: user.nom, login: user.login, role: user.role } });
    } catch (err) {
      console.error('Erreur REGISTER:', err);
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

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'كلمة السر خاطئة' });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, user: { id: user._id, nom: user.nom, login: user.login, role: user.role } });
    } catch (err) {
      console.error('Erreur LOGIN:', err);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;








