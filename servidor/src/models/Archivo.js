const mongoose = require('mongoose');

// Se Guardan los datos que se necesitan para identificar y organizar cada archivo
const archivoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },

    tipo: {
        type: String,
        required: true
    },

    tamaño: {
        type: Number,
        required: true
    },

    propietario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },

    carpeta: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Carpeta',
        default: null
    },

    gridFsId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    eliminado: {
        type: Boolean,
        default: false
    },

    fechaSubida: {
        type: Date,
        default: Date.now
    }
});

// Indice para buscar archivos por propietario y carpeta
archivoSchema.index({
    propietario: 1,
    carpeta: 1
});

module.exports = mongoose.model('Archivo', archivoSchema);
