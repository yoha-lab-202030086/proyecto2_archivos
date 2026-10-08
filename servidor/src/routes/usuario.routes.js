const express = require('express');

const usuarioController = require('../controllers/usuario.controller');

const router = express.Router();

// Ruta para registrar un usuario
router.post('/', usuarioController.registrar);

// Ruta para consultar los usuarios
router.get('/', usuarioController.listar);

module.exports = router;
