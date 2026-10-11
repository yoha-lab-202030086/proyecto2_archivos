const mongoose = require('mongoose');
const Archivo = require('../models/Archivo');
const Usuario = require('../models/Usuario');
const Carpeta = require('../models/Carpeta');
const obtenerBucket = require('../config/gridfs');
const { comprobarPermiso } = require('./permiso.service');

// Recibe el archivo en memoria y lo guarda directo en MongoDB con GridFS
const subirArchivo = async (archivoRecibido, datos, usuarioId) => {
    if (!archivoRecibido) {
        throw new Error('No se recibió ningún archivo');
    }

    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
        throw new Error('El usuario no existe');
    }

    // Validación del espacio disponible del usuario antes de la transferencia
    if (usuario.almacenamientoUsado + archivoRecibido.size > usuario.almacenamientoTotal) {
        throw new Error('No hay suficiente espacio de almacenamiento');
    }

    // Validación de la existencia y disponibilidad de la carpeta destino
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

    // Apertura del flujo de escritura hacia la colección archivos
    const stream = bucket.openUploadStream(archivoRecibido.originalname, {
        id: idGridFs,
        metadata: {
            propietario: new mongoose.Types.ObjectId(usuarioId),
            tipo: archivoRecibido.mimetype
        }
    });

    // Controlador de la transferencia del búfer binario
    await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
        stream.end(archivoRecibido.buffer);
    });

    // Registro de los metadatos de organización en la colección convencional de archivos
    const archivo = new Archivo({
        nombre: archivoRecibido.originalname,
        tipo: archivoRecibido.mimetype,
        tamaño: archivoRecibido.size,
        propietario: usuarioId,
        carpeta: datos.carpeta || null,
        gridFsId: idGridFs
    });

    await archivo.save();

    // Actualización acumulativa del almacenamiento consumido por el cliente
    usuario.almacenamientoUsado += archivoRecibido.size;
    await usuario.save();

    return archivo;
};

// Busca el archivo y revisa si el usuario es el dueño o se lo compartieron para descargar
const descargarArchivo = async (idArchivo, usuarioId) => {
    const archivo = await Archivo.findOne({
        _id: idArchivo,
        eliminado: false
    });

    if (!archivo) {
        throw new Error('Archivo no encontrado');
    }

    // Consulta externa al servicio de permisos para verificar autorizaciones compartidas
    const tienePermiso = await comprobarPermiso(
        'ARCHIVO',
        archivo._id,
        usuarioId,
        'LECTURA'
    );

    // Bloqueo de seguridad si quien solicita no es el dueño ni posee autorización
    if (archivo.propietario.toString() !== usuarioId && !tienePermiso) {
        throw new Error('No tienes permiso para descargar este archivo');
    }

    const bucket = obtenerBucket();

    // Retorno de la información del archivo y el flujo binario de lectura desde GridFS
    return {
        archivo,
        stream: bucket.openDownloadStream(archivo.gridFsId)
    };
};

// Busca el archivo por su ID y se cambia el nombre si pertenece al usuario
const renombrarArchivo = async (idArchivo, usuarioId, nuevoNombre) => {
    if (!nuevoNombre || nuevoNombre.trim() === '') {
        throw new Error('El nombre del archivo es obligatorio');
    }

    const archivo = await Archivo.findOne({
        _id: idArchivo,
        propietario: usuarioId,
        eliminado: false
    });

    if (!archivo) {
        throw new Error('Archivo no encontrado o no tienes permiso');
    }

    archivo.nombre = nuevoNombre.trim();
    await archivo.save();

    return archivo;
};

// Cambia el ID de la carpeta actual por el ID de la nueva carpeta para mover el archivo
const moverArchivo = async (idArchivo, usuarioId, nuevaCarpetaId) => {
    const archivo = await Archivo.findOne({
        _id: idArchivo,
        propietario: usuarioId,
        eliminado: false
    });

    if (!archivo) {
        throw new Error('Archivo no encontrado o no tienes permiso');
    }

    const carpeta = await Carpeta.findOne({
        _id: nuevaCarpetaId,
        propietario: usuarioId,
        eliminada: false
    });

    if (!carpeta) {
        throw new Error('La carpeta destino no existe');
    }

    // Actualización del identificador de la carpeta padre
    archivo.carpeta = nuevaCarpetaId;
    await archivo.save();

    return archivo;
};

module.exports = {
    subirArchivo,
    descargarArchivo,
    renombrarArchivo,
    moverArchivo
};
