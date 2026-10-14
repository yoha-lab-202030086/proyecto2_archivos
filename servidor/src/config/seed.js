require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Usuario = require('../models/Usuario');
const Carpeta = require('../models/Carpeta');
const Archivo = require('../models/Archivo');
const Permiso = require('../models/Permiso');
const Actividad = require('../models/Actividad');
const obtenerBucket = require('./gridfs');

const CORREO_ADMIN = 'demo.admin@documental.local';
const CONTRASENA_DEMO = 'Demo1234!';

const guardarEnGridFS = (bucket, nombre, contenido, tipo) => {
    return new Promise((resolve, reject) => {
        const carga = bucket.openUploadStream(nombre, {
            contentType: tipo,
            metadata: { origen: 'datos-demostracion' }
        });

        carga.on('error', reject);
        carga.on('finish', () => resolve(carga.id));
        carga.end(contenido);
    });
};

const ejecutarSeed = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB conectado para cargar datos');

    const adminExiste = await Usuario.findOne({ correo: CORREO_ADMIN });

    if (adminExiste) {
        throw new Error(
            'Los datos de demostración ya existen. No se insertó nada.'
        );
    }

    const hash = await bcrypt.hash(CONTRASENA_DEMO, 10);

    const datosUsuarios = [{
        nombre: 'Administrador Demo',
        correo: CORREO_ADMIN,
        rol: 'ADMINISTRADOR'
    }];

    for (let i = 1; i <= 7; i++) {
        datosUsuarios.push({
            nombre: `Usuario Demo ${i}`,
            correo: `demo.usuario${i}@documental.local`,
            rol: 'USUARIO'
        });
    }

    const usuarios = [];

    for (const datos of datosUsuarios) {
        const usuario = await Usuario.create({
            ...datos,
            contraseña: hash,
            almacenamientoTotal: 1073741824,
            almacenamientoUsado: 0,
            activo: true
        });

        usuarios.push(usuario);
    }

    console.log(`Creados ${usuarios.length} usuarios`);

    // Crear una carpeta principal y una subcarpeta por usuario.
    const carpetasPorUsuario = [];

    for (const usuario of usuarios) {
        const principal = await Carpeta.create({
            nombre: 'Documentos',
            propietario: usuario._id,
            carpetaPadre: null
        });

        const subcarpeta = await Carpeta.create({
            nombre: 'Compartidos y trabajo',
            propietario: usuario._id,
            carpetaPadre: principal._id
        });

        carpetasPorUsuario.push({
            principal,
            subcarpeta
        });
    }

    const bucket = obtenerBucket();

    const tipos = [
        { extension: 'pdf', mime: 'application/pdf' },
        { extension: 'txt', mime: 'text/plain' },
        { extension: 'csv', mime: 'text/csv' },
        {
            extension: 'json',
            mime: 'application/json'
        },
        {
            extension: 'png',
            mime: 'image/png'
        }
    ];

    const archivos = [];
    const almacenamientoPorUsuario = new Map(
        usuarios.map(usuario => [usuario._id.toString(), 0])
    );

    // Crear 50 archivos y guardar su contenido en GridFS.
    for (let i = 0; i < 50; i++) {
        const indiceUsuario = i % usuarios.length;
        const usuario = usuarios[indiceUsuario];
        const carpeta = carpetasPorUsuario[indiceUsuario].subcarpeta;
        const tipo = tipos[i % tipos.length];

        const nombre = `documento_demo_${String(i + 1).padStart(2, '0')}.${tipo.extension}`;

        const contenido = Buffer.from(
            `Archivo de demostración ${i + 1}\n` +
            `Propietario: ${usuario.nombre}\n` +
            `Contenido de prueba del Sistema de Gestión Documental.\n`
        );

        const gridFsId = await guardarEnGridFS(
            bucket,
            nombre,
            contenido,
            tipo.mime
        );

        const eliminado = i >= 48;

        const archivo = await Archivo.create({
            nombre,
            tipo: tipo.mime,
            tamaño: contenido.length,
            propietario: usuario._id,
            carpeta: carpeta._id,
            gridFsId,
            eliminado
        });

        archivos.push(archivo);

        const clave = usuario._id.toString();
        almacenamientoPorUsuario.set(
            clave,
            almacenamientoPorUsuario.get(clave) + contenido.length
        );

        await Actividad.create({
            usuario: usuario._id,
            accion: eliminado ? 'ELIMINAR_ARCHIVO' : 'SUBIR_ARCHIVO',
            recursoTipo: 'ARCHIVO',
            recursoId: archivo._id,
            detalle: eliminado
                ? 'Archivo de demostración colocado en la papelera'
                : 'Archivo de demostración cargado'
        });
    }

    // Actualizar el almacenamiento incluyendo archivos en papelera.
    for (const usuario of usuarios) {
        usuario.almacenamientoUsado =
            almacenamientoPorUsuario.get(usuario._id.toString()) || 0;

        await usuario.save();
    }

    // Crear 20 permisos activos entre usuarios distintos.
    for (let i = 0; i < 20; i++) {
        const archivo = archivos[i];
        const propietario = usuarios[i % usuarios.length];
        const destinatario = usuarios[(i + 1) % usuarios.length];

        await Permiso.create({
            recursoTipo: 'ARCHIVO',
            recursoId: archivo._id,
            propietario: propietario._id,
            usuario: destinatario._id,
            nivel: i % 2 === 0 ? 'LECTURA' : 'EDICION',
            activo: true
        });

        await Actividad.create({
            usuario: propietario._id,
            accion: 'COMPARTIR_ARCHIVO',
            recursoTipo: 'ARCHIVO',
            recursoId: archivo._id,
            detalle: `Archivo compartido con ${destinatario.correo}`
        });
    }

    console.log('Carpetas y subcarpetas creadas');
    console.log(`Archivos creados en GridFS: ${archivos.length}`);
    console.log('Permisos compartidos creados: 20');
    console.log('Dos archivos quedaron en la papelera');
    console.log('Carga inicial terminada correctamente');
    console.log('');
    console.log('Administrador de demostración:');
    console.log(`Correo: ${CORREO_ADMIN}`);
    console.log(`Contraseña: ${CONTRASENA_DEMO}`);
    console.log('Cambia esta contraseña antes de cualquier uso real.');
};

ejecutarSeed()
    .catch(error => {
        console.error('Error al cargar datos iniciales:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });