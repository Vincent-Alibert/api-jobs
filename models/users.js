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

        var mailClean ="";
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
}

module.exports = Users;