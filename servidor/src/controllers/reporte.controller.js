const reporteService = require('../services/reporte.service');

// Obtener los datos de los diez documentos de mayor tamaño
const archivosMasGrandes = async (req, res) => {
    try {
        const datos = await reporteService.obtenerArchivosMasGrandes();
        res.json(datos);
    } catch (error) {
        res.status(500).json({
            mensaje: 'No se pudo generar el reporte de archivos',
            detalle: error.message
        });
    }
};

// Obtener los datos del espacio consumido desglosado por usuario
const almacenamientoPorUsuario = async (req, res) => {
    try {
        const datos = await reporteService.obtenerAlmacenamientoPorUsuario();
        res.json(datos);
    } catch (error) {
        res.status(500).json({
            mensaje: 'No se pudo generar el reporte de almacenamiento',
            detalle: error.message
        });
    }
};

// Obtener los datos de los tipos de acciones acumuladas en el sistema
const actividadesPorTipo = async (req, res) => {
    try {
        const datos = await reporteService.obtenerActividadesPorTipo();
        res.json(datos);
    } catch (error) {
        res.status(500).json({
            mensaje: 'No se pudo generar el reporte de actividades',
            detalle: error.message
        });
    }
};

module.exports = {
    archivosMasGrandes,
    almacenamientoPorUsuario,
    actividadesPorTipo
};
