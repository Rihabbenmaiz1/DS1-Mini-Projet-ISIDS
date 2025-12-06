const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/authmiddleware'); // middleware de vérification du token

// -------- AJOUTER UN PROJECT --------
router.post('/', auth, async (req, res) => {
  try {
    const { nom, description } = req.body;

    // création du projet
    const projet = new Project({
      nom,
      description,
      proprietaire: req.user.id,   // récupéré depuis le token décodé
    });

    await projet.save();

    res.status(201).json({
      msg: "Projet créé avec succès",
      projet
    });

  } catch (err) {
    console.error("Erreur création projet :", err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
});

// -------- OBTENIR MES PROJECTS --------
router.get('/', auth, async (req, res) => {
  try {
    const projets = await Project.find({ proprietaire: req.user.id });

    res.json(projets);
  } catch (err) {
    res.status(500).json({ msg: "Erreur serveur" });
  }
});

module.exports = router;
