const axios = require('axios');

let verificaToken = async(req, res, next) => {

    if (req.query.token) {
        req.verificaGoogle = true;

        axios.post(`${process.env.BACKEND_SERVER}/login/verificaToken`, {
                token: req.query.token
            })
            .then((response) => {

                if (response.data.ok) {
                    req.verificaGoogleResult = true;
                    req.session.token = req.query.token;
                    req.session.userId = response.data.info.userId;
                } else {
                    req.verificaGoogleResult = false;
                    req.session.userId = {};
                }
                return next();
            }, (error) => {
                if (process.env.NODE_ENV !== 'development') error = { hidden: true };
                console.log(`Error `, error);
                return next();
            });

    } else {
        return next();
    }

}


let backendLoginToDashboard = async(req, res, next) => {

    const token = req.session.token;

    if (token) {

        axios.post(`${process.env.BACKEND_SERVER}/login/verificaToken`, {
                token: token
            })
            .then((response) => {
                if (response.data.ok) {
                    return res.redirect('/dashboard');
                } else {
                    return next();
                }

            }, (error) => {
                if (process.env.NODE_ENV !== 'development') error = { hidden: true };
                console.log(`Error `, error);
            });

    } else {
        return next();
    }

}

let backendDashboardToLogin = async(req, res, next) => {

    const token = req.session.token;

    if (token) {
        axios.post(`${process.env.BACKEND_SERVER}/login/VerificaToken`, {
                token: token
            })
            .then((response) => {
                if (response.data.ok) {
                    return next();
                } else {
                    return res.redirect('/login');
                }

            }, (error) => {
                if (process.env.NODE_ENV !== 'development') error = { hidden: true };
                console.log(`Error  `, error);
            });

    } else {
        return res.redirect('/login');
    }

}

module.exports = {
    backendLoginToDashboard,
    backendDashboardToLogin,
    verificaToken
}