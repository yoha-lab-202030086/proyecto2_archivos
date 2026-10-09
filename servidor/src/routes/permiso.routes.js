const express = require('express');

const permisoController = require('../controllers/permiso.controller');
const { verificarToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Solo un usuario autenticado puede compartir un recurso
router.post(
    '/',
    verificarToken,
    permisoController.compartir
);

// Permite al propietario consultar quién tiene acceso
router.get(
    '/',
    verificarToken,
    permisoController.listar
);

module.exports = router;
