const mysql = require('mysql2');
var Configurable = require('./Configurable.js');

module.exports = class Database extends Configurable {

    static connection = null;
    
    static init() {
        this.initConfigCallback(Database.connect);
    }
    
    static connect() {
        Database.connection = mysql.createConnection({
            host: Database.config('host'),
            user: Database.config('user'),
            password: Database.config('password'),
            database: Database.config('database')
        });
        
        Database.connection.connect((err) => {
            if(err) throw err;
            console.log('MySQL connected');
        });
    }
    
    static query(query, callback) {
        return Database.connection.query(query, callback);
    }

    
};