const express = require('express');
const app = express();


app.get('/', (req, res) => {
    res.redirect('/login');
});

app.use(require('./login'));
app.use(require('./reset-password'));
app.use(require('./dashboard'));

module.exports = app;