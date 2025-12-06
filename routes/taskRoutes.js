const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/authmiddleware'); // middleware ديال التوكن
const role = require('../middleware/role'); // middleware ديال الرول

// -------- AJOUTER UNE TÂCHE --------
router.post('/', auth, async (req, res) => {
  try {
    const { titre, description, statut, deadline, projetId, utilisateurId } = req.body;

    // التأكد من صحة ال statut
    const validStatus = ['todo', 'doing', 'done'];
    if (statut && !validStatus.includes(statut)) {
      return res.status(400).json({ msg: "الستاتوس خاص يكون todo/doing/done" });
    }

    // التأكد أن المشروع كاين
    const projet = await Project.findById(projetId);
    if (!projet) return res.status(404).json({ msg: "المشروع ما كاينش" });

    // User عادي ما يقدرش يعين مستخدم آخر
    if (utilisateurId && req.user.role !== 'manager') {
      return res.status(403).json({ msg: "غير مسموحلك تعين مستخدم" });
    }

    // إنشاء التاسك
    const task = new Task({
      titre,
      description,
      statut: statut || 'todo',
      deadline,
      projet: projetId,
      utilisateur: utilisateurId || req.user.id, // إذا ما عطاتش ID، اليوزر لي دار التاسك هو المعيّن
    });

    await task.save();
    res.status(201).json({ msg: "التاسك تزاد بنجاح", task });

  } catch (err) {
    console.error("Erreur création task :", err);
    res.status(500).json({ msg: "خطأ فالسيرفر" });
  }
});

// -------- OBTENIR LES TÂCHES (avec tri et recherche) --------
router.get('/', auth, async (req, res) => {
  try {
    let { sort, order, search } = req.query;

    // valeurs par défaut
    sort = sort || 'dateCreation';
    order = order === 'desc' ? -1 : 1;

    let filter = {};

    // User normal → ne voit que ses tâches
    if (req.user.role !== 'manager') {
      filter.utilisateur = req.user.id;
    }

    // Recherche par titre
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
    res.status(500).json({ msg: "خطأ فالسيرفر" });
  }
});

// -------- OBTENIR LES TÂCHES D’UN PROJET --------
router.get('/projet/:projetId', auth, async (req, res) => {
  try {
    const { projetId } = req.params;
    const projet = await Project.findById(projetId);
    if (!projet) return res.status(404).json({ msg: "المشروع ما كاينش" });

    let tasks;
    if (req.user.role === 'manager') {
      tasks = await Task.find({ projet: projetId })
        .populate('utilisateur', 'nom login');
    } else {
      if (projet.proprietaire.toString() !== req.user.id) {
        return res.status(403).json({ msg: "ماعندكش الحق تشوف هاد المشروع" });
      }
      tasks = await Task.find({ projet: projetId });
    }

    res.json(tasks);

  } catch (err) {
    console.error("Erreur get tasks by project :", err);
    res.status(500).json({ msg: "خطأ فالسيرفر" });
  }
});

// -------- OBTENIR LES TÂCHES D’UN UTILISATEUR --------
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.role !== 'manager' && req.user.id !== userId) {
      return res.status(403).json({ msg: "ماعندكش الحق تشوف هاد التاسكات" });
    }

    const tasks = await Task.find({ utilisateur: userId })
      .populate('projet', 'nom')
      .populate('utilisateur', 'nom login');

    res.json(tasks);

  } catch (err) {
    console.error("Erreur get tasks by user :", err);
    res.status(500).json({ msg: "خطأ فالسيرفر" });
  }
});

// -------- METTRE À JOUR UNE TÂCHE --------
router.put('/:id', auth, async (req, res) => {
  try {
    const { titre, description, statut, utilisateurId, deadline } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "التاسك ما كاينش" });

    if (utilisateurId && req.user.role !== 'manager') {
      return res.status(403).json({ msg: "غير مسموحلك تعين مستخدم" });
    }

    if (titre) task.titre = titre;
    if (description) task.description = description;
    if (statut) {
      const validStatus = ['todo', 'doing', 'done'];
      if (!validStatus.includes(statut)) {
        return res.status(400).json({ msg: "الستاتوس خاص يكون todo/doing/done" });
      }
      task.statut = statut;
    }
    if (deadline) task.deadline = deadline;
    if (utilisateurId) task.utilisateur = utilisateurId;

    await task.save();
    res.json({ msg: "التاسك تبدل بنجاح", task });

  } catch (err) {
    console.error("Erreur update task :", err);
    res.status(500).json({ msg: "خطأ فالسيرفر" });
  }
});

// -------- SUPPRIMER UNE TÂCHE --------
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "التاسك ما كاينش" });

    const projet = await Project.findById(task.projet);
    if (req.user.role !== 'manager' && projet.proprietaire.toString() !== req.user.id) {
      return res.status(403).json({ msg: "ماعندكش الحق تحذف هاد التاسك" });
    }

    await Task.deleteOne({ _id: task._id });
    res.json({ msg: "التاسك تحيد بنجاح" });

  } catch (err) {
    console.error("Erreur delete task :", err);
    res.status(500).json({ msg: "خطأ فالسيرفر" });
  }
});

module.exports = router;

