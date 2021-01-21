const express = require('express');
let { verificaToken, verificaAdmin } = require('../middlewares/autenticacion');

let app = express();

let Producto = require('../models/producto');

// Muestra todas los productos
app.get('/producto', verificaToken, (req, res) => {


    let desde = req.query.desde || 0;
    desde = Number(desde);


    // solo productos disponibles
    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5)
        .sort('nombre')
        // referencia en el esquema
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {


            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            })

        });
});


// Muestra informacion del producto por id
app.get('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'ID no existe'
                    }
                });
            }

            return res.json({
                ok: true,
                producto: productoDB
            })

        });

});



app.post('/producto', [verificaToken, verificaAdmin], (req, res) => {

    let body = req.body;

    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    });

    producto.save((err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        // .status(201) si quiero indicar que se creo via headers
        res.json({
            ok: true,
            producto: productoDB
        });

    });

});


app.put('/producto/:id', [verificaToken, verificaAdmin], (req, res) => {

    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'ID no existe'
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.descripcion = body.descripcion;
        productoDB.disponible = body.disponible;
        productoDB.categoria = body.categoria;

        productoDB.save((err, productoGuardado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado
            });

        }); // end Save

    }); //end FindById


});

app.delete('/producto/:id', [verificaToken, verificaAdmin], (req, res) => {

    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'ID no existe'
                }
            });
        }

        if (productoDB.disponible === false) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }

        productoDB.disponible = false;

        productoDB.save((err, productoBorrado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }


            res.json({
                ok: true,
                producto: productoBorrado,
                message: 'Producto borrado'
            });

        }); // end Save
    });

});


app.get('/producto/buscar/:termino', [verificaToken], (req, res) => {

    let termino = req.params.termino;
    // i: insensible a mayus/minus
    let regex = new RegExp(termino, 'i')


    Producto.find({ nombre: regex, disponible: true })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });

        })

});

module.exports = app;