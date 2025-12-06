const mongoose = require('mongoose');

// --- Schema mta3 el Projects ---
// Houni na3mlou structure mta3 project: nom, description, proprietaire, statut w dateCreation
const ProjectSchema = new mongoose.Schema({
  // 3onwen el project
  nom: {
    type: String,
    required: true,
  },

  // description mech bessyf
  description: {
    type: String,
  },

  // l user eli moula el project (obligatoire)
  proprietaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // kol projet mconnecti b user
    required: true,
  },

  // statut mta3 el project
  statut: {
    type: String,
    enum: ['en cours', 'termine', 'en pause'],
    default: 'en cours',
  },

  // date creation
  dateCreation: {
    type: Date,
    default: Date.now,
  },
});

// nasn3ou el model
module.exports = mongoose.model('Project', ProjectSchema);

