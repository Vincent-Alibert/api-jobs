const pool = require('../configuration/db');

function validateDate(date) {
    var re = /(asap)|((0[1-9]|[1-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/[0-9]{4})/;
    return re.test(String(date).toLowerCase());
}

class Offres {
    static getAll(cb) {
        pool.getConnection(function (err, connection) {
            connection.query(`SELECT titreOffre, datePublication, dateDebutPoste, introduction, description, latitude, longitude, rueOffre, codePostalOffre, villeOffre, salaireOffre, idOffre, mailUser 
            FROM offre 
            INNER JOIN user
            ON fk_idUser = idUser
            ORDER BY datePublication DESC
                 `, (error, results) => {
                    if (error) {
                        cb({
                            'status': 'error',
                            'offre': 'Une erreur est survenue, Veillez nous excuser pour la gène occasionnée'
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
                connection.query(`SELECT titreOffre, datePublication, dateDebutPoste, introduction, description, latitude, longitude, rueOffre, codePostalOffre, villeOffre, salaireOffre, idOffre, mailUser 
                FROM offre 
                INNER JOIN user
                ON fk_idUser = idUser
                WHERE idOffre = ?`, [idOffre], (error, results) => {
                        if (error) {
                            cb({
                                'status': 'error',
                                'offre': 'Une erreur est survenue, Veillez nous excuser pour la gène occasionnée'
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
                'offre': 'Une erreur est survenue, Veillez nous excuser pour la gène occasionnée'
            });
        }
    }

    static getOffresByIdUser(idUser, cb) {

        var id = parseInt(idUser);
        if (Number.isInteger(id)) {
            pool.getConnection(function (err, connection) {
                connection.query(`SELECT titreOffre, datePublication, dateDebutPoste, introduction, description, latitude, longitude, rueOffre, codePostalOffre, villeOffre, salaireOffre, idOffre, mailUser 
                FROM offre 
                INNER JOIN user
                ON fk_idUser = idUser
                WHERE fk_idUser = ?
                ORDER BY datePublication DESC`, [idUser], (error, results) => {
                        if (error) {
                            cb({
                                'status': 'error',
                                'offre': 'Une erreur est survenue, Veillez nous excuser pour la gène occasionnée'
                            });
                        } else {
                            if (results.length >= 1) {
                                cb({
                                    'status': 'success',
                                    'offre': results
                                });
                            } else {
                                cb({
                                    'status': 'error',
                                    'idUser': true,
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
                'offre': 'Une erreur est survenue, Veillez nous excuser pour la gène occasionnée'
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

            if (datePublicationOk.toString() === 'Invalid Date') {
                arrayError.push('datePublication');
            }

            if (!validateDate(content.offre.dateDebutPoste)) {
                arrayError.push('dateDebutPoste');
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
    static deleteOffre(content, cb) {
        var id = parseInt(content.idOffre)
        if (Number.isInteger(id)) {
            pool.getConnection(function (err, connection) {
                connection.query(`DELETE FROM offre where idOffre = ?`, [id],
                    (error, results) => {
                        if (error) {
                            cb({
                                'status': 'error',
                                'offre': 'Erreur durant la requete. Veillez nous excuser'
                            });
                        }
                    });
            });
            pool.getConnection(function (err, connection) {
                connection.query(`DELETE FROM candidature where fk_idOffre = ?`, [id],
                    (error, results) => {
                        if (error) {
                            cb({
                                'status': 'error',
                                'offre': 'Erreur durant la requete. Veillez nous excuser'
                            });
                        } else {
                            cb({
                                'status': 'success'
                            });
                        }
                        connection.release();
                    });
            });
        } else {
            cb({
                'status': 'error',
                'offre': 'Une erreur est survenue, Veillez nous excuser pour la gène occasionnée'
            });
        }
    }

    /* partie concernant les candidatures */
    static getOffreByCandidatureId(idUser, cb) {
        var id = parseInt(idUser);

        if (Number.isInteger(id)) {
            pool.getConnection(function (err, connection) {
                connection.query(`SELECT * FROM offre 
                INNER JOIN candidature 
                ON fk_idOffre = idOffre 
                WHERE candidature.fk_idUser = ?`, [id], (error, results) => {
                        if (error) {
                            cb({
                                'status': 'error',
                                'candidature': 'Une erreur est survenue, Veillez nous excuser pour la gène occasionnée'
                            });
                        } else {
                            if (results.length > 0) {
                                cb({
                                    'status': 'success',
                                    'candidature': results
                                });
                            } else {
                                cb({
                                    'status': 'error',
                                    'idError': true,
                                    'candidature': 'Cet utilisateur n\'a pas de candidature'
                                });
                            }
                        }
                        connection.release();
                    });
            });
        } else {
            cb({
                'status': 'error',
                'candidature': 'Une erreur est survenue, Veillez nous excuser pour la gène occasionnée'
            });
        }
    }

    static getCandidatureByIdFirm(idFirm, cb) {
        var id = parseInt(idFirm);
        if (Number.isInteger(id)) {
            pool.getConnection(function (err, connection) {
                connection.query(`SELECT user.idUser, user.nomUser, user.prenomUser, user.mailUser, offre.idOffre, offre.titreOffre 
                FROM offre 
                INNER JOIN candidature
                ON candidature.fk_idOffre = offre.idOffre
                INNER JOIN user
                ON user.idUser = candidature.fk_idUser
                WHERE offre.fk_idUser = ?
                ORDER BY offre.idOffre`, [id], (error, results) => {
                        if (error) {
                            cb({
                                'status': 'error',
                                'candidature': 'Une erreur est survenue, Veillez nous excuser pour la gène occasionnée'
                            });
                        } else {
                            if (results.length > 0) {
                                cb({
                                    'status': 'success',
                                    'candidature': results
                                });
                            } else {
                                cb({
                                    'status': 'error',
                                    'idError': true,
                                    'candidature': 'Cet utilisateur n\'a pas reussi de candidature'
                                });
                            }
                        }
                        connection.release();
                    });
            });
        } else {
            cb({
                'status': 'error',
                'candidature': 'Une erreur est survenue, Veillez nous excuser pour la gène occasionnée'
            });
        }
    }

    static selectionOffre(idUser, idOffre, cb) {
        var idUserClean = parseInt(idUser);
        var idOffreClean = parseInt(idOffre);

        if (Number.isInteger(idUserClean) && Number.isInteger(idOffreClean)) {
            pool.getConnection(function (err, connection) {
                connection.query(`INSERT INTO candidature (fk_idUser, fk_idOffre, dateCandidature) VALUES (?,?, NOW() ) `, [idUserClean, idOffreClean], (error, results) => {
                    if (error) {
                        cb({
                            'status': 'error',
                            'candidature': 'Une erreur est survenue, Veillez nous excuser pour la gène occasionnée'
                        });
                    } else {
                        cb({
                            'status': 'success',
                        });
                    }
                    connection.release();
                });
            });
        } else {
            cb({
                'status': 'error',
                'candidature': 'L\'utilisateur ou l\'offre n\'existe pas.'
            });
        }
    }

    static unSelectionOffre(idUser, idOffre, cb) {
        var idUserClean = parseInt(idUser);
        var idOffreClean = parseInt(idOffre);

        if (Number.isInteger(idUserClean) && Number.isInteger(idOffreClean)) {
            pool.getConnection(function (err, connection) {
                connection.query(`DELETE FROM candidature WHERE fk_idUser = ? AND fk_idOffre = ?`, [idUserClean, idOffreClean], (error, results) => {
                    if (error) {
                        cb({
                            'status': 'error',
                            'candidature': 'Une erreur est survenue, Veillez nous excuser pour la gène occasionnée'
                        });
                    } else {
                        cb({
                            'status': 'success',
                        });
                    }
                    connection.release();
                });
            });
        } else {
            cb({
                'status': 'error',
                'candidature': 'L\'utilisateur ou l\'offre n\'existe pas.'
            });
        }
    }

}

module.exports = Offres;