const mongoose = require('mongoose');

// Se crea el modelo de carpetas para poder manejar carpetas y subcarpetas
const carpetaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },

    propietario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },

    carpetaPadre: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Carpeta',
        default: null
    },

    eliminada: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indice para buscar las carpetas de un usuario
carpetaSchema.index({
    propietario: 1,
    carpetaPadre: 1
});

module.exports = mongoose.model('Carpeta', carpetaSchema);
