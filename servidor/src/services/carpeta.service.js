const mongoose = require('mongoose');
const Carpeta = require('../models/Carpeta');

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

    // Validar que la carpeta creada no intente referenciarse a si misma como padre
    if (carpeta.carpetaPadre && carpeta.carpetaPadre.toString() === carpeta._id.toString()) {
        throw new Error('Una carpeta no puede ser su propia carpeta padre');
    }

    return carpeta;
};

// Listar las carpetas que están dentro de una carpeta padre específica
const listarCarpetas = async (usuarioId, carpetaPadre = null) => {
    return await Carpeta.find({
        propietario: usuarioId,
        carpetaPadre: carpetaPadre,
        eliminada: false
    }).sort({
        nombre: 1
    });
};

// Buscar todas las carpetas activas del usuario sin importar la jerarquía
const listarTodasLasCarpetas = async (usuarioId) => {
    return await Carpeta.find({
        propietario: usuarioId,
        eliminada: false
    })
        .populate('carpetaPadre', 'nombre')
        .sort({ nombre: 1 });
};

module.exports = {
    crearCarpeta,
    listarCarpetas,
    listarTodasLasCarpetas
};
