const express = require('express');
const archivoController = require('../controllers/archivo.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Subir un archivo
router.post(
    '/',
    verificarToken,
    upload.single('archivo'),
    archivoController.subir
);

// Descargar un archivo binario directamente desde GridFS
router.get(
    '/:id/descargar',
    verificarToken,
    archivoController.descargar
);

// Renombrar un archivo
router.put(
    '/:id/renombrar',
    verificarToken,
    archivoController.renombrar
);

// Mover un archivo de carpeta
router.put(
    '/:id/mover',
    verificarToken,
    archivoController.mover
);

module.exports = router;
