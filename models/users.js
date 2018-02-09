const pool = require('../configuration/db');

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

class Users {

    static login(content, cb) {
        if (validateEmail(content.mail)) {
            pool.getConnection(function (err, connection) {
                connection.query(`SELECT nomUser,prenomUser,mailUser,dateInscription,rueUser,codePostalUser,villeUser,nomEnt,latitudeEnt,longitudeEnt,photoUser,imageUser,administrateur,entreprise
                 FROM user 
                 WHERE mailUser = ? 
                 AND password = ?`, [content.mail, content.password],
                    (error, results) => {
                        if (error) {
                            cb({
                                'status': 'error',
                                'user': 'Une erreur est survenue, Veillez nous excuser pour la gène occaionnée'
                            });
                        } else {
                            if (results.length === 1) {
                                cb({
                                    'status': 'success',
                                    'user': results
                                });
                            } else {
                                cb({
                                    'status': 'error',
                                    'mailError': true,
                                    'user': 'Mail ou mot de passe invalide'
                                });
                            }
                        }
                        connection.release();
                    });
            });
        } else {
            cb({
                'status': 'error',
                'mailError': true,
                'user': 'Email invalide'
            });
        }
    }

    static getAll(cb) {
        pool.getConnection(function (err, connection) {
            connection.query(`SELECT nomUser,prenomUser,mailUser,dateInscription,rueUser,codePostalUser,villeUser,nomEnt,latitudeEnt,longitudeEnt,photoUser,imageUser,administrateur,entreprise
                 FROM user 
                 `, (error, results) => {
                if (error) {
                    cb({
                        'status': 'error',
                        'user': 'Une erreur est survenue, Veillez nous excuser pour la gène occaionnée'
                    });
                } else {
                    cb({
                        'status': 'success',
                        'user': results
                    });
                }
                connection.release();
            });

        });
    }
}

module.exports = Users;