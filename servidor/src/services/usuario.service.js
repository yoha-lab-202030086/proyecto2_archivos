const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');

const registrarUsuario = async (datos) => {
    if (!datos.nombre || !datos.nombre.trim()) {
        throw new Error('El nombre es obligatorio');
    }

    if (!datos.correo || !datos.correo.trim()) {
        throw new Error('El correo es obligatorio');
    }

    if (!datos.contraseña || datos.contraseña.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    const correo = datos.correo.trim().toLowerCase();
    const correoExiste = await Usuario.findOne({ correo });

    if (correoExiste) {
        throw new Error('El correo ya está registrado');
    }

    const salt = await bcrypt.genSalt(10);
    const contraseñaEncriptada = await bcrypt.hash(datos.contraseña, salt);

    const usuario = new Usuario({
        nombre: datos.nombre.trim(),
        correo,
        contraseña: contraseñaEncriptada,
        rol: 'USUARIO' 
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

const cambiarEstadoUsuario = async (id, activo) => {
    if (typeof activo !== 'boolean') {
        throw new Error('El estado debe ser verdadero o falso');
    }

    const usuario = await Usuario.findById(id);

    if (!usuario) {
        throw new Error('El usuario no existe');
    }

    usuario.activo = activo;
    await usuario.save();

    const respuesta = usuario.toObject();
    delete respuesta.contraseña;

    return respuesta;
};

module.exports = {
    registrarUsuario,
    buscarPorCorreo,
    listarUsuarios,
    cambiarEstadoUsuario
};
