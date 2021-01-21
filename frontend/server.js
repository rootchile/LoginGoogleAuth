require('dotenv').config({
    path: `./env-files/${process.env.NODE_ENV || 'development'}.env`,
});


const express = require('express')
const app = express();
const path = require('path')


const hbs = require('express-handlebars');
const hbshelpers = require('./helpers/hbs')

const indexRouter = require('./routes/index');
const { MemoryStore } = require('express-session');

// const helpers = require('./hbs/helpers/helpers')

app.use(express.static(__dirname + '/public'));

app.use(require('./middlewares/session'));


// Express HBS Engine
app.set('view engine', 'hbs');

app.engine('hbs', hbs({
    extname: 'hbs',
    helpers: require('./helpers/hbs'),
    layoutsDir: path.resolve(__dirname, 'views/layouts/'),
    partialsDir: path.resolve(__dirname, 'views/partials/')
}));

// Middleware para mensajes de error
app.use((req, res, next) => {
    if (req.session) {

        res.locals.messages = req.session.messages;
        res.locals.userInfo = { userId: req.session.userId };
        req.session.messages = {};
    }
    next();
});

app.use('/', indexRouter);

app.listen(process.env.PORT, () => {
    console.log(`Escuchando en el puerto ${ process.env.PORT }`);
});

module.exports = app;