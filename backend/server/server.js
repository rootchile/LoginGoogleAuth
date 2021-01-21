// require('./config/config');
require('dotenv').config({
    path: `./env-files/${process.env.NODE_ENV || 'development'}.env`,
});

const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const sequelize = require('./sequelize');

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


// parser application/x-www-form-urlencode
app.use(bodyParser.urlencoded({ extended: true }));

// parser application/json
app.use(bodyParser.json());

// habilitar /public
const path_public = path.resolve(__dirname, '../public');
app.use(express.static(path_public));
// config global de rutas
app.use(require('./routes/index'));

async function assertDatabaseConnectionOk() {
    console.log(`Checking database connection...`);
    try {
        await sequelize.authenticate();
        console.log('Database connection OK!');
    } catch (error) {
        console.log('Unable to connect to the database:');
        console.log(error.message);
        process.exit(1);
    }
}

async function init() {
    await assertDatabaseConnectionOk();

    app.listen(process.env.PORT, () => {
        console.log(` Listening port ${process.env.PORT}.`);
    });
}

init();