const express = require('express');
const app = express();
const bodyParser = require('body-parser'); // recupération des données d'un formulaire (.body)
const multerCv = require('multer');
const multerPhoto = require('multer');
const multerImg = require('multer');

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

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", 'http://localhost:4200');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", true);
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

/* route fichiers */
// photo 
const storePhoto = multerPhoto.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/photo')
    },
    filename: function (req, file, cb) {
        console.log('file', file);
        cb(null, file.originalname);
    }
});
const uploadPhoto = multerPhoto({storage: storePhoto}).single('file');

api.post('/upload/photo', (req, res, next) => {
    uploadPhoto(req, res, (err) => {
        if (err) {
            return res.status(501).json({
                'typeError': 'photo',
                'fileError': true
            });
        }
        return res.status(200).json({'originalname':req.file.originalname, 'uploadname': req.file.filename, 'fileError': false});  
    })
});

// bg
const storeImg = multerImg.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/img')
    },
    filename: function (req, file, cb) {
        
        cb(null, file.originalname);
    }
});
const uploadImg = multerImg({storage: storeImg}).single('file');

api.post('/upload/img', (req, res, next) => {
    uploadImg(req, res, (err) => {
        if (err) {       
            return res.status(501).json({
                'typeError': 'img',
                'fileError': true
            });
        }
        return res.status(200).json({'originalname':req.file.originalname, 'uploadname': req.file.filename, 'fileError': false});  
    })
});

// cv
const storeCv = multerCv.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/cv')
    },
    filename: function (req, file, cb) {
    cb(null, file.originalname);
    }
});
const uploadCv = multerCv({storage: storeCv}).single('file');

api.post('/upload/cv', (req, res, next) => {
    uploadCv(req, res, (err) => {
        if (err) {                        
            return res.status(501).json({
                'typeError': 'cv',
                'fileError': true
            });
        }
        return res.status(200).json({'originalname':req.file.originalname, 'uploadname': req.file.filename, 'fileError': false});  
    })
});

/* Route pour les users */
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

api.get('/users/:id', checkUserToken, (request, response) => {

    users.getUserById(request.params.id, (userDetails) => {
        response.json(userDetails);
    });
});

api.get('/users', checkUserToken, (request, response) => {
    users.getAll((listUsers) => {
        response.json(listUsers);
    });
});


/* Route pour les images */
api.get('/public/uploads/img/:name', (request, response) => {

    var options = {
        root: __dirname + '/public/uploads/img/',
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

api.get('/public/uploads/photo/:name', (request, response) => {

    var options = {
        root: __dirname + '/public/uploads/photo/',
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

/* Route pour les offres */
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

api.post('/offres/delete', (request, response) => {
    if (request.body) {
        offres.deleteOffre(request.body, (result) => {
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


api.get('/offres/details/:id', (request, response) => {
    offres.getOffresById(request.params.id, (listOffres) => {
        response.json(listOffres);
    });
});

api.get('/offres/user/:id', (request, response) => {
    offres.getOffresByIdUser(request.params.id, (listOffres) => {
        response.json(listOffres);
    });
});

api.get('/offres', (request, response) => {
    offres.getAll((listOffres) => {
        response.json(listOffres);
    });
});

/* route candidature */
api.get('/candidatures/:idUser/select/:idOffre', (req, res) => {
    offres.selectionOffre(req.params.idUser, req.params.idOffre, (data) => {
        res.json(data);
    })
});

api.get('/candidatures/:idUser/unselect/:idOffre', (req, res) => {
    offres.unSelectionOffre(req.params.idUser, req.params.idOffre, (data) => {
        res.json(data);
    })
});

api.get('/candidatures/:id', (req, res) => {
    offres.getOffreByCandidatureId(req.params.id, (listePostesSelectionnes) => {
        res.json(listePostesSelectionnes);
    })
});

api.get('/candidatures/firm/:id', (req, res) => {
    offres.getCandidatureByIdFirm(req.params.id, (listeCandidature) => {
        res.json(listeCandidature);
    })
});

/* général */

app.use('/api/v1', [api, auth]);

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});