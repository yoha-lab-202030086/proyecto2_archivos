const mongoose = require('mongoose');
const Archivo = require('../models/Archivo');
const Carpeta = require('../models/Carpeta');
const Usuario = require('../models/Usuario');
const obtenerBucket = require('../config/gridfs');
const { registrarActividad } = require('./actividad.service');

// Cambiar el estado de un archivo a eliminado para enviarlo a la papelera
const enviarArchivoPapelera = async (archivoId, usuarioId) => {
    const archivo = await Archivo.findOne({ _id: archivoId, propietario: usuarioId, eliminado: false });
    if (!archivo) {
        throw new Error('El archivo no existe');
    }
    
    archivo.eliminado = true;
    await archivo.save();

    await registrarActividad({
        usuario: usuarioId,
        accion: 'ELIMINAR_ARCHIVO',
        recursoTipo: 'ARCHIVO',
        recursoId: archivo._id,
        detalle: `Archivo enviado a la papelera`
    });

    return archivo;
};

// Cambiar el estado de una carpeta a eliminada para enviarla a la papelera
const enviarCarpetaPapelera = async (carpetaId, usuarioId) => {
    const carpeta = await Carpeta.findOne({ _id: carpetaId, propietario: usuarioId, eliminada: false });
    if (!carpeta) {
        throw new Error('La carpeta no existe');
    }
   
    carpeta.eliminada = true;
    return await carpeta.save();
};

// Cambiar el estado del archivo para sacarlo de la papelera y restaurarlo
const restaurarArchivo = async (archivoId, usuarioId) => {
    const archivo = await Archivo.findOne({ _id: archivoId, propietario: usuarioId, eliminado: true });
    if (!archivo) {
        throw new Error('El archivo no está en la papelera');
    }
   
    archivo.eliminado = false;
    await archivo.save();

    await registrarActividad({
        usuario: usuarioId,
        accion: 'RESTAURAR_ARCHIVO',
        recursoTipo: 'ARCHIVO',
        recursoId: archivo._id,
        detalle: `Archivo restaurado`
    });

    return archivo;
};

// Cambiar el estado de la carpeta para sacarla de la papelera y restaurarla
const restaurarCarpeta = async (carpetaId, usuarioId) => {
    const carpeta = await Carpeta.findOne({ _id: carpetaId, propietario: usuarioId, eliminada: true });
    if (!carpeta) {
        throw new Error('La carpeta no está en la papelera');
    }

    carpeta.eliminada = false;
    return await carpeta.save();
};

// Eliminar definitivamente un archivo borrando sus datos en GridFS
const eliminarArchivoDefinitivo = async (archivoId, usuarioId) => {
    const archivo = await Archivo.findOne({ _id: archivoId, propietario: usuarioId, eliminado: true });
    if (!archivo) {
        throw new Error('El archivo no está en la papelera');
    }

    const bucket = obtenerBucket();
    await bucket.delete(new mongoose.Types.ObjectId(archivo.gridFsId));
    await Archivo.deleteOne({ _id: archivo._id });


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

// Consultar todos los archivos que se encuentran eliminados en la papelera
const listarArchivosPapelera = async (usuarioId) => {
    return await Archivo.find({ propietario: usuarioId, eliminado: true }).populate('carpeta', 'nombre');
};

// Consultar todas las carpetas que se encuentran eliminadas en la papelera
const listarCarpetasPapelera = async (usuarioId) => {
    return await Carpeta.find({ propietario: usuarioId, eliminada: true }).populate('carpetaPadre', 'nombre');
};

module.exports = {
    enviarArchivoPapelera,
    enviarCarpetaPapelera,
    restaurarArchivo,
    restaurarCarpeta,
    eliminarArchivoDefinitivo,
    listarArchivosPapelera,
    listarCarpetasPapelera
};
