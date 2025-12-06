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
    if (!projet) {
      return res.status(404).json({ msg: "المشروع ما كاينش" });
    }

    // Si utilisateur normal veut assigner une tâche → interdit
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

    res.status(201).json({
      msg: "التاسك تزاد بنجاح",
      task
    });

  } catch (err) {
    console.error("Erreur création task :", err);
    res.status(500).json({ msg: "خطأ فالسيرفر" });
  }
});

// -------- OBTENIR LES TÂCHES D’UN PROJET --------
router.get('/projet/:projetId', auth, async (req, res) => {
  try {
    const { projetId } = req.params;

    // التأكد أن المشروع كاين
    const projet = await Project.findById(projetId);
    if (!projet) return res.status(404).json({ msg: "المشروع ما كاينش" });

    let tasks;
    if (req.user.role === 'manager') {
      // Manager يشوف جميع التاسكات
      tasks = await Task.find({ projet: projetId }).populate('utilisateur', 'nom login');
    } else {
      // User عادي يشوف غير التاسكات ديالو
      if (projet.proprietaire.toString() !== req.user.id) {
        return res.status(403).json({ msg: "ماعندكش الحق تشوف هاد المشروع" });
      }
      tasks = await Task.find({ projet: projetId });
    }

    res.json(tasks);

  } catch (err) {
    console.error("Erreur get tasks :", err);
    res.status(500).json({ msg: "خطأ فالسيرفر" });
  }
});

// -------- OBTENIR LES TÂCHES D’UN UTILISATEUR --------
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // User عادي ما يقدرش يشوف التاسكات ديال مستخدم آخر
    if (req.user.role !== 'manager' && req.user.id !== userId) {
      return res.status(403).json({ msg: "ماعندكش الحق تشوف هاد التاسكات" });
    }

    // Manager أو المستخدم المصرح به يشوف التاسكات
    const tasks = await Task.find({ utilisateur: userId }).populate('projet', 'nom');
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

    // Seul manager peut réassigner
    if (utilisateurId && req.user.role !== 'manager') {
      return res.status(403).json({ msg: "غير مسموحلك تعين مستخدم" });
    }

    // تحديث الحقول
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

    // Seul propriétaire du projet ou manager peut supprimer
    const projet = await Project.findById(task.projet);
    if (req.user.role !== 'manager' && projet.proprietaire.toString() !== req.user.id) {
      return res.status(403).json({ msg: "ماعندكش الحق تحذف هاد التاسك" });
    }

    await task.remove();
    res.json({ msg: "التاسك تحيد بنجاح" });

  } catch (err) {
    console.error("Erreur delete task :", err);
    res.status(500).json({ msg: "خطأ فالسيرفر" });
  }
});

module.exports = router;
