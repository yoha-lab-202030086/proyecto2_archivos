const actividadService = require('../services/actividad.service');

// Consulta el historial del usuario autenticado
const listar = async (req, res) => {

    try {

        const actividades =
            await actividadService.listarActividadesUsuario(
                req.usuario.id,
                req.query.fechaInicio,
                req.query.fechaFin
            );

        res.json(actividades);

    } catch (error) {

        res.status(500).json({
            mensaje: 'Error al consultar el historial'
        });
    }
};

module.exports = {
    listar
};
