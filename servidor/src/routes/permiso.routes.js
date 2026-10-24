const express = require('express');

const permisoController = require('../controllers/permiso.controller');
const { verificarToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post(
    '/',
    verificarToken,
    permisoController.compartir
);

router.get(
    '/',
    verificarToken,
    permisoController.listar
);

router.put(
    '/:id',
    verificarToken,
    permisoController.modificar
);

router.delete(
    '/:id',
    verificarToken,
    permisoController.retirar
);

module.exports = router;
