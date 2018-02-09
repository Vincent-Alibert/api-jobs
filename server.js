const express = require('express');
const app = express();
const bodyParser = require('body-parser'); // recupération des données d'un formulaire (.body)
const api = express.Router();
const auth = express.Router();
const port = 4201;
const secret = require('./configuration/secret');

const authentification = require('./models/authentification');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
})); // permet de récupérer les données en post pour header Content-Type : "application/x-www-form-urlencoded";

api.post('/login', (request, response) => {

    //console.log('request', request);
    //console.log('response', response);

    authentification.login(request.body, (result) => {
        console.log(result.status);

        if(result.status === 'success') {
            console.log('success !!!!!');
            response.json(result);
        }else{
            response.json(result);
        }
        
    });
});

app.use('/api/v1', [api, auth]);

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});