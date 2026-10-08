const jwt = require('jsonwebtoken');

// Comprobacion de la existencia de un token válido
const verificarToken = (req, res, next) => {

    const encabezado = req.headers.authorization;

    if (!encabezado) {
        return res.status(401).json({
            mensaje: 'No se proporcionó el token'
        });
    }

    const partes = encabezado.split(' ');

    const token = partes[1];

    try {

        const datosUsuario = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Guarda los datos del usuario para usarlos en las siguientes capas
        req.usuario = datosUsuario;

        next();

    } catch (error) {

        return res.status(401).json({
            mensaje: 'Token inválido o expirado'
        });
    }
};

module.exports = {
    verificarToken
};
