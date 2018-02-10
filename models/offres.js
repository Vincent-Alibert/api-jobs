const pool = require('../configuration/db');

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
}

module.exports = Offres;