const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/authmiddleware'); // middleware bech yverify token w y3rf user
const role = require('../middleware/role'); // middleware bech ycheck role mta3 user

// -------- AJOUTER UNE TÂCHE --------
// Route POST: bech n'ajoutiw task jdida
// User normal ynajem y3ayet ken lrouhou , manager y9adar y3ayet lel lo5ryn
router.post('/', auth, async (req, res) => {
  try {
    const { titre, description, statut, deadline, projetId, utilisateurId } = req.body;

    // Ncheckiw validité mta3 statut
    const validStatus = ['todo', 'doing', 'done'];
    if (statut && !validStatus.includes(statut)) {
      return res.status(400).json({ msg: "Le statut doit être todo/doing/done" });
    }

    // Ncheckiw ken projet mawjoud
    const projet = await Project.findById(projetId);
    if (!projet) return res.status(404).json({ msg: "Projet non trouvé" });

    // User normal ma ynajamech yassigni utilisateur wa7de5er
    if (utilisateurId && req.user.role !== 'manager') {
      return res.status(403).json({ msg: "Non autorisé à assigner un utilisateur" });
    }

    // Création mta3 task
    const task = new Task({
      titre,
      description,
      statut: statut || 'todo',
      deadline,
      projet: projetId,
      utilisateur: utilisateurId || req.user.id, // ken ID ma 3tatich → user li 3mal task
    });

    await task.save();
    res.status(201).json({ msg: "Tâche ajoutée avec succès", task });

  } catch (err) {
    console.error("Erreur création task :", err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
});

// -------- OBTENIR LES TÂCHES (avec tri et recherche) --------
// Route GET: bech el user ychouf tasks mta3ou / tri / recherche
router.get('/', auth, async (req, res) => {
  try {
    let { sort, order, search } = req.query;

    // valeurs par défaut
    sort = sort || 'dateCreation';
    order = order === 'desc' ? -1 : 1;

    let filter = {};

    // User normal → yab3ath ken les tâches mte3ou
    if (req.user.role !== 'manager') {
      filter.utilisateur = req.user.id;
    }

    // Recherche b titre
    if (search) {
      filter.titre = { $regex: search, $options: 'i' };
    }

    const tasks = await Task.find(filter)
      .sort({ [sort]: order })
      .populate('projet', 'nom')
      .populate('utilisateur', 'nom login');

    res.json(tasks);

  } catch (err) {
    console.error("Erreur get tasks :", err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
});

// -------- OBTENIR LES TÂCHES D’UN PROJET --------
// Route GET /projet/:projetId: bech ngetiw kol tasks mta3 projet
router.get('/projet/:projetId', auth, async (req, res) => {
  try {
    const { projetId } = req.params;
    const projet = await Project.findById(projetId);
    if (!projet) return res.status(404).json({ msg: "Projet non trouvé" });

    let tasks;
    if (req.user.role === 'manager') {
      // manager ychouf tasks el kol 
      tasks = await Task.find({ projet: projetId }).populate('utilisateur', 'nom login');
    } else {
      // user normal → ken houwa propriétaire
      if (projet.proprietaire.toString() !== req.user.id) {
        return res.status(403).json({ msg: "Non autorisé à voir ces tâches du projet" });
      }
      tasks = await Task.find({ projet: projetId });
    }

    res.json(tasks);

  } catch (err) {
    console.error("Erreur get tasks by project :", err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
});

// -------- OBTENIR LES TÂCHES D’UN UTILISATEUR --------
// Route GET /user/:userId: bech ngetiw kol tasks mta3 user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // User normal ychouf ken tasks mta3ou
    if (req.user.role !== 'manager' && req.user.id !== userId) {
      return res.status(403).json({ msg: "Non autorisé à voir ces tâches" });
    }

    const tasks = await Task.find({ utilisateur: userId })
      .populate('projet', 'nom')
      .populate('utilisateur', 'nom login');

    res.json(tasks);

  } catch (err) {
    console.error("Erreur get tasks by user :", err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
});

// -------- METTRE À JOUR UNE TÂCHE --------
// Route PUT /:id: bech nupdate task
router.put('/:id', auth, async (req, res) => {
  try {
    const { titre, description, statut, utilisateurId, deadline } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Tâche non trouvée" });

    // User normal ma ynajamech ybadel l'utilisateur assigné
    if (utilisateurId && req.user.role !== 'manager') {
      return res.status(403).json({ msg: "Non autorisé à assigner un utilisateur" });
    }

    // bech nupdate champs
    if (titre) task.titre = titre;
    if (description) task.description = description;
    if (statut) {
      const validStatus = ['todo', 'doing', 'done'];
      if (!validStatus.includes(statut)) {
        return res.status(400).json({ msg: "Le statut doit être todo/doing/done" });
      }
      task.statut = statut;
    }
    if (deadline) task.deadline = deadline;
    if (utilisateurId) task.utilisateur = utilisateurId;

    await task.save();
    res.json({ msg: "Tâche mise à jour avec succès", task });

  } catch (err) {
    console.error("Erreur update task :", err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
});

// -------- SUPPRIMER UNE TÂCHE --------
// Route DELETE /:id: bech nfasa5 task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Tâche non trouvée" });

    const projet = await Project.findById(task.projet);
    // User normal → ynajem yfasa5 ken task mta3ou
    if (req.user.role !== 'manager' && projet.proprietaire.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Non autorisé à supprimer cette tâche" });
    }

    await Task.deleteOne({ _id: task._id });
    res.json({ msg: "Tâche supprimée avec succès" });

  } catch (err) {
    console.error("Erreur delete task :", err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
});

module.exports = router;

