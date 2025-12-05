const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authmiddleware');

router.get('/hello', authMiddleware, (req, res) => {
  res.send('Middleware fonctionne ✅');
});

module.exports = router;
