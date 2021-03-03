var PageController = require('../../system/PageController.js');

module.exports = class LandingController extends PageController {

    static actionIndex(uriParts, request, response) {
        this.render('landing/index', response);
    }

    static actionLogin(uriParts, request, response) {
        console.log(request.body);
        this.render('template/base', response);
    }
};