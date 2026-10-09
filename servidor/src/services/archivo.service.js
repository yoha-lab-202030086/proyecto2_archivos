const mongoose = require('mongoose');
const Archivo = require('../models/Archivo');
const Usuario = require('../models/Usuario');
const Carpeta = require('../models/Carpeta');
const obtenerBucket = require('../config/gridfs');

const subirArchivo = async (archivoRecibido, datos, usuarioId) => {

    if (!archivoRecibido) {
        throw new Error('No se recibió ningún archivo');
    }

    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
        throw new Error('El usuario no existe');
    }

    // Se verifica que el usuario tenga espacio suficiente
    if (
        usuario.almacenamientoUsado + archivoRecibido.size >
        usuario.almacenamientoTotal
    ) {
        throw new Error('No hay suficiente espacio de almacenamiento');
    }

    // Se verifica la carpeta donde se guardará el archivo
    if (datos.carpeta) {

        const carpeta = await Carpeta.findOne({
            _id: datos.carpeta,
            propietario: usuarioId,
            eliminada: false
        });

        if (!carpeta) {
            throw new Error('La carpeta no existe');
        }
    }

    const bucket = obtenerBucket();

    const idGridFs = new mongoose.Types.ObjectId();

    const stream = bucket.openUploadStream(
        archivoRecibido.originalname,
        {
            id: idGridFs,
            metadata: {
                propietario: new mongoose.Types.ObjectId(usuarioId),
                tipo: archivoRecibido.mimetype
            }
        }
    );

    await new Promise((resolve, reject) => {

        stream.on('finish', resolve);
        stream.on('error', reject);

        stream.end(archivoRecibido.buffer);
    });

    // Se guardan los datos del archivo despues de subir su contenido
    const archivo = new Archivo({
        nombre: archivoRecibido.originalname,
        tipo: archivoRecibido.mimetype,
        tamaño: archivoRecibido.size,
        propietario: usuarioId,
        carpeta: datos.carpeta || null,
        gridFsId: idGridFs
    });

    await archivo.save();

    // Se actualiza el espacio utilizado por el usuario
    usuario.almacenamientoUsado += archivoRecibido.size;

    await usuario.save();

    return archivo;
};

module.exports = {
    subirArchivo
};
