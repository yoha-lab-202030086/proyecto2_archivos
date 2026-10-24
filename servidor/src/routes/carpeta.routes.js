const express = require('express');

const carpetaController = require('../controllers/carpeta.controller');
const { verificarToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', verificarToken, carpetaController.crear);

router.get('/', verificarToken, carpetaController.listar);

router.get('/todas', verificarToken, carpetaController.listarTodas);

router.put('/:id', verificarToken, carpetaController.actualizar);

module.exports = router;
