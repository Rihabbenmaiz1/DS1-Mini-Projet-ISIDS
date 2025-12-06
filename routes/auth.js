const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// njybou les middlewares
const auth = require('../middleware/authmiddleware'); // middleware bech yverify token w y3rf user
const role = require('../middleware/role'); // middleware bech ycheck role mta3 user

// -------- REGISTER --------
// Route POST: bech nregistriw user jdid
// Si awel user → direct manager
// Sinon user 3ady → lezem token mta3 manager
router.post(
  '/register',
  [
    // nvalidiw les champs
    body('nom').notEmpty().withMessage('Le nom est requis'),
    body('login').notEmpty().withMessage('Le login est requis'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('role').optional().isIn(['user', 'manager']).withMessage('Role invalide'),
  ],
  async (req, res) => {
    // nthabtou si fama erreurs fel validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { nom, login, password, role: newRole } = req.body;

    try {
      // nthabtou ken l user deja mawjoud
      const existingUser = await User.findOne({ login });
      if (existingUser) return res.status(400).json({ msg: 'L’utilisateur existe déjà' });

      const userCount = await User.countDocuments();
      let user;

      if (userCount === 0) {
        // awel utilisateur → manager manghyr mat5amem
        user = new User({ nom, login, password, role: 'manager' });
      } else {
        // ely ba3dou y9awy sa3dou → yestha9 token manager
        if (!req.headers.authorization) {
          // Ken ma famech token → dowiw
          return res.status(403).json({ msg: "Non autorisé" });
        }

        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const requestingUser = await User.findById(decoded.id);

        // Ken l user eli talab creation mech manager → dowiw
        if (!requestingUser || requestingUser.role !== 'manager') {
          return res.status(403).json({ msg: "Non autorisé" });
        }

        // création mta3 l user normal
        user = new User({ nom, login, password, role: newRole || 'user' });
      }

      await user.save();

      // création mta3 token JWT
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // naba3thou token w info mta3 user
      res.status(201).json({ 
        token, 
        user: { id: user._id, nom: user.nom, login: user.login, role: user.role } 
      });
    } catch (err) {
      console.error('Erreur REGISTER:', err);
      res.status(500).send('Erreur serveur');
    }
  }
);

// -------- LOGIN --------
// Route POST: bech nlogin user
// nthabtou login/password, création token JWT
router.post(
  '/login',
  [
    // validation mta3 les champs
    body('login').notEmpty().withMessage('Le login est requis'),
    body('password').notEmpty().withMessage('Le mot de passe est requis'),
  ],
  async (req, res) => {
    // Ncheckiw les erreurs fel validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { login, password } = req.body;
    try {
      // nsearchiw l user b login
      const user = await User.findOne({ login });
      if (!user) return res.status(400).json({ msg: 'Utilisateur non trouvé' });

      // ncompareiw password m3a bcrypt
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Mot de passe incorrect' });

      // nassen3ou token JWT
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // naba3thou token w info mta3 user
      res.json({ 
        token, 
        user: { id: user._id, nom: user.nom, login: user.login, role: user.role } 
      });
    } catch (err) {
      console.error('Erreur LOGIN:', err);
      res.status(500).send('Erreur serveur');
    }
  }
);

module.exports = router;









