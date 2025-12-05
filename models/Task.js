const mongoose = require('mongoose');

// هنا كنديرو ال schema ديال ال tasks
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
    enum: ['todo', 'doing', 'done'], // فقط هادو بجوج ديال ال status
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
  utilisateurAssigné: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  dateCreation: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Task', TaskSchema);
