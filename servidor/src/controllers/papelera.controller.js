const papeleraService = require('../services/papelera.service');

// Se envia un archivo a la papelera
const eliminarArchivo = async (req, res) => {
    try {
        const archivo = await papeleraService.enviarArchivoPapelera(
            req.params.id,
            req.usuario.id
        );
        res.json({ mensaje: 'Archivo enviado a la papelera', archivo });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

// Se envia una carpeta a la papelera
const eliminarCarpeta = async (req, res) => {
    try {
        const carpeta = await papeleraService.enviarCarpetaPapelera(
            req.params.id,
            req.usuario.id
        );
        res.json({ mensaje: 'Carpeta enviada a la papelera', carpeta });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

const restaurarArchivo = async (req, res) => {
    try {
        const archivo = await papeleraService.restaurarArchivo(
            req.params.id,
            req.usuario.id
        );
        res.json({ mensaje: 'Archivo restaurado correctamente', archivo });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

const restaurarCarpeta = async (req, res) => {
    try {
        const carpeta = await papeleraService.restaurarCarpeta(
            req.params.id,
            req.usuario.id
        );
        res.json({ mensaje: 'Carpeta restaurada correctamente', carpeta });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

// Se elimina el archivo de forma permanente borrando su contenido en GridFS
const eliminarArchivoDefinitivo = async (req, res) => {
    try {
        await papeleraService.eliminarArchivoDefinitivo(
            req.params.id,
            req.usuario.id
        );
        res.json({ mensaje: 'Archivo eliminado definitivamente' });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

module.exports = {
    eliminarArchivo,
    eliminarCarpeta,
    restaurarArchivo,
    restaurarCarpeta,
    eliminarArchivoDefinitivo
};
