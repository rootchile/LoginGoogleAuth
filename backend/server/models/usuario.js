const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un role valido'
}
let Schema = mongoose.Schema;



let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'nombre es requerido']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'email requerido']
    },
    password: {
        type: String,
        required: [true, 'password es requerida']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

// validador

usuarioSchema.plugin(uniqueValidator, {
    message: '{PATH} debe ser único'
});


// eliminando el atributo password del usuario
usuarioSchema.methods.toJSON = function() {

    let user = this;
    let userObject = user.toObject();

    delete userObject.password;

    return userObject;
}

module.exports = mongoose.model('Usuario', usuarioSchema);