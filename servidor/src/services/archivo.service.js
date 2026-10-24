const mongoose = require('mongoose');
const Archivo = require('../models/Archivo');
const Usuario = require('../models/Usuario');
const Carpeta = require('../models/Carpeta');
const obtenerBucket = require('../config/gridfs');
const { comprobarPermiso } = require('./permiso.service');
const { registrarActividad } = require('./actividad.service');

const subirArchivo = async (archivoRecibido, datos, usuarioId) => {
    if (!archivoRecibido) {
        throw new Error('No se recibió ningún archivo');
    }

    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
        throw new Error('El usuario no existe');
    }

    if (usuario.almacenamientoUsado + archivoRecibido.size > usuario.almacenamientoTotal) {
        throw new Error('No hay suficiente espacio de almacenamiento');
    }

    if (datos.carpeta) {
        const carpeta = await Carpeta.findOne({ _id: datos.carpeta, propietario: usuarioId, eliminada: false });
        if (!carpeta) {
            throw new Error('La carpeta no existe');
        }
    }

    const bucket = obtenerBucket();
    const idGridFs = new mongoose.Types.ObjectId();

    const stream = bucket.openUploadStream(archivoRecibido.originalname, {
        id: idGridFs,
        metadata: { propietario: new mongoose.Types.ObjectId(usuarioId), tipo: archivoRecibido.mimetype }
    });

    await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
        stream.end(archivoRecibido.buffer);
    });

    const archivo = new Archivo({
        nombre: archivoRecibido.originalname,
        tipo: archivoRecibido.mimetype,
        tamaño: archivoRecibido.size,
        propietario: usuarioId,
        carpeta: datos.carpeta || null,
        gridFsId: idGridFs
    });

    await archivo.save();

    await registrarActividad({
        usuario: usuarioId,
        accion: 'SUBIR_ARCHIVO',
        recursoTipo: 'ARCHIVO',
        recursoId: archivo._id,
        detalle: `Se subió el archivo ${archivo.nombre}`
    });

    usuario.almacenamientoUsado += archivoRecibido.size;
    await usuario.save();

    return archivo;
};

const descargarArchivo = async (idArchivo, usuarioId) => {
    const archivo = await Archivo.findOne({ _id: idArchivo, eliminado: false });

    if (!archivo) {
        throw new Error('Archivo no encontrado');
    }

    const tienePermiso = await comprobarPermiso(
        usuarioId,
        'ARCHIVO',
        archivo._id,
        'LECTURA'
    );

    if (archivo.propietario.toString() !== usuarioId && !tienePermiso) {
        throw new Error('No tienes permiso para descargar este archivo');
    }

    const bucket = obtenerBucket();
    return { archivo, stream: bucket.openDownloadStream(archivo.gridFsId) };
};

const renombrarArchivo = async (idArchivo, usuarioId, nuevoNombre) => {
    if (!nuevoNombre || nuevoNombre.trim() === '') {
        throw new Error('El nombre del archivo es obligatorio');
    }

    const archivo = await Archivo.findOne({ _id: idArchivo, propietario: usuarioId, eliminado: false });

    if (!archivo) {
        throw new Error('Archivo no encontrado o no tienes permiso');
    }

    archivo.nombre = nuevoNombre.trim();
    await archivo.save();

    await registrarActividad({
        usuario: usuarioId,
        accion: 'RENOMBRAR_ARCHIVO',
        recursoTipo: 'ARCHIVO',
        recursoId: archivo._id,
        detalle: `El archivo ahora se llama ${archivo.nombre}`
    });

    return archivo;
};

const moverArchivo = async (idArchivo, usuarioId, nuevaCarpetaId) => {
    const archivo = await Archivo.findOne({ _id: idArchivo, propietario: usuarioId, eliminado: false });

    if (!archivo) {
        throw new Error('Archivo no encontrado o no tienes permiso');
    }

    const carpeta = await Carpeta.findOne({ _id: nuevaCarpetaId, propietario: usuarioId, eliminada: false });

    if (!carpeta) {
        throw new Error('La carpeta destino no existe');
    }

    archivo.carpeta = nuevaCarpetaId;
    await archivo.save();

    await registrarActividad({
        usuario: usuarioId,
        accion: 'MOVER_ARCHIVO',
        recursoTipo: 'ARCHIVO',
        recursoId: archivo._id,
        detalle: `El archivo fue movido a otra carpeta`
    });

    return archivo;
};

const listarArchivos = async (usuarioId) => {
    return await Archivo.find({ propietario: usuarioId, eliminado: false }).populate('carpeta', 'nombre').sort({ fechaSubida: -1 });
};

const buscarArchivos = async (usuarioId, texto) => {
    return await Archivo.find({
        propietario: usuarioId,
        eliminado: false,
        nombre: {
            "\$regex": texto,
            "\$options": "i"
        }
    }).populate('carpeta', 'nombre');
};

module.exports = {
    subirArchivo,
    descargarArchivo,
    renombrarArchivo,
    moverArchivo,
    listarArchivos,
    buscarArchivos
};
