const express = require('express');
const router = express.Router();
const dispController = require('../controllers/disponibilidadController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Solo los médicos pueden definir sus horarios de atención
router.post('/establecer', verificarToken, verificarRol(['medico']), dispController.establecerDisponibilidad);

// Obtener disponibilidad de un médico (público para usuarios autenticados)
router.get('/medico/:id_medico', verificarToken, dispController.obtenerDisponibilidadPorMedico);

module.exports = router;