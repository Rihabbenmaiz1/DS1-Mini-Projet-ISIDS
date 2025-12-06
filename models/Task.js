const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  statut: {
    type: String,
    enum: ['todo', 'doing', 'done'],
    default: 'todo',
  },
  deadline: {
    type: Date,
  },
  projet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  dateCreation: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Task', TaskSchema);

