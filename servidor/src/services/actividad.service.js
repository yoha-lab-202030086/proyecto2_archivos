const Actividad = require('../models/Actividad');

const registrarActividad = async ({
    usuario,
    accion,
    recursoTipo,
    recursoId = null,
    detalle = ''
}) => {

    // Guarda la actividad para poder utilizarla despues en los reportes
    const actividad = new Actividad({
        usuario,
        accion,
        recursoTipo,
        recursoId,
        detalle
    });

    return await actividad.save();
};

const listarActividadesUsuario = async (
    usuarioId,
    fechaInicio,
    fechaFin
) => {

    const filtro = {
        usuario: usuarioId
    };

    if (fechaInicio || fechaFin) {

        filtro.fecha = {};

        if (fechaInicio) {
            filtro.fecha.$gte = new Date(fechaInicio);
        }

        if (fechaFin) {
            filtro.fecha.$lte = new Date(fechaFin);
        }
    }

    return await Actividad.find(filtro)
        .sort({ fecha: -1 })
        .populate('usuario', 'nombre correo');
};

module.exports = {
    registrarActividad,
    listarActividadesUsuario
};
