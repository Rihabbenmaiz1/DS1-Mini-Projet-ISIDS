const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// --- Controller bech nregistriw user ---
// nchoufou l erreurs mta3 validation, ken fama erreur → 400
// nchoufou  ken l user deja mawjoud, sinon na3mlou user jdid w njibou token JWT
exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { nom, login, password, role } = req.body;

  try {
    let user = await User.findOne({ login });
    if (user) return res.status(400).json({ msg: 'Utilisateur déjà existant' });

    // nassen3ou l'user
    user = new User({ nom, login, password, role: role || 'user' });
    await user.save();

    // nassen3ou  token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- Controller bech nlogiw user ---
// Nchoufou les erreurs de validation, ken user mawjoud, compare password, njibou token
exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { login, password } = req.body;

  try {
    const user = await User.findOne({ login });
    if (!user) return res.status(400).json({ msg: 'Utilisateur non trouvé' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Mot de passe incorrect' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};



