const papeleraService = require('../services/papelera.service');
const { comprobarPermiso } = require('../services/permiso.service');
const actividadService = require('../services/actividad.service');

const eliminarArchivo = async (req, res) => {
    try {
        await comprobarPermiso(req.usuario.id, 'ARCHIVO', req.params.id, 'PROPIETARIO');
        const archivo = await papeleraService.enviarArchivoPapelera(req.params.id, req.usuario.id);
        
        await actividadService.registrarActividad({
            usuario: req.usuario.id,
            accion: 'ELIMINAR_ARCHIVO',
            recursoTipo: 'ARCHIVO',
            recursoId: req.params.id,
            detalle: `Archivo enviado a la papelera: ${archivo?.nombre || 'Desconocido'}`
        });
        
        res.json({ mensaje: 'Archivo enviado a la papelera', archivo });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

const eliminarCarpeta = async (req, res) => {
    try {
        await comprobarPermiso(req.usuario.id, 'CARPETA', req.params.id, 'PROPIETARIO');
        const carpeta = await papeleraService.enviarCarpetaPapelera(req.params.id, req.usuario.id);
        
        await actividadService.registrarActividad({
            usuario: req.usuario.id,
            accion: 'ELIMINAR_CARPETA',
            recursoTipo: 'CARPETA',
            recursoId: req.params.id,
            detalle: `Carpeta enviada a la papelera: ${carpeta?.nombre || 'Desconocida'}`
        });

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

        await actividadService.registrarActividad({
            usuario: req.usuario.id,
            accion: 'RESTAURAR_ARCHIVO',
            recursoTipo: 'ARCHIVO',
            recursoId: req.params.id,
            detalle: `Archivo restaurado: ${archivo?.nombre || 'Desconocido'}`
        });

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

        await actividadService.registrarActividad({
            usuario: req.usuario.id,
            accion: 'RESTAURAR_CARPETA',
            recursoTipo: 'CARPETA',
            recursoId: req.params.id,
            detalle: `Carpeta restaurada correctamente (ID: ${req.params.id})`
        });


        res.json({ mensaje: 'Carpeta restaurada correctamente', carpeta });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

const eliminarArchivoDefinitivo = async (req, res) => {
    try {
        await papeleraService.eliminarArchivoDefinitivo(
            req.params.id,
            req.usuario.id
        );

        await actividadService.registrarActividad({
            usuario: req.usuario.id,
            accion: 'ELIMINAR_DEFINITIVO',
            recursoTipo: 'ARCHIVO',
            recursoId: req.params.id,
            detalle: `Se eliminó permanentemente el archivo con ID: ${req.params.id}`
        });

        res.json({ mensaje: 'Archivo eliminado definitivamente' });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

const eliminarCarpetaDefinitiva = async (req, res) => {
    try {
        const resultado = await papeleraService.eliminarCarpetaDefinitiva(
            req.params.id,
            req.usuario.id
        );

        await actividadService.registrarActividad({
            usuario: req.usuario.id,
            accion: 'ELIMINAR_DEFINITIVO',
            recursoTipo: 'CARPETA',
            recursoId: req.params.id,
            detalle: `Se eliminó permanentemente la carpeta con ID: ${req.params.id}`
        });
        res.json(resultado);
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

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
    eliminarCarpetaDefinitiva,
    listar
};
