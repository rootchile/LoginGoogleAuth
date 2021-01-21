// process corre siempre en Node

// Puerto, si es que no existe
process.env.PORT = process.env.PORT || 3000


// Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


// Expiracion token

process.env.TOKEN_EXPIREIN = 60 * 60 * 60 * 24 * 30;

// Seed Token
process.env.TOKEN_SEED = process.env.TOKEN_SEED || 'seed-dev';

// Google OAuth ID
process.env.GOOGLE_CLIENTID = process.env.GOOGLE_CLIENTID || '1078069135894-dm50qe6krpl3q1ii59gf3d1m1imvurpe.apps.googleusercontent.com';


// BD

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}


process.env.URLDB = urlDB;