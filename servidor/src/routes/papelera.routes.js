const express = require('express');
const papeleraController = require('../controllers/papelera.controller');
const { verificarToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Consultar los recursos eliminados del usuario en la papelera
router.get('/', verificarToken, papeleraController.listar);

// Enviar archivos a la papelera
router.delete('/archivo/:id', verificarToken, papeleraController.eliminarArchivo);

// Enviar carpetas a la papelera
router.delete('/carpeta/:id', verificarToken, papeleraController.eliminarCarpeta);

// Restaurar un archivo que estaba en la papelera
router.put('/archivo/:id/restaurar', verificarToken, papeleraController.restaurarArchivo);

// Restaurar una carpeta que estaba en la papelera
router.put('/carpeta/:id/restaurar', verificarToken, papeleraController.restaurarCarpeta);

// Borrar de forma definitiva el archivo de GridFS
router.delete('/archivo/:id/definitivo', verificarToken, papeleraController.eliminarArchivoDefinitivo);

// Borrar de forma definitiva la carpeta y todo su contenido interior en cascada
router.delete('/carpeta/:id/definitivo', verificarToken, papeleraController.eliminarCarpetaDefinitiva);

module.exports = router;

