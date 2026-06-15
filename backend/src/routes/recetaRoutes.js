const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const recetaController = require('../controllers/recetaController');
// AQUÍ ESTABA EL ERROR: Debes incluir verificarRol en la desestructuración
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Borra la línea repetida y deja solo esta (con el middleware de rol incluido):
router.post('/upload', verificarToken, verificarRol(['medico']), upload.single('archivo'), recetaController.subirReceta);

module.exports = router;