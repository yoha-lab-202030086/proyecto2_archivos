const express = require('express');
const cors = require('cors');

const usuarioRoutes = require('./routes/usuario.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Ruta principal para comprobar la funcion de la API 
app.get('/api', (req, res) => {
    res.json({
        mensaje: 'API del Sistema de Gestión Documental funcionando'
    });
});

// Conexion de las rutas de usuarios
app.use('/api/usuarios', usuarioRoutes);

module.exports = app;
