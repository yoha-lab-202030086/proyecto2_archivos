const mongoose = require('mongoose');
const Archivo = require('../models/Archivo');
const Carpeta = require('../models/Carpeta');
const Usuario = require('../models/Usuario');
const obtenerBucket = require('../config/gridfs');

const enviarArchivoPapelera = async (archivoId, usuarioId) => {
    // Solo el propietario puede enviar el archivo a la papelera
    const archivo = await Archivo.findOne({
        _id: archivoId,
        propietario: usuarioId,
        eliminado: false
    });

    if (!archivo) {
        throw new Error('El archivo no existe');
    }

    archivo.eliminado = true;
    return await archivo.save();
};

const enviarCarpetaPapelera = async (carpetaId, usuarioId) => {
    const carpeta = await Carpeta.findOne({
        _id: carpetaId,
        propietario: usuarioId,
        eliminada: false
    });

    if (!carpeta) {
        throw new Error('La carpeta no existe');
    }

    carpeta.eliminada = true;
    return await carpeta.save();
};

const restaurarArchivo = async (archivoId, usuarioId) => {
    const archivo = await Archivo.findOne({
        _id: archivoId,
        propietario: usuarioId,
        eliminado: true
    });

    if (!archivo) {
        throw new Error('El archivo no está en la papelera');
    }

    archivo.eliminado = false;
    return await archivo.save();
};

const restaurarCarpeta = async (carpetaId, usuarioId) => {
    const carpeta = await Carpeta.findOne({
        _id: carpetaId,
        propietario: usuarioId,
        eliminada: true
    });

    if (!carpeta) {
        throw new Error('La carpeta no está en la papelera');
    }

    carpeta.eliminada = false;
    return await carpeta.save();
};

const eliminarArchivoDefinitivo = async (archivoId, usuarioId) => {
    const archivo = await Archivo.findOne({
        _id: archivoId,
        propietario: usuarioId,
        eliminado: true
    });

    if (!archivo) {
        throw new Error('El archivo no está en la papelera');
    }

    const bucket = obtenerBucket();

    // Primero se elimina el contenido del archivo en GridFS
    await bucket.delete(
        new mongoose.Types.ObjectId(archivo.gridFsId)
    );

    // Despues se elimina la información del archivo
    await Archivo.deleteOne({
        _id: archivo._id
    });

    // Devuelve el tamaño para actualizar el almacenamiento
    const usuario = await Usuario.findById(usuarioId);

    if (usuario) {
        usuario.almacenamientoUsado -= archivo.tamaño;

        if (usuario.almacenamientoUsado < 0) {
            usuario.almacenamientoUsado = 0;
        }

        await usuario.save();
    }

    return archivo;
};

module.exports = {
    enviarArchivoPapelera,
    enviarCarpetaPapelera,
    restaurarArchivo,
    restaurarCarpeta,
    eliminarArchivoDefinitivo
};
