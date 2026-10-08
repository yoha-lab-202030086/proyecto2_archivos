const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');

// Se crea el servicio para separar la lógica de los usuarios
const registrarUsuario = async (datos) => {

    const usuarioExistente = await Usuario.findOne({
        correo: datos.correo.toLowerCase()
    });

    if (usuarioExistente) {
        throw new Error('El correo ya está registrado');
    }

    // Se encripta la contraseña antes de guardarla
    const contraseñaEncriptada = await bcrypt.hash(datos.contraseña, 10);

    const usuario = new Usuario({
        nombre: datos.nombre,
        correo: datos.correo.toLowerCase(),
        contraseña: contraseñaEncriptada,
        rol: datos.rol || 'USUARIO'
    });

    return await usuario.save();
};

const buscarPorCorreo = async (correo) => {
    return await Usuario.findOne({
        correo: correo.toLowerCase()
    });
};

const listarUsuarios = async () => {
    return await Usuario.find().select('-contraseña');
};

module.exports = {
    registrarUsuario,
    buscarPorCorreo,
    listarUsuarios
};
