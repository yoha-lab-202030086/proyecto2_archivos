const Archivo = require('../models/Archivo');
const Usuario = require('../models/Usuario');
const Actividad = require('../models/Actividad');

// Obtener la lista de los diez archivos con mayor peso en el sistema
const obtenerArchivosMasGrandes = async () => {
    return await Archivo.find({ eliminado: false })
        .sort({ tamaño: -1 })
        .limit(10)
        .populate('propietario', 'nombre correo')
        .select('nombre tipo tamaño propietario fechaSubida');
};

// Obtener el consumo de almacenamiento ordenado de mayor a menor por usuario
const obtenerAlmacenamientoPorUsuario = async () => {
    return await Usuario.find({ activo: true })
        .select('nombre correo almacenamientoTotal almacenamientoUsado')
        .sort({ almacenamientoUsado: -1 });
};

// Agrupar y contabilizar el total de operaciones por tipo de accion realizada
const obtenerActividadesPorTipo = async () => {
    return await Actividad.aggregate([
        {
            $group: {
                _id: '$accion',
                total: { $sum: 1 }
            }
        },
        {
            $sort: { total: -1 }
        }
    ]);
};

module.exports = {
    obtenerArchivosMasGrandes,
    obtenerAlmacenamientoPorUsuario,
    obtenerActividadesPorTipo
};
