const permisoService = require('../services/permiso.service');

// Controlador para gestionar la creación o actualización de un permiso de acceso
const compartir = async (req, res) => {

    try {

        const {
            recursoTipo,
            recursoId,
            usuarioDestinoId,
            nivel
        } = req.body;

        const permiso = await permisoService.compartirRecurso(
            recursoTipo,
            recursoId,
            usuarioDestinoId,
            nivel,
            req.usuario.id
        );

        res.status(201).json({
            mensaje: 'Recurso compartido correctamente',
            permiso
        });

    } catch (error) {

        res.status(400).json({
            mensaje: error.message
        });
    }
};

module.exports = {
    compartir
};
