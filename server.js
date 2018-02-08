const express = require('express');
const app = express();
const bodyParser = require('body-parser'); // recupération des données d'un formulaire (.body)
const api = express.Router();
const auth = express.Router();
const port = 4201;

app.use(bodyParser.json());



api.use('/api/v1',[api, auth]); 

app.listen(port, ()=>{
    console.log(`listening on port ${port}`);
});
