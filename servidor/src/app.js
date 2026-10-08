const express = require('express');
const cors = require('cors');

const usuarioRoutes = require('./routes/usuario.routes');
const authRoutes = require('./routes/auth.routes');
const carpetaRoutes = require('./routes/carpeta.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Ruta para comprobar que la API está funcionando
app.get('/api', (req, res) => {
    res.json({
        mensaje: 'API del Sistema de Gestión Documental funcionando'
    });
});

// Rutas de usuarios
app.use('/api/usuarios', usuarioRoutes);

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de carpetas
app.use('/api/carpetas', carpetaRoutes);

module.exports = app;
