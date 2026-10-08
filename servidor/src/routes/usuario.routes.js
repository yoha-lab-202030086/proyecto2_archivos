const express = require('express');

const usuarioController = require('../controllers/usuario.controller');
const { verificarToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', usuarioController.registrar);

// Para consultar usuarios, se necesita iniciar sesión
router.get('/', verificarToken, usuarioController.listar);

module.exports = router;
