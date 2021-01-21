require('dotenv').config({
    path: `./env-files/${process.env.NODE_ENV || 'development'}.env`,
});

const express = require('express');
let { verificaToken, backendLoginToDashboard } = require('../middlewares/backend');
const app = express();

const {
    LOGIN_ERROR_GOOGLEAUTH
} = require('../helpers/errors.login');


app.get('/login', [verificaToken, backendLoginToDashboard], async(req, res) => {

    if (req.verificaGoogle) {
        if (!req.verificaGoogleResult)
            req.session.messages = { error: LOGIN_ERROR_GOOGLEAUTH }
    }

    res.render('pages/login', {
        layout: 'auth',
        BACKEND_SERVER: process.env.BACKEND_SERVER
    });

});

app.get('/logout', (req, res) => {

    req.session.destroy(function(err) {
        if (process.env.NODE_ENV !== 'development') err = { hidden: true };

        if (err) return console.log(err);

        return res.redirect('/');
    });

});

app.post('/login/saveToken/:token', (req, res) => {

    let token = req.params.token;
    if (token) {
        req.session.token = token;
        return res.status(200).json({
            ok: true,
            message: 'session saved!'
        });
    }

    return res.status(400).json({
        ok: false,
        message: 'session failed'
    });

});

module.exports = app;