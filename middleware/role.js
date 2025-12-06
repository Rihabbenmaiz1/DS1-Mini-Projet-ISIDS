// Middleware bech n3aynou shkun ynajjem ya3mel action 3la hasb el role
const role = (roles) => {
  return (req, res, next) => {

    // Ken role mta3 l user moch mawjoud fel roles 
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'vous pouvez pas faire cette opération' });
    }

    // Kol chy behi → net3adew lel next middleware
    next();
  };
};

module.exports = role;

