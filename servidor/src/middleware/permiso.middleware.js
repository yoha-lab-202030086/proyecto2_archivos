const permisoService = require('../services/permiso.service');

const verificarPermisoEdicion = async (req, res, next) => {
    try {
        await permisoService.comprobarPermiso(
            req.usuario.id,
            req.params.tipo || req.body.recursoTipo, 
            req.params.id || req.body.recursoId,
            'EDICION'
        );

        next();
    } catch (error) {
       
        const codigoHttp = error.statusCode || 403;
        res.status(codigoHttp).json({
            mensaje: error.message || 'No tienes permiso para editar este recurso'
        });
    }
};

module.exports = verificarPermisoEdicion;
