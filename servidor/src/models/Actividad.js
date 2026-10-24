const mongoose = require('mongoose');

const actividadSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },

    accion: {
        type: String,
        required: true
    },

    recursoTipo: {
        type: String,
        required: true
    },

    recursoId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },

    detalle: {
        type: String,
        default: ''
    },

    fecha: {
        type: Date,
        default: Date.now
    }
});

actividadSchema.index({
    usuario: 1,
    fecha: -1
});

actividadSchema.index({
    accion: 1
});

module.exports = mongoose.model('Actividad', actividadSchema);
