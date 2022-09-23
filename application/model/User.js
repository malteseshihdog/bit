var Model = require('../../system/Model.js');
var Security = require('../../system/Security.js');

module.exports = class User extends Model {
    
    static authenticate(password) {
        return User.config('password') === Security.hash(password);
    }
    
};