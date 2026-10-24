const mongoose = require('mongoose');

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
