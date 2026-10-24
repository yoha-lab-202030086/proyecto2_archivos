const actividadService = require('../services/actividad.service');

const listar = async (req, res) => {

    try {
            const actividades = await actividadService.listarTodasLasActividades(
            req.query.fechaInicio,
            req.query.fechaFin
            );
                res.json(actividades);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al consultar el historial general de actividad'
        });
    }
};
module.exports = {
    listar
};

