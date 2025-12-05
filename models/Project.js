const mongoose = require('mongoose');

// هنا كنديرو ال schema ديال ال projects
const ProjectSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  proprietaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // كل project مربوط ب user
    required: true,
  },
  statut: {
    type: String,
    enum: ['en cours', 'termine', 'en pause'],
    default: 'en cours',
  },
  dateCreation: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Project', ProjectSchema);
