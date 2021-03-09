var fs = require('fs');
var Controller = require('./Controller.js');
var ejs = require('ejs');

module.exports = class PageController extends Controller {

    static templateView = 'template/landing';

    static isAuthenticated(request) {
        return !(!request.session.userId);
    }

    static render(view, response, viewData, callback) {
        fs.readFile('./application/view/' + this.templateView + '.ejs', 'utf8', (error, templateFileData) => {
            if (templateFileData) {
                fs.readFile('./application/view/' + view + '.ejs', 'utf8', (error, pageFileData) => {
                    if(pageFileData) {
                        response.send(ejs.render(templateFileData, {page: ejs.render(pageFileData, viewData)}));
                    }
                    if (error) {
                        response.send(error);
                    }
                });
            }
            if (error) {
                response.send(error);
            }
            if (callback)
                callback();
        });
    }

};