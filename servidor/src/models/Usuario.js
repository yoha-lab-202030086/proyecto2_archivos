const mongoose = require('mongoose');

// se crea el modelo para guardar la información de los usuarios
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

// Se crea un índice para poder buscar usuarios por correo
usuarioSchema.index({ correo: 1 });

module.exports = mongoose.model('Usuario', usuarioSchema);
