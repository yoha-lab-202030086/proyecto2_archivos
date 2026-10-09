
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

const listar = async (req, res) => {

    try {

        const {
            recursoTipo,
            recursoId
        } = req.query;

        const permisos = await permisoService.listarPermisosRecurso(
            recursoTipo,
            recursoId,
            req.usuario.id
        );

        res.json(permisos);

    } catch (error) {

        res.status(500).json({
            mensaje: 'Error al consultar los permisos'
        });
    }
};

const retirar = async (req, res) => {

    try {

        const permiso = await permisoService.retirarPermiso(
            req.params.id,
            req.usuario.id
        );

        res.json({
            mensaje: 'Permiso retirado correctamente',
            permiso
        });

    } catch (error) {

        res.status(400).json({
            mensaje: error.message
        });
    }
};

const modificar = async (req, res) => {

    try {

        const permiso = await permisoService.modificarPermiso(
            req.params.id,
            req.body.nivel,
            req.usuario.id
        );

        res.json({
            mensaje: 'Permiso actualizado correctamente',
            permiso
        });

    } catch (error) {

        res.status(400).json({
            mensaje: error.message
        });
    }
};

module.exports = {
    compartir,
    listar,
    retirar,
    modificar
};
