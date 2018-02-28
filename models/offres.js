const pool = require('../configuration/db');

function validateDate(date) {
    var re = /(asap)|([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
    return re.test(String(date).toLowerCase());
}

class Offres {
    static getAll(cb) {
        pool.getConnection(function (err, connection) {
            connection.query(`SELECT * FROM offre 
                 `, (error, results) => {
                    if (error) {
                        cb({
                            'status': 'error',
                            'offre': 'Une erreur est survenue, Veillez nous excuser pour la gène occaionnée'
                        });
                    } else {
                        cb({
                            'status': 'success',
                            'offre': results
                        });
                    }
                    connection.release();
                });

        });
    }

    static getOffresById(idOffre, cb) {
        var id = parseInt(idOffre);
        if (Number.isInteger(id)) {
            pool.getConnection(function (err, connection) {
                connection.query(`SELECT * 
            FROM offre
            WHERE idOffre = ?`, [idOffre], (error, results) => {
                        if (error) {
                            cb({
                                'status': 'error',
                                'offre': 'Une erreur est survenue, Veillez nous excuser pour la gène occaionnée'
                            });
                        } else {
                            if (results.length === 1) {
                                cb({
                                    'status': 'success',
                                    'offre': results
                                });
                            } else {
                                cb({
                                    'status': 'error',
                                    'idError': true,
                                    'offre': 'Cette offre n\'existe pas '
                                });
                            }
                        }
                        connection.release();
                    });

            });
        } else {
            cb({
                'status': 'error',
                'offre': 'Une erreur est survenue, Veillez nous excuser pour la gène occaionnée'
            });
        }
    }

    static addOffre(content, cb) {

        var status;
        var latituteIsFloat;
        var longitudeIsFloat;
        var arrayError = [];
        var dateDebutPosteOk;
        var datePublicationOk;

        console.log('content', content);

        if (content.offre.hasOwnProperty('titreOffre') &&
            content.offre.hasOwnProperty('datePublication') &&
            content.offre.hasOwnProperty('dateDebutPoste') &&
            content.offre.hasOwnProperty('introduction') &&
            content.offre.hasOwnProperty('description') &&
            content.offre.hasOwnProperty('latitude') &&
            content.offre.hasOwnProperty('longitude') &&
            content.offre.hasOwnProperty('rueOffre') &&
            content.offre.hasOwnProperty('codePostalOffre') &&
            content.offre.hasOwnProperty('villeOffre') &&
            content.offre.hasOwnProperty('salaireOffre') &&
            content.offre.hasOwnProperty('fk_idUser')) {

            latituteIsFloat = parseFloat(content.offre.latitude);
            longitudeIsFloat = parseFloat(content.offre.longitude);
            datePublicationOk = new Date(content.offre.datePublication);

            console.log('datePublicationOk',datePublicationOk.toString());

            if (datePublicationOk.toString() === 'Invalid Date'){
                arrayError.push('DateError');
            }
           
            if(!validateDate(content.offre.dateDebutPoste)) {
                arrayError.push('DateError');
            }

            if (isNaN(latituteIsFloat) || isNaN(longitudeIsFloat)) {
                arrayError.push('coordoneeGeoError');
            }
            for (var prop in content.offre) {
                if (content.offre[prop] === 'undefined' || content.offre[prop] === '' || content.offre[prop] === null) {
                    arrayError.push(prop);
                }
            }

        } else {
            arrayError.push('dataMissing');
        }
        if (arrayError.length > 0) {
            status = 'errors';
            cb({
                status: status,
                arrayError
            });
        } else {
            pool.getConnection(function (err, connection) {
                connection.query(`INSERT INTO offre(idOffre, titreOffre, datePublication, dateDebutPoste, introduction, description, latitude, longitude, rueOffre, codePostalOffre, villeOffre, salaireOffre, fk_idUser) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, [null,
                    content.offre.titreOffre,
                    content.offre.datePublication,
                    content.offre.dateDebutPoste,
                    content.offre.introduction,
                    content.offre.description,
                    content.offre.latitude,
                    content.offre.longitude,
                    content.offre.rueOffre,
                    content.offre.codePostalOffre,
                    content.offre.villeOffre,
                    content.offre.salaireOffre,
                    content.offre.fk_idUser
                ],
                    (error, results) => {
                        if (error) {
                            status = 'errors';
                            arrayError.push('queryFailed');
                            cb({
                                status: status,
                                arrayError
                            });
                        } else {
                            status = 'success';
                            cb({
                                status: status,
                                arrayError
                            });
                        }
                        connection.release();
                    });
            });
        }
    }
}

module.exports = Offres;