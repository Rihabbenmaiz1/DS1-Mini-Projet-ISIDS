const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/authmiddleware'); // middleware mta3 token
const role = require('../middleware/role'); // middleware mta3 role

// -------- AJOUTER UN PROJECT --------
// Route POST: bech n'ajoutiw projet jdid, user connecté
router.post('/', auth, async (req, res) => {
  try {
    const { nom, description } = req.body;

    // Création mta3 el projet
    const projet = new Project({
      nom,
      description,
      proprietaire: req.user.id, // id mta3 el user min token
    });

    await projet.save();

    res.status(201).json({
      msg: "Projet ajouté avec succès",
      projet
    });

  } catch (err) {
    console.error("Erreur création projet :", err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
});

// -------- OBTENIR LES PROJECTS (avec tri et recherche) --------
// Route GET: bech el user ychouf projects mta3ou (ou filtré selon recherche)
router.get('/', auth, async (req, res) => {
  try {
    let { sort, order, search } = req.query;

    // valeurs par défaut
    sort = sort || 'dateCreation';
    order = order === 'desc' ? -1 : 1;

    let filter = {};

    // manager normal ychouf  projets mech mte3ou
    if (req.user.role !== 'manager') {
      filter.proprietaire = req.user.id;
    }

    // recherche b nom
    if (search) {
      filter.nom = { $regex: search, $options: 'i' }; // insensitive
    }

    const projets = await Project.find(filter)
      .sort({ [sort]: order })
      .populate('proprietaire', 'nom login');

    res.json(projets);

  } catch (err) {
    console.error("Erreur get projets :", err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
});

// -------- OBTENIR TOUS LES PROJETS (manager seulement) --------
// Route GET /all: manager ychouf projets el kol 
router.get('/all', auth, role(['manager']), async (req, res) => {
  try {
    const projets = await Project.find().populate('proprietaire', 'nom login');
    res.json(projets);
  } catch (err) {
    console.error("Erreur GET all projets :", err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
});

// -------- MODIFIER UN PROJECT --------
// Route PUT: update project, user normal maynajem ybadl ken projets mta3ou
router.put('/:id', auth, async (req, res) => {
  try {
    const { nom, description, statut } = req.body;

    const projet = await Project.findById(req.params.id);
    if (!projet) return res.status(404).json({ msg: "Project non trouvé" });

    // check droit mta3 user normal
    if (req.user.role !== 'manager' && projet.proprietaire.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Vous n'avez pas le droit de modifier ce project" });
    }

    // update mta3 les champs
    if (nom) projet.nom = nom;
    if (description) projet.description = description;
    if (statut) projet.statut = statut;

    await projet.save();
    res.json({ msg: "Project modifié avec succès", projet });

  } catch (err) {
    console.error("Erreur update projet :", err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
});

// -------- SUPPRIMER UN PROJECT --------
// Route DELETE: delete project, user normal ynajem yfassa5 ken projets mte3ou
router.delete('/:id', auth, async (req, res) => {
  try {
    const projet = await Project.findById(req.params.id);
    if (!projet) return res.status(404).json({ msg: "Project non trouvé" });

    // check droit mta3 user normal
    if (req.user.role !== 'manager' && projet.proprietaire.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Vous n'avez pas le droit de supprimer ce project" });
    }

    await projet.deleteOne();
    res.json({ msg: "Project supprimé avec succès" });

  } catch (err) {
    console.error("Erreur delete projet :", err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
});

module.exports = router;




