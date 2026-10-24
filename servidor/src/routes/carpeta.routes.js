const express = require('express');

const carpetaController = require('../controllers/carpeta.controller');
const { verificarToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Operacion para crear carpetas
router.post('/', verificarToken, carpetaController.crear);

// Operacion para listar carpetas por jerarquia
router.get('/', verificarToken, carpetaController.listar);

// Operacion para obtener todas las carpetas activas del usuario
router.get('/todas', verificarToken, carpetaController.listarTodas);

router.put('/:id', verificarToken, carpetaController.actualizar);

module.exports = router;
