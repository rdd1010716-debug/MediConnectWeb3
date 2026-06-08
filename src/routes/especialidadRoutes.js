const express = require('express');
const router = express.Router();
// Usamos un solo nombre consistente para el controlador
const especialidadController = require('../controllers/especialidadController');

// CORRECCIÓN 1: Importamos tanto el token como el rol
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Obtener todas las especialidades
router.get('/', verificarToken, especialidadController.obtenerEspecialidades);

// Crear nueva especialidad
router.post('/', verificarToken, especialidadController.crearEspecialidad); 

// CORRECCIÓN 2 y 3: Nombre de controlador corregido y agregamos 'medico' para tus pruebas actuales
// Ruta para editar
router.put('/:id', verificarToken, verificarRol(['admin', 'medico']), especialidadController.editarEspecialidad);

// Ruta para ocultar/desactivar (Borrado lógico)
router.patch('/:id/desactivar', verificarToken, verificarRol(['admin', 'medico']), especialidadController.ocultarEspecialidad);

module.exports = router;