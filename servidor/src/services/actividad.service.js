const Actividad = require('../models/Actividad');

const registrarActividad = async ({
    usuario,
    accion,
    recursoTipo,
    recursoId = null,
    detalle = ''
}) => {

    const actividad = new Actividad({
        usuario,
        accion,
        recursoTipo,
        recursoId,
        detalle
    });

    return await actividad.save();
};


const listarTodasLasActividades = async (fechaInicio, fechaFin) => {
    const filtro = {}; 

    if (fechaInicio || fechaFin) {
        filtro.fecha = {};
        if (fechaInicio) {
            
            const fechaLocalInicio = new Date(fechaInicio.replace(/-/g, '\/'));
            fechaLocalInicio.setHours(0, 0, 0, 0);
            filtro.fecha.$gte = fechaLocalInicio;
        }

        if (fechaFin) {
           const fechaLocalFin = new Date(fechaFin.replace(/-/g, '\/'));
            fechaLocalFin.setHours(23, 59, 59, 999);
            filtro.fecha.$lte = fechaLocalFin;
        }
    }

    return await Actividad.find(filtro)
        .sort({ fecha: -1 })
        .populate('usuario', 'nombre correo'); 
};

module.exports = {
    registrarActividad,
    listarTodasLasActividades
};
