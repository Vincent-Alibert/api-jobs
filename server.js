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

const checkUserToken = (req, res, next) => {
    if (!req.header('authorization')) {
        return res.status(401).json({
            status: 'error'
        });
    }

    const authorizationParts = req.header('authorization').split(' ');

    let token = authorizationParts[1];

    const decodeToken = jwt.verify(token, secret, (error, decodeToken) => {
        if (error) {
            return res.status(401).json({
                status: 'error'
            });
        } else {
            next();
        }
    });

}

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
})); // permet de récupérer les données en post pour header Content-Type : "application/x-www-form-urlencoded";

app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Headers', 'Content-type, Authorization');
    next();
});

auth.post('/login', (request, response) => {

    if (request.body) {
        users.login(request.body, (result) => {
            if (result.status === 'success') {
                // const token = jwt.sign({
                //     iss: 'http//localhost:4201',
                //     auth: true,
                //     value: result
                // }, secret, {
                //         expiresIn: '1h'
                //     });
                const token = jwt.sign({
                    iss: 'http//localhost:4201',
                    auth: true,
                    value: result
                }, secret);
                response.json({
                    token,
                });
            } else {
                response.status(401).json({
                    'result': result
                });
            }
        });
    } else {
        response.status(500).json({
            'status': 'error',
            'user': 'Données manquantes'
        })
    }

});

api.post('/users/add', (request, response) => {

    if (request.body) {
        users.addUser(request.body, (result) => {
            if (result.status === 'success') {
                response.json({
                    result
                });
            } else {
                response.json({
                    result
                });
            }
        });
    } else {
        response.status(500).json({
            'status': 'error',
            'user': 'Données manquantes'
        });
    }
})

api.get('/users/count-data', checkUserToken, (request, response) => {

    if (request.body) {
        users.getCountData((result) => {
            if (result.status === 'success') {
                response.json({result});
            } else {
                response.json({result});
            }
        });
    } else {
        response.status(500).json({
            'status': 'error',
            'offre': 'Données manquantes'
        });
    }
})

api.get('/users/:id', checkUserToken, (request, response) => {

    users.getUserById(request.params.id, (userDetails) => {
        response.json(userDetails);
    });
});

api.get('/users', checkUserToken,(request, response) => {
    users.getAll((listUsers) => {
        response.json(listUsers);
    });
});

api.get('/public/images/fond/:name', (request, response) => {

    var options = {
        root: __dirname + '/public/images/fond/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
      };
    
      var fileName = request.params.name;
      response.sendFile(fileName, options, function (err) {
        if (err) {
            response.status(404).json({
                'status': 'error',
                'data': 'image not found'
            });
        }
      });
});

api.get('/public/images/profil/:name', (request, response) => {

    var options = {
        root: __dirname + '/public/images/profil/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
      };
    
      var fileName = request.params.name;
      response.sendFile(fileName, options, function (err) {
        if (err) {
            response.status(404).json({
                'status': 'error',
                'data': 'image not found'
            });
        } else {
          console.log('Sent:', fileName);
        }
      });

});

api.post('/offres/add', checkUserToken, (request, response) => {

    if (request.body) {
        offres.addOffre(request.body, (result) => {
            if (result.status === 'success') {
                response.json({
                    result
                });
            } else {
                response.json({
                    result
                });
            }
        });
    } else {
        response.status(500).json({
            'status': 'error',
            'offre': 'Données manquantes'
        });
    }
})

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