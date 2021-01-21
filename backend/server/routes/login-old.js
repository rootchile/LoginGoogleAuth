const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Google Auth
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENTID);

const Usuario = require('../models/usuario');
const app = express();


app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err)
            return res.status(500).json({
                ok: false,
                err
            });

        if (!usuarioDB)
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario o contraseña incorrecto"
                }
            });

        if (!bcrypt.compareSync(body.password, usuarioDB.password))
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario o contraseña incorrecto"
                }
            });

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.TOKEN_SEED, { expiresIn: process.env.TOKEN_EXPIREIN });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });

    });

});


// Config de Google

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENTID,
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true

    }
}


app.post('/google', async(req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(e => console.log(e));

    if (!googleUser) {
        return res.status(403).json({
            ok: false,
            err: {
                message: 'Google OAuth Token invalid'
            }
        });
    };

    // primero verificar que el email no exista
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Si existe, se ha autenticado por google?
        if (usuarioDB) {

            // No se ha autenticado por Google -> Entonces, no permitir.
            // Deberiamos modificar esto para que sí permita.
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe usar su autenticación normal'
                    }
                });

            } else {
                // si ya es user google, renovamos token
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.TOKEN_SEED, { expiresIn: process.env.TOKEN_EXPIREIN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            } // end else google === boolean

        } else {
            // si el usuario NO existe en la DB -> crear

            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;

            // el pass es obligatorio, creamos uno dummy que se hashea
            usuario.password = 'dummyPasswordNuncaFunciona'

            usuario.save((err, usuarioDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };

                // retornar un token
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.TOKEN_SEED, { expiresIn: process.env.TOKEN_EXPIREIN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });

            }); //end save

        } //end else
    }); // Usuario.findOne

});

module.exports = app;