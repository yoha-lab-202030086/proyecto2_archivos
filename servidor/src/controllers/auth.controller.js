const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const usuarioService = require('../services/usuario.service');

// Comprobacion del correo y la contraseña del usuario
const iniciarSesion = async (req, res) => {

    try {
        const { correo, contraseña } = req.body;

        const usuario = await usuarioService.buscarPorCorreo(correo);

        if (!usuario) {
            return res.status(401).json({
                mensaje: 'Correo o contraseña incorrectos'
            });
        }

        if (!usuario.activo) {
            return res.status(403).json({
                mensaje: 'El usuario está inactivo'
            });
        }

        const contraseñaCorrecta = await bcrypt.compare(
            contraseña,
            usuario.contraseña
        );

        if (!contraseñaCorrecta) {
            return res.status(401).json({
                mensaje: 'Correo o contraseña incorrectos'
            });
        }

        // Se crea el token para mantener identificada la sesión
        const token = jwt.sign(
            {
                id: usuario._id,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '8h'
            }
        );

        res.json({
            mensaje: 'Inicio de sesión correcto',
            token
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al iniciar sesión'
        });
    }
};

module.exports = {
    iniciarSesion
};
