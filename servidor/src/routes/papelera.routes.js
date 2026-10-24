const express = require('express');
const papeleraController = require('../controllers/papelera.controller');
const { verificarToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', verificarToken, papeleraController.listar);

router.delete('/archivo/:id', verificarToken, papeleraController.eliminarArchivo);

router.delete('/carpeta/:id', verificarToken, papeleraController.eliminarCarpeta);

router.put('/archivo/:id/restaurar', verificarToken, papeleraController.restaurarArchivo);

router.put('/carpeta/:id/restaurar', verificarToken, papeleraController.restaurarCarpeta);

router.delete('/archivo/:id/definitivo', verificarToken, papeleraController.eliminarArchivoDefinitivo);

router.delete('/carpeta/:id/definitivo', verificarToken, papeleraController.eliminarCarpetaDefinitiva);

module.exports = router;

