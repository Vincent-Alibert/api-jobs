const pool = require('../configuration/db');

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

class Authentification {

    static login(content, cb) {
        if (validateEmail(content.mail)) {
            pool.getConnection(function (err, connection) {
                connection.query('SELECT * FROM user WHERE mailUser = ? AND password = ?', [content.mail, content.password],
                    (error, results) => {
                        if (error) {
                            cb({
                                'status': 'error',
                                'results': 'Une erreur est survenue, Veillez nous excuser pour la gène occaionnée'
                            });
                        } else {
                            if (results.length >= 1) {
                                cb({
                                    'status': 'success',
                                    results
                                });
                            } else {
                                cb({
                                    'status': 'error',
                                    'mailError' : true,
                                    'results': 'Mail ou mot de passe invalide'
                                });
                            }
                        }
                        connection.release();
                    });
            });
        } else {
            cb({
                'status': 'error',
                'mailError' : true,
                'results': 'Email invalide'
            });
        }
    } 
}

module.exports = Authentification;