const almacenamientoService = require('../services/almacenamiento.service');

// Obtener los datos de consumo de espacio del usuario logueado
const consultar = async (req, res) => {
    try {
        const almacenamiento = await almacenamientoService.consultarAlmacenamiento(
            req.usuario.id
        );

        res.json(almacenamiento);
    } catch (error) {
        res.status(400).json({
            mensaje: error.message
        });
    }
};

module.exports = {
    consultar
};
