const express = require('express');
let { verificaToken, verificaAdmin } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

// Muestra todas las categorias
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        // referencia en el esquema
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {


            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categorias
            })

        });
});

// Muestra informacion de la categoria
app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    Categoria.findById(id, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'ID no existe'
                }
            });
        }

        return res.json({
            ok: true,
            categoria: categoriaDB
        })

    });

});

// Crear una nueva categoria
app.post('/categoria', verificaToken, (req, res) => {

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });


    }); // end Save

});
// Actualiza categoria dado un Id

app.put('/categoria/:id', [verificaToken, verificaAdmin], (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let categoriaNew = {
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate(id, categoriaNew, { new: true, runValidators: true, context: 'query' }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });


    });

});


// Borra categoria

app.delete('/categoria/:id', [verificaToken, verificaAdmin], (req, res) => {

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'ID no existe'
                }
            });
        }


        res.json({
            ok: true,
            message: 'Categoria borrada'
        });
    });

});

module.exports = app;