const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/authmiddleware'); // middleware ديال التوكن
const role = require('../middleware/role'); // middleware ديال الرول

// -------- AJOUTER UN PROJECT --------
router.post('/', auth, async (req, res) => {
  try {
    const { nom, description } = req.body;

    // إنشاء المشروع جديد
    const projet = new Project({
      nom,
      description,
      proprietaire: req.user.id, // id ديال اليوزر من التوكن
    });

    await projet.save();

    res.status(201).json({
      msg: "المشروع تزاد بنجاح",
      projet
    });

  } catch (err) {
    console.error("Erreur création projet :", err);
    res.status(500).json({ msg: "خطأ فالسيرفر" });
  }
});

// -------- OBTENIR MES PROJECTS --------
router.get('/', auth, async (req, res) => {
  try {
    // User عادي يشوف غير المشاريع ديالو
    const projets = await Project.find({ proprietaire: req.user.id });
    res.json(projets);
  } catch (err) {
    res.status(500).json({ msg: "خطأ فالسيرفر" });
  }
});

// -------- OBTENIR TOUS LES PROJECTS (manager فقط) --------
router.get('/all', auth, role(['manager']), async (req, res) => {
  try {
    // Manager يشوف جميع المشاريع مع معلومات المالك
    const projets = await Project.find().populate('proprietaire', 'nom login');
    res.json(projets);
  } catch (err) {
    console.error("Erreur GET all projets :", err);
    res.status(500).json({ msg: "خطأ فالسيرفر" });
  }
});

module.exports = router;


