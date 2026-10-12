const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Verificar el token y comprobar que la cuenta siga activa en la base de datos
const verificarToken = async (req, res, next) => {
    try {
        const encabezado = req.headers.authorization;

        if (!encabezado || !encabezado.startsWith('Bearer ')) {
            return res.status(401).json({
                mensaje: 'Debes iniciar sesión'
            });
        }

        const token = encabezado.split(' ')[1];
        const datos = jwt.verify(token, process.env.JWT_SECRET);

        // Consultar el estado real de la cuenta en tiempo real
        const usuario = await Usuario.findById(datos.id)
            .select('_id nombre correo rol activo');

        if (!usuario || !usuario.activo) {
            return res.status(401).json({
                mensaje: 'La cuenta no existe o está inactiva'
            });
        }

        req.usuario = {
            id: usuario._id.toString(),
            rol: usuario.rol,
            nombre: usuario.nombre,
            correo: usuario.correo
        };

        next();
    } catch (error) {
        return res.status(401).json({
            mensaje: 'Token inválido o expirado'
        });
    }
};

module.exports = { verificarToken };
