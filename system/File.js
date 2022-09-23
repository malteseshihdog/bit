var fs = require('fs');
var mime = require('mime');
var util = require('util');
var Configurable = require('./Configurable.js');

var existsSync = util.promisify(fs.existsSync);
var readFile = util.promisify(fs.readFile);

module.exports = class File extends Configurable {

    static async serve(request, response) {
        var q = request.originalUrl.indexOf('?');
        var filePath = File.getWebDirectory() + request.originalUrl.slice(0, q !== -1 ? q : request.originalUrl.length);
        if (fs.existsSync(filePath) && !fs.lstatSync(filePath).isDirectory()) {
            fs.readFile(filePath, (error, data) => {
                if (error) {
                    console.log(filePath, error);
                } else {
                    response.setHeader("Content-Type", mime.getType(filePath));
                    response.writeHead(200);
                    response.end(data);
                }
            });
            return true;
        }
        return false;
    }

    static getWebDirectory() {
        return File.config('webDirectory');
    }
};