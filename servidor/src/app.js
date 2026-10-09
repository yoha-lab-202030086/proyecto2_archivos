const express = require('express');
const cors = require('cors');

const usuarioRoutes = require('./routes/usuario.routes');
const authRoutes = require('./routes/auth.routes');
const carpetaRoutes = require('./routes/carpeta.routes');
const archivoRoutes = require('./routes/archivo.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api', (req, res) => {
    res.json({
        mensaje: 'API del Sistema de Gestión Documental funcionando'
    });
});

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/carpetas', carpetaRoutes);
app.use('/api/archivos', archivoRoutes);

module.exports = app;
