var PageController = require('../../system/PageController.js');
var User = require('../model/data/User.js');

module.exports = class AccountController extends PageController {

    static actionIndex(uriParts, request, response) {
        
        if (request.session.userId) {
            var _this = this;
            User.getById(request.session.userId, (user) => {
                AccountController.templateView = 'template/base';
                _this.render('account/dashboard', response, {user: user});
            });
        } else {
            AccountController.templateView = 'template/landing';
            this.render('account/login', response, {loginError: false});
        }
    }

    static actionLogin(uriParts, request, response) {

        var username = request.body.username || null;
        var password = request.body.password || null;
        var _this = this;
        
        if (username && password) {
            User.login(username, password, (userId) => {
                if (userId) {
                    request.session.userId = userId;
                    response.redirect('/account/index');
                } else {
            AccountController.templateView = 'template/landing';
                    _this.render('account/login', response, {loginError: true});
                }
            });
        } else {
            AccountController.templateView = 'template/landing';
            _this.render('account/login', response, {loginError: false});
        }
    }
};