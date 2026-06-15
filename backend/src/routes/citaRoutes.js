const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Solo los pacientes autenticados pueden agendar citas
router.post('/agendar', verificarToken, verificarRol(['paciente']), citaController.agendarCita);
// NUEVA RUTA: Cancelar cita (Cualquier usuario logueado puede intentar cancelarla, el controlador valida si es de él)
router.put('/cancelar/:id', verificarToken, citaController.cancelarCita);
// NUEVA RUTA: Ver listado de mis citas (Usa GET porque solo vamos a leer datos)
router.get('/mis-citas', verificarToken, citaController.obtenerMisCitas);
module.exports = router;