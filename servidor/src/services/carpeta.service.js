const mongoose = require('mongoose');
const Carpeta = require('../models/Carpeta');
const { registrarActividad } = require('./actividad.service');


// Crear una carpeta nueva aplicando controles en el nombre y en las referencias padres
const crearCarpeta = async (datos, usuarioId) => {
    // Validar que el nombre no venga vacio
    if (!datos.nombre || datos.nombre.trim() === '') {
        throw new Error('El nombre de la carpeta es obligatorio');
    }

    // Quitar espacios vacios sobrantes al inicio o al final
    const nombreLimpio = datos.nombre.trim();

    if (datos.carpetaPadre) {
        // Validar que el formato del ID del directorio padre sea correcto
        if (!mongoose.Types.ObjectId.isValid(datos.carpetaPadre)) {
            throw new Error('El identificador de la carpeta padre no es válido');
        }

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
        nombre: nombreLimpio,
        propietario: usuarioId,
        carpetaPadre: datos.carpetaPadre || null
    });

    await carpeta.save();

    await registrarActividad({
    usuario: usuarioId,
    accion: 'CREAR_CARPETA',
    recursoTipo: 'CARPETA',
    recursoId: carpeta._id,
    detalle: `Se creó la carpeta ${carpeta.nombre}`
});

    // Validar que la carpeta creada no intente referenciarse a si misma como padre
    if (carpeta.carpetaPadre && carpeta.carpetaPadre.toString() === carpeta._id.toString()) {
        throw new Error('Una carpeta no puede ser su propia carpeta padre');
    }

    return carpeta;
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

const listarTodasLasCarpetas = async (usuarioId) => {
    const carpetas = await Carpeta.find({ propietario: usuarioId, eliminada: false }).sort({ nombre: 1 });
    return carpetas.map(c => {
        const item = c.toObject();
        if (!item.carpetaPadre) item.carpetaPadre = null;
        return item;
    });
};

const actualizarCarpeta = async (carpetaId, usuarioId, nuevosDatos) => {
    if (nuevosDatos.nombre && nuevosDatos.nombre.trim() === '') {
        throw new Error('El nombre de la carpeta no puede estar vacío');
    }

    return await Carpeta.findOneAndUpdate(
        { _id: carpetaId, propietario: usuarioId, eliminada: false },
        { nombre: nuevosDatos.nombre?.trim() ,
        carpetaPadre: nuevosDatos.carpetaPadre === undefined ? undefined : nuevosDatos.carpetaPadre //
        },
        { new: true }
    );
};


module.exports = {
    crearCarpeta,
    listarCarpetas,
    listarTodasLasCarpetas,
    actualizarCarpeta
};
