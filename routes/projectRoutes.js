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

// -------- OBTENIR LES PROJECTS (avec tri et recherche) --------
router.get('/', auth, async (req, res) => {
  try {
    let { sort, order, search } = req.query;

    // valeurs par défaut
    sort = sort || 'dateCreation';
    order = order === 'desc' ? -1 : 1;

    let filter = {};

    // User عادي يشوف غير المشاريع ديالو
    if (req.user.role !== 'manager') {
      filter.proprietaire = req.user.id;
    }

    // recherche par nom
    if (search) {
      filter.nom = { $regex: search, $options: 'i' }; // insensitive
    }

    const projets = await Project.find(filter)
      .sort({ [sort]: order })
      .populate('proprietaire', 'nom login');

    res.json(projets);

  } catch (err) {
    console.error("Erreur get projets :", err);
    res.status(500).json({ msg: "خطأ فالسيرفر" });
  }
});

// -------- OBTENIR TOUS LES PROJECTS (manager seulement) --------
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

// -------- MODIFIER UN PROJECT --------
router.put('/:id', auth, async (req, res) => {
  try {
    const { nom, description, statut } = req.body;

    const projet = await Project.findById(req.params.id);
    if (!projet) return res.status(404).json({ msg: "المشروع ما كاينش" });

    // User عادي يقدر يبدل غير المشاريع ديالو
    if (req.user.role !== 'manager' && projet.proprietaire.toString() !== req.user.id) {
      return res.status(403).json({ msg: "ماعندكش الحق تبدل هاد المشروع" });
    }

    // تحديث الحقول
    if (nom) projet.nom = nom;
    if (description) projet.description = description;
    if (statut) projet.statut = statut;

    await projet.save();
    res.json({ msg: "المشروع تبدل بنجاح", projet });

  } catch (err) {
    console.error("Erreur update projet :", err);
    res.status(500).json({ msg: "خطأ فالسيرفر" });
  }
});

// -------- SUPPRIMER UN PROJECT --------
router.delete('/:id', auth, async (req, res) => {
  try {
    const projet = await Project.findById(req.params.id);
    if (!projet) return res.status(404).json({ msg: "المشروع ما كاينش" });

    // User عادي يقدر يحذف غير المشاريع ديالو
    if (req.user.role !== 'manager' && projet.proprietaire.toString() !== req.user.id) {
      return res.status(403).json({ msg: "ماعندكش الحق تحيد هاد المشروع" });
    }

    await projet.deleteOne(); 
    res.json({ msg: "المشروع تحيد بنجاح" });

  } catch (err) {
    console.error("Erreur delete projet :", err);
    res.status(500).json({ msg: "خطأ فالسيرفر" });
  }
});

module.exports = router;



