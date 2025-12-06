const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// --- Schema mta3 el User ---
// Houni na3mlou structure mta3 user: nom, login, password, role w dateCreation
const UserSchema = new mongoose.Schema({
  nom: { type: String, required: true },           // ism el user
  login: { type: String, required: true, unique: true }, // login unique
  password: { type: String, required: true },      // mot de passe
  role: { type: String, enum: ['user', 'manager'], default: 'user' }, // role
  dateCreation: { type: Date, default: Date.now }, // date creation
});

// --- Middleware bech nhashiw password qbal ma nsajlou el user ---
// Ken password mech modifié, mat3mlech hash
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// --- nassen3ou model User ---
module.exports = mongoose.model('User', UserSchema);




