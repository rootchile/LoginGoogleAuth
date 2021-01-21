const express = require('express');
const bcrypt = require('bcrypt');
// es un standard llamarlo "_"
const _ = require('underscore');
const Usuario = require('../models/usuario');
const { verificaToken, verificaAdmin } = require('../middlewares/autenticacion');


const app = express();


app.get('/usuario', verificaToken, function(req, res) {

    // si no viene entonces 0
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    let activo = { estado: true }

    Usuario.find(activo, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {

            if (err)
                return res.status(400).json({
                    ok: false,
                    err
                });

            Usuario.count(activo, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    usuariosCount: conteo
                });
            });


        });

});

// usamos package body-parser para a procesar post
app.post('/usuario', [verificaToken, verificaAdmin], function(req, res) {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => { 

        if (err)
            return res.status(400).json({
                ok: false,
                err
            });

        // usuarioDB.password = null;


        return res.json({
            ok: true,
            usuarioDB
        });


    });

});

// actualizar registro
app.put('/usuario/:id', [verificaToken, verificaAdmin], function(req, res) {

    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err)
            return res.status(400).json({
                ok: false,
                err
            });


        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });


});

app.delete('/usuario/:id', [verificaToken, verificaAdmin], function(req, res) {

    let id = req.params.id;


    // // este metodo borra registro fisicamente
    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

    // este metodo marca borrado estado = true
    let cambiaEstado = {
        estado: false
    }
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {

        if (err)
            return res.status(400).json({
                ok: false,
                err
            });

        if (!usuarioBorrado)

            return res.status(400).json({
            ok: false,
            err: {
                message: 'User no encontrado'
            }
        });



        res.json({
            ok: true,
            usuario: usuarioBorrado
        })

    })


});




module.exports = app;