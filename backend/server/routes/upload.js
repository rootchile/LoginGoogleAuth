const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
let { verificaToken, verificaAdmin } = require('../middlewares/autenticacion');

// esquemas
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

// filesystem node
const fs = require('fs');
// rutas 
const path = require('path');

// middleware para carga, situa la carga en req.files
app.use(fileUpload());

app.put('/upload/:tipo/:id', [verificaToken, verificaAdmin], function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No hay archvo seleccionado'
            }
        })
    }

    // tipos validos
    let tiposValidos = ['producto', 'usuario'];

    if (tiposValidos.indexOf(tipo) < 0)
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Tipo no permitido (Permitidos ' + tiposValidos.join(',') + ')'
            }
        });
    // input id =  archivo
    let file = req.files.archivo;
    let fileName = file.name.split('.');
    let fileExt = fileName[fileName.length - 1];

    // Extensiones
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(fileExt) < 0)
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Extension no permitida (Permitidas ' + extensionesValidas.join(',') + ')'
            }
        });

    let fileNameUnique = `${ id }-${ new Date().getMilliseconds() }.${ fileExt }`;

    uploadPath = `uploads/${ tipo }/${ fileNameUnique}`;

    // Use the mv() method to place the file somewhere on your server
    file.mv(uploadPath, function(err) {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });

        if (tipo === 'usuario') {
            fileUsuario(id, fileNameUnique, res);
        } else {
            fileProducto(id, fileNameUnique, res);
        }
        // res.json({
        //     ok: true,
        //     message: 'Archivo cargada correctamente'
        // });

    });
});

// Carga imagen de usuario
// recibe como referencia el res
// si el usuario no existe, borramos el file
function fileUsuario(id, fileNameUnique, res) {

    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {
            // previene que quede basura en el server
            deleteFile(fileNameUnique, 'usuario');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            // previene que quede basura en el server
            deleteFile(fileNameUnique, 'usuario');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }
        // borrar img antigua del usuario
        deleteFile(usuarioDB.img, 'usuario');


        usuarioDB.img = fileNameUnique;

        usuarioDB.save((err, usuarioDB) => {

            res.json({
                ok: true,
                usuario: usuarioDB,
                img: fileNameUnique
            });

        });
    })

}

// Cargar img a productos
function fileProducto(id, fileNameUnique, res) {

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            // previene que quede basura en el server
            deleteFile(fileNameUnique, 'producto');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            // previene que quede basura en el server
            deleteFile(fileNameUnique, 'producto');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }
        // borrar img antigua del usuario
        deleteFile(productoDB.img, 'producto');


        productoDB.img = fileNameUnique;

        productoDB.save((err, productoDB) => {

            res.json({
                ok: true,
                producto: productoDB,
                img: fileNameUnique
            });

        });
    })


}

// elimina archivo si existe
function deleteFile(fileNameUnique, tipo) {

    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${fileNameUnique}`);

    if (fs.existsSync(pathImg)) {
        fs.unlinkSync(pathImg);
    }

}

module.exports = app;