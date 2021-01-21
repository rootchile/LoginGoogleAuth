const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const axios = require('axios');
const { Op } = require("sequelize");
const { models } = require('../sequelize');
const { getIdParam } = require('../sequelize/helpers');

const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENTID,
    process.env.GOOGLE_SECRET,
    `${process.env.BACKEND_SERVER}/login/google/callback`
);

// generate a url that asks permissions for Blogger and Google Calendar scopes
const scopes = [
    'email',
    'profile'
];


app.post('/login', async(req, res) => {

    const email = req.body.email
    const password = req.body.password;

    if (!password || !email)
        return res.status(404).json({
            ok: false,
            message: 'Debe ingresar email y contraseña'
        });


    const user = await models.user.findAll({
        attributes: ['email', 'password'],
        where: {
            email: {
                [Op.eq]: email
            }
        }
    }).then(function(user) {

        if (user.length === 0)
            return res.status(404).json({
                ok: false,
                message: 'Usuario o contraseña incorrectos.'
            });

        const passwordDB = user[0].password;

        if (!bcrypt.compareSync(password, passwordDB))
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario o contraseña incorrecto"
                }
            });
        const userId = user[0].id;
        // generamos token
        let token = jwt.sign({
            userId
        }, process.env.TOKEN_SEED, { expiresIn: process.env.TOKEN_EXPIREIN });

        return res.json({
            ok: true,
            message: 'Autenticación exitosa',
            userId,
            token
        });


    }).catch(function(err) {

        // catch en produccion
        if (process.env.NODE_ENV !== 'development') err = { hidden: true };

        return res.json({
            ok: false,
            message: 'Error interno al comprobar cuenta.',
            error: err
        });
    });



});

app.get('/login/google', async(req, res) => {

    const url = oauth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',

        // If you only need one scope you can pass it as a string
        scope: scopes
    });
    return res.redirect(url);
});

app.get('/login/google/callback', async(req, res) => {

    try {
        let code = req.query.code;
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        var oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        });


        let { data: googleUser } = await oauth2.userinfo.get();

        // generamos token
        let tokenError = jwt.sign({
            userId: -1
        }, process.env.TOKEN_SEED, { expiresIn: process.env.TOKEN_EXPIREIN });

        if (googleUser === null) {
            return res.redirect(`${process.env.FRONTEND_SERVER}/login?token=${tokenError}`);
        }

        const user = await models.user.findAll({
            attributes: ['email', 'googleAuth', 'id'],
            where: {
                email: {
                    [Op.eq]: googleUser.email
                }
            }
        }).then(function(user) {

            if (user.length === 0)
                return res.redirect(`${process.env.FRONTEND_SERVER}/login?token=${tokenError}`);

            const userId = user[0].id;
            // generamos token
            let tokenSuccess = jwt.sign({
                userId: userId
            }, process.env.TOKEN_SEED, { expiresIn: process.env.TOKEN_EXPIREIN });

            return res.redirect(`${process.env.FRONTEND_SERVER}/login?userId=${userId}&token=${tokenSuccess}`);

        }).catch(e => {
            if (process.env.NODE_ENV !== 'development') e = { hidden: true };
            console.log('Error', e);
        });

    } catch (e) {
        if (process.env.NODE_ENV !== 'development') e = { hidden: true };
        console.log(e)
        return res.redirect(`${process.env.FRONTEND_SERVER}/login`);
    }

});

app.post('/login/verificaToken', (req, res) => {

    let token = req.body.token;
    jwt.verify(token, process.env.TOKEN_SEED, (err, decode) => {

        if (err)
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Invalid token'
                }
            });

        console.log(decode);

        if (decode.userId > 0) {
            return res.json({
                ok: true,
                err: {
                    message: 'valid token'
                },
                info: decode
            });
        }

        return res.status(400).json({
            ok: false,
            err: {
                message: 'Invalid token'
            }
        });

    });

});


module.exports = app;