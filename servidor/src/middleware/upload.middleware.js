const multer = require('multer');

// Se Recibe el archivo temporalmente en memoria para después enviarlo a GridFS
const almacenamiento = multer.memoryStorage();

const upload = multer({
    storage: almacenamiento
});

module.exports = upload;
