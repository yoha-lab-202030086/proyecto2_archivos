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

// Obtiene la lista completa de archivos del usuario
router.get(
    '/',
    verificarToken,
    archivoController.listar
);

// Busca archivos por coincidencia de nombre
router.get(
    '/buscar',
    verificarToken,
    archivoController.buscar
);

// Descarga un archivo binario directamente desde GridFS
router.get(
    '/:id/descargar',
    verificarToken,
    archivoController.descargar
);

// Renombra un archivo
router.put(
    '/:id/renombrar',
    verificarToken,
    archivoController.renombrar
);

// Mueve un archivo de carpeta
router.put(
    '/:id/mover',
    verificarToken,
    archivoController.mover
);

module.exports = router;

