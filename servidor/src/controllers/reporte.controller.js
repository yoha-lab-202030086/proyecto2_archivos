const reporteService = require('../services/reporte.service');

// Procesar de forma generica las peticiones de los reportes analiticos
const ejecutar = (metodo, obtenerArgumentos = () => []) => {
    return async (req, res) => {
        try {
            const argumentos = obtenerArgumentos(req);
            const resultado = await reporteService[metodo](...argumentos);
            return res.json(resultado);
        } catch (error) {
            // Determinar el codigo de error segun el tipo de fallo detectado
            const codigo = [
                'CastError',
                'ValidationError'
            ].includes(error.name) || error.name === 'Error'
                ? 400
                : 500;

            return res.status(codigo).json({
                mensaje: error.message || 'No se pudo generar el reporte'
            });
        }
    };
};

const archivosMasGrandes = ejecutar('obtenerArchivosMasGrandes');

const archivosPorTipo = ejecutar('obtenerArchivosPorTipo');

const archivosPorFecha = ejecutar(
    'obtenerArchivosPorFecha',
    req => [req.query.fechaInicio, req.query.fechaFin]
);

const archivosMasOperaciones = ejecutar('obtenerArchivosMasOperaciones');

const almacenamientoPorTipo = ejecutar('obtenerAlmacenamientoPorTipo');

const usuariosMasArchivos = ejecutar('obtenerUsuariosMasArchivos');

const almacenamientoPorUsuario = ejecutar('obtenerAlmacenamientoPorUsuario');

const porcentajeAlmacenamiento = ejecutar('obtenerPorcentajeAlmacenamiento');

const usuariosMasComparten = ejecutar('obtenerUsuariosMasComparten');

const recursosMasCompartidos = ejecutar('obtenerRecursosMasCompartidos');

const compartidosPorUsuario = ejecutar(
    'obtenerCompartidosPorUsuario',
    req => [req.params.usuarioId]
);

const compartidosConUsuario = ejecutar(
    'obtenerCompartidosConUsuario',
    req => [req.params.usuarioId]
);

const archivosNoCompartidos = ejecutar('obtenerArchivosNoCompartidos');

const carpetasMasArchivos = ejecutar('obtenerCarpetasMasArchivos');

const almacenamientoCarpetasPrincipales = ejecutar(
    'obtenerAlmacenamientoCarpetasPrincipales',
    req => [req.params.usuarioId]
);

const contenidoCarpeta = ejecutar(
    'obtenerContenidoCarpeta',
    req => [req.params.carpetaId, req.params.usuarioId]
);

const actividadUsuario = ejecutar(
    'obtenerActividadUsuario',
    req => [
        req.params.usuarioId,
        req.query.fechaInicio,
        req.query.fechaFin
    ]
);

const actividadesPorTipo = ejecutar('obtenerActividadesPorTipo');

const actividadesPorPeriodo = ejecutar(
    'obtenerActividadesPorPeriodo',
    req => [req.query.periodo || 'mes']
);

const accionesPrincipales = ejecutar('obtenerAccionesPrincipales');

module.exports = {
    archivosMasGrandes,
    archivosPorTipo,
    archivosPorFecha,
    archivosMasOperaciones,
    almacenamientoPorTipo,
    usuariosMasArchivos,
    almacenamientoPorUsuario,
    porcentajeAlmacenamiento,
    usuariosMasComparten,
    recursosMasCompartidos,
    compartidosPorUsuario,
    compartidosConUsuario,
    archivosNoCompartidos,
    carpetasMasArchivos,
    almacenamientoCarpetasPrincipales,
    contenidoCarpeta,
    actividadUsuario,
    actividadesPorTipo,
    actividadesPorPeriodo,
    accionesPrincipales
};
