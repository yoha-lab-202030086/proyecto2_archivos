const permisoService = require('../services/permiso.service');

// Validar que la cuenta tenga los permisos de edicion necesarios sobre el recurso
const verificarPermisoEdicion = async (req, res, next) => {
    try {
        const permiso = await permisoService.comprobarPermiso(
            req.usuario.id,
            req.params.tipo,
            req.params.id,
            'EDICION'
        );

        if (!permiso) {
            return res.status(403).json({
                mensaje: 'No tienes permiso para editar este recurso'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
};

module.exports = verificarPermisoEdicion;
