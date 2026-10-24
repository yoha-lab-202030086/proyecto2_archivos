const mongoose = require('mongoose');
const Archivo = require('../models/Archivo');
const Usuario = require('../models/Usuario');
const Actividad = require('../models/Actividad');
const Permiso = require('../models/Permiso');
const Carpeta = require('../models/Carpeta');

const validarId = (id, nombre = 'identificador') => {
    if (!mongoose.isValidObjectId(id)) {
        throw new Error(`El ${nombre} no es válido`);
    }
};

const crearFiltroFechas = (fechaInicio, fechaFin) => {
    const filtro = {};

    if (fechaInicio || fechaFin) {
        filtro.fechaSubida = {};

        if (fechaInicio) {
            const inicio = new Date(fechaInicio);
            if (Number.isNaN(inicio.getTime())) {
                throw new Error('La fecha inicial no es válida');
            }
            filtro.fechaSubida.$gte = inicio;
        }

        if (fechaFin) {
            const fin = new Date(fechaFin);
            if (Number.isNaN(fin.getTime())) {
                throw new Error('La fecha final no es válida');
            }

            if (/^\d{4}-\d{2}-\d{2}$/.test(fechaFin)) {
                fin.setHours(23, 59, 59, 999);
            }
            filtro.fechaSubida.$lte = fin;
        }

        if (
            filtro.fechaSubida.$gte &&
            filtro.fechaSubida.$lte &&
            filtro.fechaSubida.$gte > filtro.fechaSubida.$lte
        ) {
            throw new Error(
                'La fecha inicial no puede ser posterior a la final'
            );
        }
    }

    return filtro;
};

const obtenerArchivosMasGrandes = async () => {
    return Archivo.find({ eliminado: { $ne: true } })
        .sort({ tamaño: -1 })
        .limit(10)
        .populate('propietario', 'nombre correo')
        .select('nombre tipo tamaño propietario fechaSubida');
};

const obtenerArchivosPorTipo = async () => {
    return Archivo.aggregate([
        { $match: { eliminado: { $ne: true } } },
        {
            $group: {
                _id: '$tipo',
                cantidad: { $sum: 1 },
                espacioTotal: { $sum: '$tamaño' }
            }
        },
        { $sort: { cantidad: -1 } }
    ]);
};

const obtenerArchivosPorFecha = async (fechaInicio, fechaFin) => {
    const filtro = {
        eliminado: { $ne: true },
        ...crearFiltroFechas(fechaInicio, fechaFin)
    };

    return Archivo.find(filtro)
        .sort({ fechaSubida: -1 })
        .populate('propietario', 'nombre correo')
        .populate('carpeta', 'nombre');
};

const obtenerArchivosMasOperaciones = async () => {
    return Actividad.aggregate([
        {
            $match: {
                recursoTipo: 'ARCHIVO',
                recursoId: { $ne: null }
            }
        },
        {
            $group: {
                _id: '$recursoId',
                operaciones: { $sum: 1 }
            }
        },
        { $sort: { operaciones: -1 } },
        {
            $lookup: {
                from: 'archivos',
                localField: '_id',
                foreignField: '_id',
                as: 'archivo'
            }
        },
        { $unwind: '$archivo' },
        { $match: { 'archivo.eliminado': { $ne: true } } },
        {
            $project: {
                _id: 1,
                operaciones: 1,
                nombre: '$archivo.nombre',
                tipo: '$archivo.tipo',
                tamaño: '$archivo.tamaño'
            }
        },
        { $limit: 10 }
    ]);
};

const obtenerAlmacenamientoPorTipo = async () => {
    return Archivo.aggregate([
        { $match: { eliminado: { $ne: true } } },
        {
            $group: {
                _id: '$tipo',
                cantidadArchivos: { $sum: 1 },
                espacioUtilizado: { $sum: '$tamaño' }
            }
        },
        { $sort: { espacioUtilizado: -1 } }
    ]);
};

const obtenerUsuariosMasArchivos = async () => {
    return Archivo.aggregate([
        { $match: { eliminado: { $ne: true } } },
        {
            $group: {
                _id: '$propietario',
                cantidadArchivos: { $sum: 1 }
            }
        },
        { $sort: { cantidadArchivos: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'usuarios',
                localField: '_id',
                foreignField: '_id',
                as: 'usuario'
            }
        },
        { $unwind: '$usuario' },
        {
            $project: {
                _id: 0,
                usuarioId: '$usuario._id',
                nombre: '$usuario.nombre',
                correo: '$usuario.correo',
                cantidadArchivos: 1
            }
        }
    ]);
};

const obtenerAlmacenamientoPorUsuario = async () => {
    return Usuario.find({ activo: true })
        .select('nombre correo almacenamientoTotal almacenamientoUsado')
        .sort({ almacenamientoUsado: -1 })
        .limit(10);
};

