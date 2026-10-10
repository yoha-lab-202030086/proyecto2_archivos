const express = require('express');

const papeleraController = require('../controllers/papelera.controller');
const { verificarToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Enviar archivos a la papelera
router.delete(
    '/archivo/:id',
    verificarToken,
    papeleraController.eliminarArchivo
);

// Enviar carpetas a la papelera
router.delete(
    '/carpeta/:id',
    verificarToken,
    papeleraController.eliminarCarpeta
);

// Restaurar un archivo que estaba en la papelera
router.put(
    '/archivo/:id/restaurar',
    verificarToken,
    papeleraController.restaurarArchivo
);

// Restaurar una carpeta que estaba en la papelera
router.put(
    '/carpeta/:id/restaurar',
    verificarToken,
    papeleraController.restaurarCarpeta
);

// Eliminacion que borra el contenido de GridFS
router.delete(
    '/archivo/:id/definitivo',
    verificarToken,
    papeleraController.eliminarArchivoDefinitivo
);

module.exports = router;

