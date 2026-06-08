const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verificarToken } = require('../middlewares/authMiddleware');
const multer = require('multer');


const upload = multer({ storage: multer.memoryStorage() });

// Cualquier usuario logueado con token válido puede consultar el historial de sus citas
router.get('/historial/:id_cita', verificarToken, chatController.obtenerHistorial);
router.post('/upload', verificarToken, upload.single('archivo'), chatController.subirArchivoMultimedia);


module.exports = router;