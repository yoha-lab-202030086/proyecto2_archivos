const almacenamientoService = require('../services/almacenamiento.service');

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
