// require('./config/config');
require('dotenv').config({
    path: `./env-files/${process.env.NODE_ENV || 'development'}.env`,
});

const { Sequelize } = require('sequelize');

// In a real app, you should keep the database connection URL as an environment variable.
// But for this example, we will just use a local SQLite database.
// const sequelize = new Sequelize(process.env.DB_CONNECTION_URL);
const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
    host: process.env.DATABASE_HOST,
    dialect: 'mysql'
});

const modelDefiners = [
    require('./model/user.model'),
    // Add more models here...
    // require('./models/item'),
];

// We define all models according to their files.
for (const modelDefiner of modelDefiners) {
    modelDefiner(sequelize);
}

// Create tables
async function createTables() {
    console.log('Revisando modelos en la db');

    await sequelize.sync({ force: false });

    console.log('todo ok!');
}

createTables();

// We export the sequelize connection instance to be used around our app.
module.exports = sequelize;