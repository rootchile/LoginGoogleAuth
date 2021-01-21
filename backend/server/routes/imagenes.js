const express = require('express');
const fs = require('fs');
const path = require('path');
let { verificaTokenURL } = require('../middlewares/autenticacion');

let app = express();

app.get('/imagen/:tipo/:img', [verificaTokenURL], (req, res) => {

    let tipo = req.params.tipo;
    let img = req.params.img;

    let noImgPath = path.resolve(__dirname, '../assets/img-404.jpg');


    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImg)) {
        res.sendFile(pathImg);
    } else {
        res.sendFile(noImgPath);
    }

});

module.exports = app;