const multer = require('multer');

const almacenamiento = multer.memoryStorage();

const upload = multer({
    storage: almacenamiento
});

module.exports = upload;
