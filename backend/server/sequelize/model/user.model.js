const { DataTypes } = require('sequelize');

// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = (sequelize) => {
    sequelize.define('user', {
        // The following specification of the 'id' attribute could be omitted
        // since it is the default.
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        email: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        name: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: false
        },
        img: {
            allowNull: true,
            type: DataTypes.STRING,
            unique: false
        },

        password: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: false
        },
        googleAuth: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });
};