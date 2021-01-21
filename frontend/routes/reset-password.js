const express = require('express');

const app = express();


app.get('/reset-password', (req, res) => {
    res.render('pages/reset-password', {
        layout: 'auth'
    });
});

module.exports = app;