const archivoService = require('../services/archivo.service');
const { comprobarPermiso } = require('../services/permiso.service');

const subir = async (req, res) => {
    try {
        const archivo = await archivoService.subirArchivo(
            req.file,
            req.body,
            req.usuario.id
        );
        res.status(201).json({
            mensaje: 'Archivo subido correctamente',
            archivo
        });
    } catch (error) {
        res.status(400).json({
            mensaje: error.message
        });
    }
};

const descargar = async (req, res) => {
    try {
        const resultado = await archivoService.descargarArchivo(
            req.params.id,
            req.usuario.id
        );
        res.setHeader('Content-Type', resultado.archivo.tipo);
        res.setHeader('Content-Disposition', `attachment; filename="${resultado.archivo.nombre}"`);
        
        resultado.stream.pipe(res);
    } catch (error) {
        res.status(403).json({
            mensaje: error.message
        });
    }
};

const renombrar = async (req, res) => {
    try {
        const idArchivo = req.params.id;
        const usuarioId = req.usuario.id;
        const { nombre } = req.body;

        const tieneAcceso = await comprobarPermiso(usuarioId, 'ARCHIVO', idArchivo, 'EDICION');
        
        if (!tieneAcceso) {
            return res.status(403).json({ mensaje: 'No tienes acceso a este recurso' });
        }

        const archivo = await archivoService.renombrarArchivo(
            idArchivo,
            usuarioId,
            nombre
        );

        res.json({
            mensaje: 'Archivo renombrado correctamente',
            archivo
        });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

const mover = async (req, res) => {
    try {
        const idArchivo = req.params.id;
        const usuarioId = req.usuario.id;
        const { carpetaId } = req.body;

        const tieneAcceso = await comprobarPermiso(usuarioId, 'ARCHIVO', idArchivo, 'EDICION');
        
        if (!tieneAcceso) {
            return res.status(403).json({ mensaje: 'No tienes acceso a este recurso' });
        }

        const archivo = await archivoService.moverArchivo(
            idArchivo,
            usuarioId,     
            carpetaId  
        );

        res.json({
            mensaje: 'Archivo movido correctamente',
            archivo
        });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

const listar = async (req, res) => {
    try {
        const archivos = await archivoService.listarArchivos(
            req.usuario.id
        );
        res.json(archivos);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

const buscar = async (req, res) => {
    try {
        const archivos = await archivoService.buscarArchivos(
            req.usuario.id,
            req.query.texto || ''
        );
        res.json(archivos);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

module.exports = {
    subir,
    descargar,
    renombrar,
    mover,
    listar,
    buscar
};
