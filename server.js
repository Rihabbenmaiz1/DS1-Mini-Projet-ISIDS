const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Middleware pour lire le JSON
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/test', require('./routes/test'));
app.use('/api/projects', require('./routes/projectRoutes')); // <--- ROUTE DES PROJETS

// Test route simple
app.get('/', (req, res) => res.send('API DS1 Mini-Projet ISIDS fonctionne ✅'));

// Démarrage serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur lancé sur http://localhost:${PORT}`));




