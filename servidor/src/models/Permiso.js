const mongoose = require('mongoose');

// Modelo, representa los permisos que un usuario recibe sobre un recurso
const permisoSchema = new mongoose.Schema({
    recursoTipo: {
        type: String,
        enum: ['ARCHIVO', 'CARPETA'],
        required: true
    },

    recursoId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    propietario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },

    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },

    nivel: {
        type: String,
        enum: ['LECTURA', 'EDICION'],
        required: true
    },

    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Evita duplicar el mismo permiso activo
permisoSchema.index({
    recursoTipo: 1,
    recursoId: 1,
    usuario: 1
});

module.exports = mongoose.model('Permiso', permisoSchema);
