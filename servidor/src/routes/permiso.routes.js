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

// El propietario puede cambiar lectura por edición o viceversa
router.put(
    '/:id',
    verificarToken,
    permisoController.modificar
);

// El propietario puede retirar un permiso
router.delete(
    '/:id',
    verificarToken,
    permisoController.retirar
);

module.exports = router;
