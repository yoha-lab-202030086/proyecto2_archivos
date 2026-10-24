const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },

    correo: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    contraseña: {
        type: String,
        required: true
    },

    rol: {
        type: String,
        enum: ['ADMINISTRADOR', 'USUARIO'],
        default: 'USUARIO'
    },

    activo: {
        type: Boolean,
        default: true
    },

    almacenamientoTotal: {
        type: Number,
        default: 1073741824
    },

    almacenamientoUsado: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

usuarioSchema.index({ correo: 1 });

module.exports = mongoose.model('Usuario', usuarioSchema);
