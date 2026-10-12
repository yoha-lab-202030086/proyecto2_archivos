const express = require('express');
const usuarioController = require('../controllers/usuario.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const verificarAdministrador = require('../middleware/rol.middleware');

const router = express.Router();

// Registrar una cuenta de usuario nueva en el sistema
router.post('/', usuarioController.registrar);

// Consultar el listado completo de usuarios registrados restringido solo a administradores
router.get(
    '/',
    verificarToken,
    verificarAdministrador,
    usuarioController.listar
);

module.exports = router;
