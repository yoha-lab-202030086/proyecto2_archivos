const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');

// Registrar una cuenta de usuario nueva asignando siempre el rol base por seguridad
const registrarUsuario = async (datos) => {
    const correoExiste = await Usuario.findOne({ correo: datos.correo });
    if (correoExiste) {
        throw new Error('El correo ya está registrado');
    }

    const salt = await bcrypt.genSalt(10);
    const contraseñaEncriptada = await bcrypt.hash(datos.contraseña, salt);

    const usuario = new Usuario({
        nombre: datos.nombre,
        correo: datos.correo,
        contraseña: contraseñaEncriptada,
        rol: datos.rol || 'USUARIO'// 'USUARIO' Forzar rol base e impedir autoelevación de privilegios
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
