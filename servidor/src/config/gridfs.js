const mongoose = require('mongoose');

// Se crea el bucket que se utiliza para guardar los archivos
const obtenerBucket = () => {

    if (mongoose.connection.readyState !== 1) {
        throw new Error('MongoDB no está conectado');
    }

    const bucket = new mongoose.mongo.GridFSBucket(
        mongoose.connection.db,
        {
            bucketName: 'archivos'
        }
    );

    return bucket;
};

module.exports = obtenerBucket;
