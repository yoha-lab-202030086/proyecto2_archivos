const express = require('express');
const archivoController = require('../controllers/archivo.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.post(
    '/',
    verificarToken,
    upload.single('archivo'),
    archivoController.subir
);

router.get(
    '/',
    verificarToken,
    archivoController.listar
);

router.get(
    '/buscar',
    verificarToken,
    archivoController.buscar
);

router.get(
    '/:id/descargar',
    verificarToken,
    archivoController.descargar
);

router.put(
    '/:id/renombrar',
    verificarToken,
    archivoController.renombrar
);

router.put(
    '/:id/mover',
    verificarToken,
    archivoController.mover
);

router.get(
    '/compartidos',
    verificarToken,
    archivoController.listarCompartidos 
);
module.exports = router;

