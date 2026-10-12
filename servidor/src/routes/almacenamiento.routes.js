const express = require('express');
const almacenamientoController = require('../controllers/almacenamiento.controller');
const { verificarToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Operación para consultar el estado del espacio de la cuenta
router.get('/', verificarToken, almacenamientoController.consultar);

module.exports = router;
