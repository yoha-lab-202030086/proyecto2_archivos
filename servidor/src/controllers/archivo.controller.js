const archivoService = require('../services/archivo.service');

// Controlador que recibe el archivo enviado desde el cliente
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

module.exports = {
    subir
};
