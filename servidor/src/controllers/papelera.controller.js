const papeleraService = require('../services/papelera.service');

// Cambiar el estado de un archivo para mandarlo a la papelera
const eliminarArchivo = async (req, res) => {
    try {
        const archivo = await papeleraService.enviarArchivoPapelera(req.params.id, req.usuario.id);
        res.json({ mensaje: 'Archivo enviado a la papelera', archivo });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

// Cambiar el estado de una carpeta para mandarla a la papelera
const eliminarCarpeta = async (req, res) => {
    try {
        const carpeta = await papeleraService.enviarCarpetaPapelera(req.params.id, req.usuario.id);
        res.json({ mensaje: 'Carpeta enviada a la papelera', carpeta });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

// Cambiar el estado de un archivo de la papelera para recuperarlo
const restaurarArchivo = async (req, res) => {
    try {
        const archivo = await papeleraService.restaurarArchivo(req.params.id, req.usuario.id);
        res.json({ mensaje: 'Archivo restaurado correctamente', archivo });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

// Cambiar el estado de una carpeta de la papelera para recuperarla
const restaurarCarpeta = async (req, res) => {
    try {
        const carpeta = await papeleraService.restaurarCarpeta(req.params.id, req.usuario.id);
        res.json({ mensaje: 'Carpeta restaurada correctamente', carpeta });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

// Borrar el archivo de forma permanente eliminando su contenido en GridFS
const eliminarArchivoDefinitivo = async (req, res) => {
    try {
        await papeleraService.eliminarArchivoDefinitivo(req.params.id, req.usuario.id);
        res.json({ mensaje: 'Archivo eliminado definitivamente' });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

// Solicitar al servicio las listas unificadas de todo lo que está borrado
const listar = async (req, res) => {
    try {
        const archivos = await papeleraService.listarArchivosPapelera(req.usuario.id);
        const carpetas = await papeleraService.listarCarpetasPapelera(req.usuario.id);
        res.json({ archivos, carpetas });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

module.exports = {
    eliminarArchivo,
    eliminarCarpeta,
    restaurarArchivo,
    restaurarCarpeta,
    eliminarArchivoDefinitivo,
    listar
};
