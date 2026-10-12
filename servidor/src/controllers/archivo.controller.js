const archivoService = require('../services/archivo.service');

// Recibe el archivo adjunto y lo manda al servicio para guardarlo
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

// Configura las cabeceras de descarga y transmitir el archivo
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

// Recibir el ID del archivo y de la nueva carpeta para cambiar su ubicación
const mover = async (req, res) => {
    try {
        const archivo = await archivoService.moverArchivo(
            req.params.id,
            req.usuario.id,     // <-- El usuario va aquí (segundo parámetro)
            req.body.carpetaId  // <-- La carpeta va aquí (tercer parámetro)
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


// Solicita la lista completa de los archivos propios al servicio
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

// Solicita los archivos que coincidan con el texto enviado por parametro
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
