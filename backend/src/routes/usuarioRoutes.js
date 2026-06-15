const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken } = require('../middlewares/authMiddleware');

// RUTA: Obtener listado de médicos
router.get('/medicos', verificarToken, usuarioController.obtenerMedicos);

module.exports = router;