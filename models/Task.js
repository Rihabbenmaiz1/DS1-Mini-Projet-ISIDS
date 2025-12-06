const mongoose = require('mongoose');

// Schema mta3 el Task: shnouwa tzid, chnou types, w chnouwa obligatoire
const TaskSchema = new mongoose.Schema({
  // 3onwen el task
  titre: {
    type: String,
    required: true,
  },

  // description ikhtiyari
  description: {
    type: String,
  },

  // statut mta3 el task (todo / doing / done)
  statut: {
    type: String,
    enum: ['todo', 'doing', 'done'],
    default: 'todo',
  },

  // deadline mta3 el task
  deadline: {
    type: Date,
  },

  // l project eli teb3ou el task (obligatoire)
  projet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },

  // l user eli mas2oul 3al task
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // date eli ttsan3et fiha el task
  dateCreation: {
    type: Date,
    default: Date.now,
  },
});

// nasn3ou el model mta3 Task
module.exports = mongoose.model('Task', TaskSchema);


