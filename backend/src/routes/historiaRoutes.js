const express = require('express');
const router = express.Router();
const historiaController = require('../controllers/historiaController');
// Importamos también verificarRol
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Solo médicos pueden hacer POST (crear historia) o PUT (actualizar)
router.post('/', verificarToken, verificarRol(['medico']), historiaController.guardarHistoria);
router.put('/:id_cita', verificarToken, verificarRol(['medico']), historiaController.actualizarHistoria);

// Pacientes y médicos pueden hacer GET (leer historia)
router.get('/:id_cita', verificarToken, verificarRol(['medico', 'paciente']), historiaController.obtenerHistoria);

module.exports = router;