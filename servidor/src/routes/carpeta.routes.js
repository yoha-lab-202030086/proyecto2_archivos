const express = require('express');

const carpetaController = require('../controllers/carpeta.controller');
const { verificarToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Todas las operaciones de carpetas necesitan usuario autenticado
router.post('/', verificarToken, carpetaController.crear);

router.get('/', verificarToken, carpetaController.listar);

module.exports = router;
