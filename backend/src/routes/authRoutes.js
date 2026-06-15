const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta para registrar usuarios: POST http://localhost:3000/api/auth/register
router.post('/register', authController.registrar);
router.post('/login', authController.login);
router.post('/forgot-password', authController.solicitarRecuperacion);
router.post('/reset-password/:token', authController.resetearPassword);



module.exports = router;    