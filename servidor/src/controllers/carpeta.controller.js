const carpetaService = require('../services/carpeta.service');

// Se crea una carpeta usando el usuario que esta autenticado
const crear = async (req, res) => {

    try {

        const carpeta = await carpetaService.crearCarpeta(
            req.body,
            req.usuario.id
        );

        res.status(201).json(carpeta);

    } catch (error) {

        res.status(400).json({
            mensaje: error.message
        });
    }
};

// Se muestra solamente las carpetas que pertenecen al usuario
const listar = async (req, res) => {

    try {

        const carpetaPadre = req.query.carpetaPadre || null;

        const carpetas = await carpetaService.listarCarpetas(
            req.usuario.id,
            carpetaPadre
        );

        res.json(carpetas);

    } catch (error) {

        res.status(500).json({
            mensaje: 'Error al consultar las carpetas'
        });
    }
};

module.exports = {
    crear,
    listar
};
