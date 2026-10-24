const usuarioService = require('../services/usuario.service');

// Controlador que recibe la petición para registrar usuarios
const registrar = async (req, res) => {

    try {
        const usuario = await usuarioService.registrarUsuario(req.body);

        const usuarioRespuesta = usuario.toObject();
        delete usuarioRespuesta.contraseña;

        res.status(201).json(usuarioRespuesta);

    } catch (error) {
        res.status(400).json({
            mensaje: error.message
        });
    }
};

const listar = async (req, res) => {

    try {
        const usuarios = await usuarioService.listarUsuarios();

        res.json(usuarios);

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al consultar los usuarios'
        });
    }
};

const cambiarEstado = async (req, res) => {
    try {
        const usuario = await usuarioService.cambiarEstadoUsuario(
            req.params.id,
            req.body.activo
        );

        res.json({
            mensaje: usuario.activo
                ? 'Usuario activado correctamente'
                : 'Usuario desactivado correctamente',
            usuario
        });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

module.exports = {
    registrar,
    listar,
    cambiarEstado
};


