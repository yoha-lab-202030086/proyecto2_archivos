const Carpeta = require('../models/Carpeta');

const crearCarpeta = async (datos, usuarioId) => {

    // Si tiene carpeta padre, primero se comprueba si exista
    if (datos.carpetaPadre) {

        const carpetaPadre = await Carpeta.findOne({
            _id: datos.carpetaPadre,
            propietario: usuarioId,
            eliminada: false
        });

        if (!carpetaPadre) {
            throw new Error('La carpeta padre no existe');
        }
    }

    const carpeta = new Carpeta({
        nombre: datos.nombre,
        propietario: usuarioId,
        carpetaPadre: datos.carpetaPadre || null
    });

    return await carpeta.save();
};

const listarCarpetas = async (usuarioId, carpetaPadre = null) => {

    return await Carpeta.find({
        propietario: usuarioId,
        carpetaPadre: carpetaPadre,
        eliminada: false
    }).sort({
        nombre: 1
    });
};

module.exports = {
    crearCarpeta,
    listarCarpetas
};
