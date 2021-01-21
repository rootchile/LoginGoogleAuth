const express = require('express');
const app = express();

let { backendDashboardToLogin } = require('../middlewares/backend');

app.get('/dashboard', backendDashboardToLogin, (req, res) => {
    res.render('pages/dashboard', {
        layout: 'dashboard',
        GOOGLE_CLIENTID: process.env.GOOGLE_CLIENTID
    });
});

module.exports = app;