const obtenerPorcentajeAlmacenamiento = async () => {
    const usuarios = await Usuario.find({ activo: true })
        .select('nombre correo almacenamientoTotal almacenamientoUsado');

    return usuarios.map(usuario => {
        const total = usuario.almacenamientoTotal || 0;
        const usado = usuario.almacenamientoUsado || 0;

        return {
            usuarioId: usuario._id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            almacenamientoTotal: total,
            almacenamientoUsado: usado,
            almacenamientoDisponible: Math.max(0, total - usado),
            porcentajeUtilizado: total > 0
                ? Number(((usado / total) * 100).toFixed(2))
                : 0
        };
    });
};

const obtenerUsuariosMasComparten = async () => {
    return Permiso.aggregate([
        { $match: { activo: true } },
        {
            $group: {
                _id: '$propietario',
                recursosCompartidos: { $sum: 1 }
            }
        },
        { $sort: { recursosCompartidos: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'usuarios',
                localField: '_id',
                foreignField: '_id',
                as: 'usuario'
            }
        },
        { $unwind: '$usuario' },
        {
            $project: {
                _id: 0,
                usuarioId: '$usuario._id',
                nombre: '$usuario.nombre',
                correo: '$usuario.correo',
                recursosCompartidos: 1
            }
        }
    ]);
};

const obtenerRecursosMasCompartidos = async () => {
    return Permiso.aggregate([
        {
            $match: {
                activo: true,
                recursoTipo: 'ARCHIVO'
            }
        },
        {
            $group: {
                _id: '$recursoId',
                usuarios: { $addToSet: '$usuario' }
            }
        },
        {
            $project: {
                cantidadUsuarios: { $size: '$usuarios' }
            }
        },
        { $sort: { cantidadUsuarios: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'archivos',
                localField: '_id',
                foreignField: '_id',
                as: 'archivo'
            }
        },
        { $unwind: '$archivo' },
        { $match: { 'archivo.eliminado': { $ne: true } } },
        {
            $project: {
                _id: 1,
                nombre: '$archivo.nombre',
                tipo: '$archivo.tipo',
                cantidadUsuarios: 1
            }
        }
    ]);
};

const obtenerArchivosNoCompartidos = async () => {
    const compartidos = await Permiso.distinct('recursoId', {
        activo: true,
        recursoTipo: 'ARCHIVO'
    });

    return Archivo.find({
        eliminado: { $ne: true },
        _id: { $nin: compartidos }
    }).populate('propietario', 'nombre correo');
};

const obtenerCarpetasMasArchivos = async () => {
    return Archivo.aggregate([
        { $match: { eliminado: { $ne: true }, carpeta: { $ne: null } } },
        {
            $group: {
                _id: '$carpeta',
                cantidadArchivos: { $sum: 1 }
            }
        },
        { $sort: { cantidadArchivos: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'carpetas',
                localField: '_id',
                foreignField: '_id',
                as: 'carpeta'
            }
        },
        { $unwind: '$carpeta' },
        { $match: { 'carpeta.eliminada': { $ne: true } } },
        {
            $project: {
                _id: 1,
                nombre: '$carpeta.nombre',
                cantidadArchivos: 1
            }
        }
    ]);
};

const obtenerActividadesPorTipo = async () => {
    return Actividad.aggregate([
        {
            $group: {
                _id: '$accion',
                cantidad: { $sum: 1 }
            }
        },
        { $sort: { cantidad: -1 } }
    ]);
};

const obtenerActividadesPorPeriodo = async (periodo = 'mes') => {
    const formatos = {
        dia: '%Y-%m-%d',
        semana: '%G-W%V',
        mes: '%Y-%m',
        anio: '%Y'
    };

    if (!formatos[periodo]) {
        throw new Error('Periodo no válido. Usa dia, semana, mes o anio');
    }

    return Actividad.aggregate([
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: formatos[periodo],
                        date: '$fecha'
                    }
                },
                cantidad: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);
};

const obtenerAccionesPrincipales = async () => {
    return Actividad.aggregate([
        {
            $group: {
                _id: '$accion',
                cantidad: { $sum: 1 }
            }
        },
        { $sort: { cantidad: -1 } },
        { $limit: 10 }
    ]);
};

module.exports = {
    validarId,
    crearFiltroFechas,
    obtenerArchivosMasGrandes,
    obtenerArchivosPorTipo,
    obtenerArchivosPorFecha,
    obtenerArchivosMasOperaciones,
    obtenerAlmacenamientoPorTipo,
    obtenerUsuariosMasArchivos,
    obtenerAlmacenamientoPorUsuario,
    obtenerPorcentajeAlmacenamiento,
    obtenerUsuariosMasComparten,
    obtenerRecursosMasCompartidos,
    obtenerArchivosNoCompartidos,
    obtenerCarpetasMasArchivos,
    obtenerActividadesPorTipo,
    obtenerActividadesPorPeriodo,
    obtenerAccionesPrincipales
};