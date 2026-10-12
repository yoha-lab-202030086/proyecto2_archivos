// Verificar si el usuario que solicita tiene asignado el rol de administrador
const verificarAdministrador = (req, res, next) => {
    if (req.usuario.rol !== 'ADMINISTRADOR') {
        return res.status(403).json({
            mensaje: 'No tienes permisos de administrador'
        });
    }

    next();
};

module.exports = verificarAdministrador;
