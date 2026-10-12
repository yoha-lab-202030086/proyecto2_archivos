const express = require('express');
const reporteController = require('../controllers/reporte.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const verificarAdministrador = require('../middleware/rol.middleware');

const router = express.Router();

// Aplicar los controles de autenticacion y rol a todas las rutas de este archivo
router.use(verificarToken, verificarAdministrador);

// Operación para consultar el listado de archivos mas pesados
router.get('/archivos-mas-grandes', reporteController.archivosMasGrandes);

// Operación para consultar el espacio usado por las cuentas
router.get('/almacenamiento-usuarios', reporteController.almacenamientoPorUsuario);

// Operación para consultar las estadísticas de las acciones realizadas
router.get('/actividades-por-tipo', reporteController.actividadesPorTipo);

module.exports = router;
