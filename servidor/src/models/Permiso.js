const mongoose = require('mongoose');

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
        enum: ['LECTURA', 'COMENTAR', 'EDICION'  ],
        required: true
    },

    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

permisoSchema.index({
    recursoTipo: 1,
    recursoId: 1,
    usuario: 1
});

module.exports = mongoose.model('Permiso', permisoSchema);
