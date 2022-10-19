var ExchangeModel = require('../../system/ExchangeModel.js');
var Security = require('../../system/Security.js');

module.exports = class User extends ExchangeModel {
    
    static authenticate(password) {
        return User.config('password') === Security.hash(password);
    }
    
};