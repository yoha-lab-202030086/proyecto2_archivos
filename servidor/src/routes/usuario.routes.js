const express = require('express');
const usuarioController = require('../controllers/usuario.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const verificarAdministrador = require('../middleware/rol.middleware');

const router = express.Router();

router.post('/', usuarioController.registrar);

router.get(
    '/',
    verificarToken,
    verificarAdministrador,
    usuarioController.listar
);

router.patch(
    '/:id/estado',
    verificarToken,
    verificarAdministrador,
    usuarioController.cambiarEstado
);

module.exports = router;