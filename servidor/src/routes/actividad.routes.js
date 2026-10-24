const express = require('express');

const actividadController = require('../controllers/actividad.controller');
const { verificarToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.get(
    '/',
    verificarToken,
    actividadController.listar
);

module.exports = router;
