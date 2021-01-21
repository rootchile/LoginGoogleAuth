const jwt = require('jsonwebtoken');
// Verificar Token
let verificaToken = (req, res, next) => {

    let token = req.get('token');

    jwt.verify(token, process.env.TOKEN_SEED, (err, decode) => {

        if (err)
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Invalid token'
                }
            });

        req.usuario = decode.usuario;
        next();

    });

}



// Verifica AdminRole

let verificaAdmin = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        return next();
    } else {

        return res.json({
            ok: false,
            err: {
                message: 'Invalid token for admin'
            }
        });
    }

};
//  verificador de tokens por url
let verificaTokenURL = (req, res, next) => {

    let token = req.query.token;

    jwt.verify(token, process.env.TOKEN_SEED, (err, decode) => {

        if (err)
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Invalid token'
                }
            });

        req.usuario = decode.usuario;
        next();

    });

}

module.exports = {
    verificaToken,
    verificaAdmin,
    verificaTokenURL
}