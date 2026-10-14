const express = require('express');
const reporteController = require('../controllers/reporte.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const verificarAdministrador = require('../middleware/rol.middleware');

const router = express.Router();

// Todos los reportes requieren una sesión válida de administrador.
router.use(verificarToken, verificarAdministrador);

// Reportes de archivos y almacenamiento.
router.get('/archivos-mas-grandes', reporteController.archivosMasGrandes);
router.get('/archivos-por-tipo', reporteController.archivosPorTipo);
router.get('/archivos-por-fecha', reporteController.archivosPorFecha);
router.get('/archivos-mas-operaciones', reporteController.archivosMasOperaciones);
router.get('/almacenamiento-por-tipo', reporteController.almacenamientoPorTipo);

// Reportes de usuarios.
router.get('/usuarios-mas-archivos', reporteController.usuariosMasArchivos);
router.get('/almacenamiento-usuarios', reporteController.almacenamientoPorUsuario);
router.get('/porcentaje-almacenamiento', reporteController.porcentajeAlmacenamiento);
router.get('/usuarios-mas-comparten', reporteController.usuariosMasComparten);

// Reportes de compartición.
router.get('/recursos-mas-compartidos', reporteController.recursosMasCompartidos);
router.get('/compartidos-por/:usuarioId', reporteController.compartidosPorUsuario);
router.get('/compartidos-con/:usuarioId', reporteController.compartidosConUsuario);
router.get('/archivos-no-compartidos', reporteController.archivosNoCompartidos);

// Reportes de carpetas.
router.get('/carpetas-mas-archivos', reporteController.carpetasMasArchivos);

router.get(
    '/almacenamiento-carpetas-principales/:usuarioId',
    reporteController.almacenamientoCarpetasPrincipales
);

router.get(
    '/contenido-carpeta/:carpetaId/usuario/:usuarioId',
    reporteController.contenidoCarpeta
);

// Reportes de actividad.
router.get('/actividad-usuario/:usuarioId', reporteController.actividadUsuario);
router.get('/actividades-por-tipo', reporteController.actividadesPorTipo);
router.get('/actividades-por-periodo', reporteController.actividadesPorPeriodo);
router.get('/acciones-principales', reporteController.accionesPrincipales);

module.exports = router;
