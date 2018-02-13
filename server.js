const express = require('express');
const app = express();
const bodyParser = require('body-parser'); // recupération des données d'un formulaire (.body)

const jwt = require('jsonwebtoken');
const api = express.Router();
const auth = express.Router();
const port = 4201;
const secret = require('./configuration/secret');

const users = require('./models/users');
const offres = require('./models/offres');

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
})); // permet de récupérer les données en post pour header Content-Type : "application/x-www-form-urlencoded";

app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Headers', 'Content-type');
    next();
});

auth.post('/login', (request, response) => {

    if (request.body) {
        users.login(request.body, (result) => {
            if (result.status === 'success') {
                const token = jwt.sign({
                    iss: 'http//localhost:4201',
                    auth: true
                }, secret, {
                    expiresIn: '1h'
                });
                response.json({
                    token,
                    result
                });
            } else {
                response.json({'result': result});
            }
        });
    } else {
        res.json({
            'status': 'error',
            'user': 'Données manquantes'
        })
    }

});

api.get('/users', (request, response) => {
    users.getAll((listUsers) => {
        response.json(listUsers);
    });
});


api.get('/offres/:id', (request, response) => {

    offres.getOffresById(request.params.id, (listOffres) => {
        response.json(listOffres);
    });
});

api.get('/offres', (request, response) => {
    offres.getAll((listOffres) => {
        response.json(listOffres);
    });
});

app.use('/api/v1', [api, auth]);

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});