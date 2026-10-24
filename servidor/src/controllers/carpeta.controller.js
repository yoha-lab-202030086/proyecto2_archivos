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

const actualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const carpetaActualizada = await carpetaService.actualizarCarpeta(id, req.usuario.id, req.body);
        
        if (!carpetaActualizada) {
            return res.status(404).json({ mensaje: 'Carpeta no encontrada o eliminada' });
        }
        
        res.json({ mensaje: 'Carpeta actualizada con éxito', carpeta: carpetaActualizada });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

module.exports = {
    crear,
    listar,
    listarTodas,
    actualizar
};
