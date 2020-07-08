var express = require('express');
var http = require('http');
var https = require('https');
var Configurable = require('./Configurable.js');
var File = require('./File.js');
var Controller = require('./Controller.js');
var fs = require('fs');

module.exports = class WebServer extends Configurable {

    static httpServer;
    static httpsServer;
    static express;
    static sslCert;

    static getFileDirectory() {
        return WebServer.config('fileDirectory');
    }

    static getPort() {
        return WebServer.config('port');
    }
    
    static getHttpsPort() {
        return WebServer.config('httpsPort');
    }

    static getBaseContollerName() {
        return WebServer.config('baseController');
    }

    static getHost() {
        return WebServer.config('host');
    }

    static getProtocol() {
        return WebServer.config('protocol');
    }

    static getKeyAndCert() {
        if (WebServer.config('https')) {
            WebServer.sslCert = {
                key: fs.readFileSync(WebServer.config('keyFile')),
                cert: fs.readFileSync(WebServer.config('certFile'))
            };
        }
    }

    static init() {
        this.initConfigCallback(WebServer.start);
    }

    static start() {
        WebServer.express = express();
        WebServer.httpServer = http.createServer(WebServer.express);
        WebServer.httpServer.listen(WebServer.getPort(), WebServer.onListen);
        
        if (WebServer.config('https')) {
            WebServer.httpsServer = https.createServer(WebServer.express, WebServer.getKeyAndCert());
            WebServer.httpsServer.listen(WebServer.getHttpsPort(), WebServer.getKeyAndCert(), WebServer.onListen);
        }
        
        WebServer.express.use(WebServer.route);
    }

    static route(request, response) {
        if (!Controller.routeAction(request, response)) {
            if (!File.serve(request, response)) {
                response.end('404. You have found the nonexistent page. This page exists but yet it does not. Good luck finding it.');
            }
        }
    }

    static listen() {
        
    }

    static onListen() {
        console.log('Web server avaialbe to serve through port: ' + WebServer.getPort());
    }
};