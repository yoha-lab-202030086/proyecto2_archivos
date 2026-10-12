const carpetaService = require('../services/carpeta.service');

// Manda los datos al servicio para crear una carpeta con el usuario logueado
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

// Solicita las carpetas de un directorio especifico al servicio
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

// Solicita la lista completa de todas las carpetas del usuario sin filtros
const listarTodas = async (req, res) => {
    try {
        const carpetas = await carpetaService.listarTodasLasCarpetas(
            req.usuario.id
        );

        res.json(carpetas);
    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
};

module.exports = {
    crear,
    listar,
    listarTodas
};
