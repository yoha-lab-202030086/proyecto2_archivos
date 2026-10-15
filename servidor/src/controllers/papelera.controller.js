const papeleraService = require('../services/papelera.service');
const { comprobarPermiso } = require('../services/permiso.service');

// Cambiar el estado de un archivo para mandarlo a la papelera
const eliminarArchivo = async (req, res) => {
    try {
        await comprobarPermiso(req.usuario.id, 'ARCHIVO', req.params.id, 'PROPIETARIO');
        const archivo = await papeleraService.enviarArchivoPapelera(req.params.id, req.usuario.id);
        res.json({ mensaje: 'Archivo enviado a la papelera', archivo });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

// Cambiar el estado de una carpeta para mandarla a la papelera
const eliminarCarpeta = async (req, res) => {
    try {
        await comprobarPermiso(req.usuario.id, 'CARPETA', req.params.id, 'PROPIETARIO');
        const carpeta = await papeleraService.enviarCarpetaPapelera(req.params.id, req.usuario.id);
        res.json({ mensaje: 'Carpeta enviada a la papelera', carpeta });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

// Cambiar el estado de un archivo de la papelera para recuperarlo
const restaurarArchivo = async (req, res) => {
    try {
        await comprobarPermiso(req.usuario.id, 'ARCHIVO', req.params.id, 'PROPIETARIO');
        const archivo = await papeleraService.restaurarArchivo(req.params.id, req.usuario.id);
        res.json({ mensaje: 'Archivo restaurado correctamente', archivo });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

// Cambiar el estado de una carpeta de la papelera para recuperarla
const restaurarCarpeta = async (req, res) => {
    try {
        await comprobarPermiso(req.usuario.id, 'CARPETA', req.params.id, 'PROPIETARIO');
        const carpeta = await papeleraService.restaurarCarpeta(req.params.id, req.usuario.id);
        res.json({ mensaje: 'Carpeta restaurada correctamente', carpeta });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

// Borrar el archivo de forma permanente eliminando su contenido en GridFS
const eliminarArchivoDefinitivo = async (req, res) => {
    try {
        await comprobarPermiso(req.usuario.id, 'ARCHIVO', req.params.id, 'PROPIETARIO');
        await papeleraService.eliminarArchivoDefinitivo(req.params.id, req.usuario.id);
        res.json({ mensaje: 'Archivo eliminado definitivamente' });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

// Procesar el borrado total y permanente de la carpeta y sus subdirectorios
const eliminarFolderDefinitivo = async (req, res) => {
    try {
        await comprobarPermiso(req.usuario.id, 'CARPETA', req.params.id, 'PROPIETARIO');
        const resultado = await papeleraService.eliminarCarpetaDefinitiva(
            req.params.id,
            req.usuario.id
        );
        res.json(resultado);
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
    eliminarCarpetaDefinitiva: eliminarFolderDefinitivo, // Exportacion del
    listar
};
