const express = require('express');

const authController = require('../controllers/auth.controller');

const router = express.Router();

// Ruta para permitir iniciar sesión
router.post('/login', authController.iniciarSesion);

module.exports = router;
