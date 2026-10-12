const Permiso = require('../models/Permiso');
const Usuario = require('../models/Usuario');
const Archivo = require('../models/Archivo');
const Carpeta = require('../models/Carpeta');
const { registrarActividad } = require('./actividad.service');

// Crear o actualizar un permiso sobre un archivo o carpeta compartido
const compartirRecurso = async (recursoTipo, recursoId, usuarioDestinoId, nivel, propietarioId) => {
    if (!['ARCHIVO', 'CARPETA'].includes(recursoTipo)) {
        throw new Error('Tipo de recurso inválido');
    }

    if (!['LECTURA', 'EDICION'].includes(nivel)) {
        throw new Error('Nivel de permiso inválido');
    }

    const usuarioDestino = await Usuario.findOne({
        _id: usuarioDestinoId,
        activo: true
    });

    if (!usuarioDestino) {
        throw new Error('El usuario destino no existe o está inactivo');
    }

    if (propietarioId.toString() === usuarioDestinoId.toString()) {
        throw new Error('No puedes compartir un recurso contigo mismo');
    }

    let recurso;
    if (recursoTipo === 'ARCHIVO') {
        recurso = await Archivo.findOne({ _id: recursoId, propietario: propietarioId, eliminado: false });
    } else {
        recurso = await Carpeta.findOne({ _id: recursoId, propietario: propietarioId, eliminada: false });
    }

    if (!recurso) {
        throw new Error('El recurso no existe o no te pertenece');
    }

    let permiso = await Permiso.findOne({ recursoTipo, recursoId, usuario: usuarioDestinoId, propietario: propietarioId });

    if (permiso) {
        permiso.nivel = nivel;
        permiso.activo = true;
        await permiso.save();
    } else {
        permiso = await Permiso.create({
            recursoTipo,
            recursoId,
            propietario: propietarioId,
            usuario: usuarioDestinoId,
            nivel,
            activo: true
        });
    }

    await registrarActividad({
        usuario: propietarioId,
        accion: 'COMPARTIR_RECURSO',
        recursoTipo,
        recursoId,
        detalle: `Recurso compartido con ${usuarioDestino.correo}`
    });

    return permiso;
};

// Comprobar si el usuario cuenta con los permisos necesarios para la lectura o edicion
const comprobarPermiso = async (usuarioId, recursoTipo, recursoId, nivelRequerido) => {
    const nivelesPermitidos = nivelRequerido === 'LECTURA' ? ['LECTURA', 'EDICION'] : ['EDICION'];

    return Permiso.findOne({
        usuario: usuarioId,
        recursoTipo,
        recursoId,
        nivel: { "$in": nivelesPermitidos },
        activo: true
    });
};

// Consultar la lista de permisos otorgados sobre un recurso específico
const listarPermisosRecurso = async (recursoTipo, recursoId, propietarioId) => {
    if (!['ARCHIVO', 'CARPETA'].includes(recursoTipo) || !recursoId) {
        throw new Error('Debes indicar un tipo y un identificador de recurso válidos');
    }

    const filtro = { recursoTipo, recursoId, propietario: propietarioId, activo: true };

    const recurso = recursoTipo === 'ARCHIVO'
        ? await Archivo.findOne({ _id: recursoId, propietario: propietarioId })
        : await Carpeta.findOne({ _id: recursoId, propietario: propietarioId });

    if (!recurso) {
        throw new Error('El recurso no existe o no te pertenece');
    }

    return Permiso.find(filtro).populate('usuario', 'nombre correo').sort({ createdAt: -1 });
};

// Desactivar un acceso compartido de forma logica
const retirarPermiso = async (permisoId, propietarioId) => {
    const permiso = await Permiso.findOne({ _id: permisoId, propietario: propietarioId, activo: true });

    if (!permiso) {
        throw new Error('Permiso no encontrado');
    }

    permiso.activo = false;
    await permiso.save();

    return permiso;
};

// Modificar el nivel de un permiso entre lectura y edicion
const modificarPermiso = async (permisoId, nuevoNivel, propietarioId) => {
    if (!['LECTURA', 'EDICION'].includes(nuevoNivel)) {
        throw new Error('Nivel de permiso inválido');
    }

    const permiso = await Permiso.findOne({ _id: permisoId, propietario: propietarioId, activo: true });

    if (!permiso) {
        throw new Error('Permiso no encontrado');
    }

    permiso.nivel = nuevoNivel;
    await permiso.save();

    return permiso;
};

module.exports = {
    compartirRecurso,
    comprobarPermiso,
    listarPermisosRecurso,
    retirarPermiso,
    modificarPermiso
};
