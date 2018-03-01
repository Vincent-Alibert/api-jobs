const pool = require('../configuration/db');

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
/*html specialchars en js */
function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#039;'
    };
    return text.replace(/[&<>"']/g, function (m) {
        return map[m];
    });
}

class Users {

    static login(content, cb) {

        var mailClean = "";
        var passwordClean = "";

        if (content.emailUser) {
            var mailClean = escapeHtml(content.emailUser.toLowerCase().trim());
        }
        if (content.passwordUser) {
            var passwordClean = escapeHtml(content.passwordUser);
        }

        if (validateEmail(mailClean)) {
            pool.getConnection(function (err, connection) {
                connection.query(`SELECT idUser,nomUser,prenomUser,mailUser,dateInscription,rueUser,codePostalUser,villeUser,nomEnt,latitudeEnt,longitudeEnt,photoUser,imageUser,administrateur,entreprise
                 FROM user 
                 WHERE mailUser = ? 
                 AND password = ?`, [mailClean, passwordClean],
                    (error, results) => {
                        if (error) {
                            cb({
                                'status': 'error',
                                'user': 'Une erreur est survenue, Veillez nous excuser pour la gène occasionnée'
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
                            'user': 'Une erreur est survenue, Veillez nous excuser pour la gène occasionnée'
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

    static addUser(content, cb) {
        var mailClean;
        var status;
        var isFirm;
        var latituteIsFloat;
        var longitudeIsFloat;
        var arrayError = [];

        if (content.user.hasOwnProperty('nomUser') &&
            content.user.hasOwnProperty('prenomUser') &&
            content.user.hasOwnProperty('mailUser') &&
            content.user.hasOwnProperty('passwordUser') &&
            content.user.hasOwnProperty('dateInscription') &&
            content.user.hasOwnProperty('codePostalUser') &&
            content.user.hasOwnProperty('nomEnt') &&
            content.user.hasOwnProperty('latitudeEnt') &&
            content.user.hasOwnProperty('longitudeEnt') &&
            content.user.hasOwnProperty('photoUser') &&
            content.user.hasOwnProperty('imageUser') &&
            content.user.hasOwnProperty('entreprise') &&
            content.user.hasOwnProperty('administrateur')) {

            mailClean = escapeHtml(content.user.mailUser.toLowerCase().trim());
            isFirm = parseInt(content.user.entreprise);
            latituteIsFloat = parseFloat(content.user.latitudeEnt);
            longitudeIsFloat = parseFloat(content.user.longitudeEnt);

            if (isNaN(isFirm)) {
                arrayError.push('dataError');
            }
            if (!validateEmail(mailClean)) {
                arrayError.push('mailUser');
            }
            if (isFirm === 0) {
                for (var prop in content.user) {
                    if (prop === 'nomEnt' || prop === 'latitudeEnt' || prop === 'longitudeEnt') {
                        content.user[prop] = null;
                    }
                    if (content.user[prop] === 'undefined' || content.user[prop] === '') {
                        arrayError.push(prop);
                    }
                }
            } else if (isFirm === 1) {
                if (isNaN(latituteIsFloat) || isNaN(longitudeIsFloat)) {
                    arrayError.push('coordoneeGeoError');
                }
                for (var prop in content.user) {
                    if (content.user[prop] === 'undefined' || content.user[prop] === '' || content.user[prop] === null) {
                        arrayError.push(prop);
                    }
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
                connection.query(`INSERT INTO user(idUser, nomUser, prenomUser, mailUser, password, dateInscription, rueUser, codePostalUser, villeUser, nomEnt, latitudeEnt, longitudeEnt, photoUser, imageUser, administrateur, entreprise) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [null,
                    content.user.nomUser,
                    content.user.prenomUser,
                    content.user.mailUser,
                    content.user.passwordUser,
                    content.user.dateInscription,
                    content.user.rueUser,
                    content.user.codePostalUser,
                    content.user.villeUser,
                    content.user.nomEnt,
                    content.user.latitudeEnt,
                    content.user.longitudeEnt,
                    content.user.photoUser,
                    content.user.imageUser,
                    content.user.administrateur,
                    content.user.entreprise
                ],
                    (error, results) => {
                        if (error) {
                            console.log('error', error);
                            status = 'errors';
                            arrayError.push('queryFailed');
                            cb({
                                status: status,
                                arrayError
                            });
                        } else {
                            console.log('result', results);
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

module.exports = Users;