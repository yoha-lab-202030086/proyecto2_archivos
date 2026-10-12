const Usuario = require('../models/Usuario');

// Consultar el espacio total, usado y disponible de la cuenta
const consultarAlmacenamiento = async (usuarioId) => {
    const usuario = await Usuario.findById(usuarioId)
        .select('almacenamientoTotal almacenamientoUsado');

    if (!usuario) {
        throw new Error('Usuario no encontrado');
    }

    // Calcular la diferencia para obtener el espacio libre
    return {
        almacenamientoTotal: usuario.almacenamientoTotal,
        almacenamientoUsado: usuario.almacenamientoUsado,
        almacenamientoDisponible: usuario.almacenamientoTotal - usuario.almacenamientoUsado
    };
};

module.exports = {
    consultarAlmacenamiento
};
