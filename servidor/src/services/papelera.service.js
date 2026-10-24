const mongoose = require('mongoose');
const Archivo = require('../models/Archivo');
const Carpeta = require('../models/Carpeta');
const Usuario = require('../models/Usuario');
const Permiso = require('../models/Permiso');
const obtenerBucket = require('../config/gridfs');
const { registrarActividad } = require('./actividad.service');

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
        detalle: 'Archivo enviado a la papelera'
    });

    return archivo;
};

const enviarCarpetaPapelera = async (carpetaId, usuarioId) => {
    const carpetaInicial = await Carpeta.findOne({
        _id: carpetaId,
        propietario: usuarioId,
        eliminada: false
    });

    if (!carpetaInicial) {
        throw new Error('La carpeta no existe o ya está eliminada');
    }

    const idsCarpetas = [carpetaInicial._id];
    let pendientes = [carpetaInicial._id];

    while (pendientes.length > 0) {
        const hijas = await Carpeta.find({
            propietario: usuarioId,
            carpetaPadre: { "$in": pendientes },
            eliminada: false
        }).select('_id');

        pendientes = hijas.map(c => c._id);
        idsCarpetas.push(...pendientes);
    }

    await Carpeta.updateMany(
        { _id: { "$in": idsCarpetas }, propietario: usuarioId },
        { "$set": { eliminada: true } }
    );

    await Archivo.updateMany(
        { carpeta: { "$in": idsCarpetas }, propietario: usuarioId },
        { "$set": { eliminado: true } }
    );

    await registrarActividad({
        usuario: usuarioId,
        accion: 'ELIMINAR_CARPETA',
        recursoTipo: 'CARPETA',
        recursoId: carpetaInicial._id,
        detalle: 'Carpeta y contenido enviados a la papelera'
    });

    return carpetaInicial;
};

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
        detalle: 'Archivo restaurado'
    });

    return archivo;
};

const restaurarCarpeta = async (carpetaId, usuarioId) => {
    const carpetaInicial = await Carpeta.findOne({
        _id: carpetaId,
        propietario: usuarioId,
        eliminada: true
    });

    if (!carpetaInicial) {
        throw new Error('La carpeta no está en la papelera');
    }

    const idsCarpetas = [carpetaInicial._id];
    let pendientes = [carpetaInicial._id];

    while (pendientes.length > 0) {
        const hijas = await Carpeta.find({
            propietario: usuarioId,
            carpetaPadre: { "$in": pendientes },
            eliminada: true
        }).select('_id');

        pendientes = hijas.map(c => c._id);
        idsCarpetas.push(...pendientes);
    }

    if (carpetaInicial.carpetaPadre) {
        const padre = await Carpeta.findOne({
            _id: carpetaInicial.carpetaPadre,
            propietario: usuarioId,
            eliminada: false
        });

        if (!padre) {
            throw new Error('No se puede restaurar: la carpeta padre no está activa');
        }
    }

    await Carpeta.updateMany(
        { _id: { "$in": idsCarpetas }, propietario: usuarioId },
        { "$set": { eliminada: false } }
    );

    await Archivo.updateMany(
        { carpeta: { "$in": idsCarpetas }, propietario: usuarioId },
        { "$set": { eliminado: false } }
    );

    await registrarActividad({
        usuario: usuarioId,
        accion: 'RESTAURAR_CARPETA',
        recursoTipo: 'CARPETA',
        recursoId: carpetaInicial._id,
        detalle: 'Carpeta y contenido restaurados'
    });

    return carpetaInicial;
};

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

const eliminarCarpetaDefinitiva = async (carpetaId, usuarioId) => {
    const carpetaInicial = await Carpeta.findOne({
        _id: carpetaId,
        propietario: usuarioId,
        eliminada: true
    });

    if (!carpetaInicial) {
        throw new Error('La carpeta no está en la papelera');
    }

    const idsCarpetas = [carpetaInicial._id];
    let pendientes = [carpetaInicial._id];

    while (pendientes.length > 0) {
        const hijas = await Carpeta.find({
            propietario: usuarioId,
            carpetaPadre: { "$in": pendientes }
        }).select('_id');

        pendientes = hijas
            .filter(hija => !idsCarpetas.some(id => id.equals(hija._id)))
            .map(hija => hija._id);

        idsCarpetas.push(...pendientes);
    }

    const archivos = await Archivo.find({
        propietario: usuarioId,
        carpeta: { "$in": idsCarpetas }
    });

    const bucket = obtenerBucket();
    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
        throw new Error('No se encontró al propietario');
    }

    for (const archivo of archivos) {
        await bucket.delete(archivo.gridFsId);

        await Archivo.deleteOne({
            _id: archivo._id,
            propietario: usuarioId
        });

        usuario.almacenamientoUsado = Math.max(
            0,
            usuario.almacenamientoUsado - archivo.tamaño
        );

        await usuario.save();
    }

    await Permiso.deleteMany({
        propietario: usuarioId,
        "$or": [
            { recursoTipo: 'CARPETA', recursoId: { "$in": idsCarpetas } },
            { recursoTipo: 'ARCHIVO', recursoId: { "$in": archivos.map(a => a._id) } }
        ]
    });

    await Carpeta.deleteMany({
        _id: { "$in": idsCarpetas },
        propietario: usuarioId
    });

    await registrarActividad({
        usuario: usuarioId,
        accion: 'ELIMINAR_CARPETA_DEFINITIVO',
        recursoTipo: 'CARPETA',
        recursoId: carpetaInicial._id,
        detalle: 'Carpeta y contenido eliminados definitivamente'
    });

    return {
        mensaje: 'Carpeta y contenido eliminados definitivamente',
        archivosEliminados: archivos.length,
        carpetasEliminadas: idsCarpetas.length
    };
};

const listarArchivosPapelera = async (usuarioId) => {
    return await Archivo.find({ propietario: usuarioId, eliminado: true }).populate('carpeta', 'nombre');
};

const listarCarpetasPapelera = async (usuarioId) => {
    return await Carpeta.find({ propietario: usuarioId, eliminada: true }).populate('carpetaPadre', 'nombre');
};

module.exports = {
    enviarArchivoPapelera,
    enviarCarpetaPapelera,
    restaurarArchivo,
    restaurarCarpeta,
    eliminarArchivoDefinitivo,
    eliminarCarpetaDefinitiva,
    listarArchivosPapelera,
    listarCarpetasPapelera
};
