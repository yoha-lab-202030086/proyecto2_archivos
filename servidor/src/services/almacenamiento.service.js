const Usuario = require('../models/Usuario');

const consultarAlmacenamiento = async (usuarioId) => {
    const usuario = await Usuario.findById(usuarioId)
        .select('almacenamientoTotal almacenamientoUsado');

    if (!usuario) {
        throw new Error('Usuario no encontrado');
    }

    return {
        almacenamientoTotal: usuario.almacenamientoTotal,
        almacenamientoUsado: usuario.almacenamientoUsado,
        almacenamientoDisponible: usuario.almacenamientoTotal - usuario.almacenamientoUsado
    };
};

module.exports = {
    consultarAlmacenamiento
};
