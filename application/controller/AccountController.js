var PageController = require('../../system/PageController.js');

module.exports = class AccountController extends PageController {

    static actionIndex(uriParts, request, response) {
        this.render('template/base', response);
    }

    static actionLogin(uriParts, request, response) {
    }
};