const express = require('express')
const session = require('express-session');

const KnexSessionStore = require('connect-session-knex')(session);
const Knex = require('knex');
const app = express();


// Session store
const knex = Knex({
    client: 'mysql',
    connection: {
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
    },
});

const store = new KnexSessionStore({
    knex,
    tablename: 'sessions', // optional. Defaults to 'sessions'
    createtable: true
});

// Use the session middleware
app.use(session({
    store: store,
    secret: process.env.SESSION_SECRET,
    name: process.env.SESSION_COOKIE_NAME,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + parseInt(process.env.COOKIE_EXPIRATION_MS, 10),
        maxAge: parseInt(process.env.COOKIE_EXPIRATION_MS, 10),
    }
}));

module.exports = app;