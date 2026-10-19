const archivoService = require('../services/archivo.service');
const { comprobarPermiso } = require('../services/permiso.service');

// 1. Recibe el archivo adjunto y lo manda al servicio para guardarlo
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

// 2. Configura las cabeceras de descarga y transmitir el archivo
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

// 3. Recibe el nuevo nombre y lo manda a actualizar en la base de datos
const renombrar = async (req, res) => {
    try {
        const idArchivo = req.params.id;
        const usuarioId = req.usuario.id;
        const { nombre } = req.body;

        // Validar si es el dueño directo o si posee un permiso compartido de EDICION
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

// 4. Recibir el ID del archivo y de la nueva carpeta para cambiar su ubicación
const mover = async (req, res) => {
    try {
        const idArchivo = req.params.id;
        const usuarioId = req.usuario.id;
        const { carpetaId } = req.body;

        // Validar si es el dueño directo o si posee un permiso compartido de EDICION
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

// 5. Solicita la lista completa de los archivos propios al servicio
const listar = async (req, res) => {
    try {
        const archivos = await archivoService.listarArchivos(
            req.usuario.id
        );

        res.json(archivos);
    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
};

// 6. Solicita los archivos que coincidan con el texto enviado por parametro
const buscar = async (req, res) => {
    try {
        const archivos = await archivoService.buscarArchivos(
            req.usuario.id,
            req.query.texto || ''
        );

        res.json(archivos);
    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
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
