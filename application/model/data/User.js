var Database = require('../../../system/Database.js');

module.exports = class User {

    id = null;
    email = null;
    password = null;

    constructor(fields, result) {
        for(var i in fields) {
            this[fields[i].name] = result[fields[i].name];
        }
    }

    static getById(id, callback) {
        Database.query('SELECT * FROM `user` WHERE `id` = "' + id + '"', (error, results, fields) => {
           if(error) throw error;
           var user = new User(fields, results[0]);
           callback(user);
        });
    }

    static login(username, password, callback) {
        Database.query('SELECT id FROM user WHERE email = "' + username + '" AND password = "' + password + '"', (error, results, fields) => {
            if(error) throw error;
            callback(results && results[0] ? results[0].id : null);
        });
    }

};