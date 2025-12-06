// --- nhadhrou li n7tajouh: Express bach naamlou serveur, dotenv bach n9raw .env, w connectDB bach norebtou b MongoDB ---
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// --- nactiviw .env w naamlou connexion b base de données ---
dotenv.config();
connectDB();

// --- naamlou application mta3 Express ---
const app = express();

// --- Middleware bach yefhem serveur el JSON li yji fel requests ---
app.use(express.json());

// --- na3rfou routes mta3 auth, test, projects, w tasks ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/test', require('./routes/test'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// --- Route b simple bach naamlou test li API t5adem ---
app.get('/', (req, res) => res.send('API DS1 Mini-Projet ISIDS fonctionne ✅'));

// --- norobtou serveur 3la port li fel .env wela 5000 ken ma famaash ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur lancé sur http://localhost:${PORT}`));





