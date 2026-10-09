const express = require('express');

const archivoController = require('../controllers/archivo.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// El usuario debe estar autenticado para subir archivos
router.post(
    '/',
    verificarToken,
    upload.single('archivo'),
    archivoController.subir
);

module.exports = router;
