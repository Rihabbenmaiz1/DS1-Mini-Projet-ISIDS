const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware bech nverifiw el token w n3aynou shkun el user elli baath el request
const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Ken ma famech tokken, el user moch connecté
  if (!token) return res.status(401).json({ msg: 'Token manquant, veuillez vous connecter' });

  try {
    // Nfarkou el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

       // Nlawej 3al user b id elli f token
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ msg: 'Utilisateur non trouvé' });

    // N7ottou el user fel request bech najmou nist7a9ouh ba3d
    req.user = user;
    next();

  } catch (err) {
    console.error(err.message);
    return res.status(401).json({ msg: 'Token invalide ou expiré' });
  }
};

module.exports = authMiddleware;



