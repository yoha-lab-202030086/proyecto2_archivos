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

const comprobarPermiso = async (usuarioId, recursoTipo, recursoId, nivelRequerido) => {
    
    // 1. Validar existencia del recurso y que NO esté en la papelera
    let recurso;
    if (recursoTipo === 'ARCHIVO') {
        // Ajusta 'eliminado' según el nombre exacto de la bandera en tu modelo de Archivo
        recurso = await Archivo.findOne({ _id: recursoId });
        if (!recurso || recurso.eliminado === true) {
            throw new Error('El archivo no existe o se encuentra en la papelera');
        }
    } else {
        // Ajusta 'eliminada' según el nombre exacto de la bandera en tu modelo de Carpeta
        recurso = await Carpeta.findOne({ _id: recursoId });
        if (!recurso || recurso.eliminada === true) {
            throw new Error('La carpeta no existe o se encuentra en la papelera');
        }
    }

    // 2. Validar propiedad directa (Si eres el dueño, tienes acceso total)
    if (recurso.propietario.toString() === usuarioId.toString()) {
        return true; 
    }

    // Si el controlador exige ser PROPIETARIO y no es el dueño, rechazar inmediatamente
    if (nivelRequerido === 'PROPIETARIO') {
        throw new Error('Operación exclusiva del propietario del recurso');
    }

    // 3. Evaluar si existe un permiso compartido activo directo
    const permiso = await Permiso.findOne({
        usuario: usuarioId,
        recursoTipo,
        recursoId,
        activo: true
    });
    
    if (!permiso) {
        throw new Error('No tienes acceso a este recurso'); 
    }

    // 4. Evaluar la jerarquía de accesos requeridos para usuarios invitados
    if (nivelRequerido === 'LECTURA') {
        if (permiso.nivel === 'LECTURA' || permiso.nivel === 'EDICION') {
            return true;
        }
    }

    if (nivelRequerido === 'EDICION') {
        if (permiso.nivel === 'EDICION') {
            return true;
        }
    }

    throw new Error('No cuentas con los permisos suficientes para esta acción');
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

    await registrarActividad({
    usuario: propietarioId,
    accion: 'RETIRAR_PERMISO',
    recursoTipo: permiso.recursoTipo,
    recursoId: permiso.recursoId,
    detalle: `Se retiró el permiso del usuario ${permiso.usuario}`
});

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

await registrarActividad({
    usuario: propietarioId,
    accion: 'MODIFICAR_PERMISO',
    recursoTipo: permiso.recursoTipo,
    recursoId: permiso.recursoId,
    detalle: `El permiso se cambió a ${permiso.nivel}`
});



    return permiso;
};

module.exports = {
    compartirRecurso,
    comprobarPermiso,
    listarPermisosRecurso,
    retirarPermiso,
    modificarPermiso
};
