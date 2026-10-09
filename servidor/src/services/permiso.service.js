const mongoose = require('mongoose');
const Permiso = require('../models/Permiso');
const Usuario = require('../models/Usuario');
const Archivo = require('../models/Archivo');
const Carpeta = require('../models/Carpeta');

const compartirRecurso = async (
    recursoTipo,
    recursoId,
    usuarioDestinoId,
    nivel,
    propietarioId
) => {

    if (!['ARCHIVO', 'CARPETA'].includes(recursoTipo)) {
        throw new Error('Tipo de recurso inválido');
    }

    if (!['LECTURA', 'EDICION'].includes(nivel)) {
        throw new Error('Nivel de permiso inválido');
    }

    // Comprobación de que el usuario que recibe el permiso exista
    const usuarioDestino = await Usuario.findById(usuarioDestinoId);

    if (!usuarioDestino) {
        throw new Error('El usuario destino no existe');
    }

    // Comprobación de que el propietario realmente sea dueño del recurso
    let recurso;

    if (recursoTipo === 'ARCHIVO') {

        recurso = await Archivo.findOne({
            _id: recursoId,
            propietario: propietarioId,
            eliminado: false
        });

    } else {

        recurso = await Carpeta.findOne({
            _id: recursoId,
            propietario: propietarioId,
            eliminada: false
        });
    }

    if (!recurso) {
        throw new Error('El recurso no existe o no pertenece al propietario');
    }

    // Evita que un usuario se comparta un recurso consigo mismo
    if (propietarioId.toString() === usuarioDestinoId.toString()) {
        throw new Error('No es necesario compartir el recurso con el propietario');
    }

    const permisoExistente = await Permiso.findOne({
        recursoTipo,
        recursoId,
        usuario: usuarioDestinoId
    });

    if (permisoExistente) {

        permisoExistente.nivel = nivel;
        permisoExistente.activo = true;

        return await permisoExistente.save();
    }

    const permiso = new Permiso({
        recursoTipo,
        recursoId,
        propietario: propietarioId,
        usuario: usuarioDestinoId,
        nivel
    });

    return await permiso.save();
};

const comprobarPermiso = async (
    recursoTipo,
    recursoId,
    usuarioId,
    nivelNecesario
) => {

    const permiso = await Permiso.findOne({
        recursoTipo,
        recursoId,
        usuario: usuarioId,
        activo: true
    });

    // Comprobación de que si no tiene permiso, no puede utilizar el recurso
    if (!permiso) {
        return false;
    }

    // El permiso de edición también permite leer
    if (
        nivelNecesario === 'LECTURA' &&
        permiso.nivel === 'EDICION'
    ) {
        return true;
    }

    return permiso.nivel === nivelNecesario;
};

module.exports = {
    compartirRecurso,
    comprobarPermiso
};
