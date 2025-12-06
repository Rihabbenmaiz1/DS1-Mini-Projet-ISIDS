const mongoose = require('mongoose');

// --- Fonction bech nconnectiw b MongoDB ---
// Nchoufou ken l connection temchi normalement, ki temchi t5arrej message ✅
// w ken fama erreur t5arrej l erreur w el process y9if
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connecté ✅');
  } catch (err) {
    console.error(err.message);
    process.exit(1); // no5erjou men l app 5ater fama erreur
  }
};

module.exports = connectDB;

