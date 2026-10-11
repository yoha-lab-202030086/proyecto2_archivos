const archivoService = require('../services/archivo.service');

// Recibe el archivo y manda al servicio para guardarlo
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

// Configura las cabeceras de descarga y transmitir el archivo binario
const descargar = async (req, res) => {
    try {
        const resultado = await archivoService.descargarArchivo(
            req.params.id,
            req.usuario.id
        );

        // Tipo de formato y nombre original para la descarga
        res.setHeader('Content-Type', resultado.archivo.tipo);
        res.setHeader('Content-Disposition', `attachment; filename="${resultado.archivo.nombre}"`);

        // Conecta el flujo del archivo con la respuesta del servidor
        resultado.stream.pipe(res);
    } catch (error) {
        res.status(403).json({
            mensaje: error.message
        });
    }
};

// Recibe el nuevo nombre y lo manda a actualizar en la base de datos
const renombrar = async (req, res) => {
    try {
        const archivo = await archivoService.renombrarArchivo(
            req.params.id,
            req.usuario.id,
            req.body.nombre
        );

        res.json({
            mensaje: 'Archivo renombrado correctamente',
            archivo
        });
    } catch (error) {
        res.status(400).json({
            mensaje: error.message
        });
    }
};

// Recibe el ID del archivo y de la nueva carpeta para cambiar su ubicacion
const mover = async (req, res) => {
    try {
        const archivo = await archivoService.moverArchivo(
            req.params.id,
            req.usuario.id,
            req.body.carpetaId
        );

        res.json({
            mensaje: 'Archivo movido correctamente',
            archivo
        });
    } catch (error) {
        res.status(400).json({
            mensaje: error.message
        });
    }
};

module.exports = {
    subir,
    descargar,
    renombrar,
    mover
};