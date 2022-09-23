console.log("Inititializing config");
var Configurable = require('./system/Configurable.js');
Configurable.initConfig();


setTimeout(() => {
    // init web server
    var WebServer = require('./system/WebServer.js');
    var SocketServer = require('./system/SocketServer.js');
    var Arbitrage = require('./application/model/Arbitrage.js');
    var Bittrex = require('./exchange/bittrex/Bittrex.js');
    var SecurityController = require('./application/controller/SecurityController.js');

    console.log("Initializing webserver");
    WebServer.init();

    console.log("Initializing socketserver");
    SocketServer.init();
    
    console.log("Securing login cookie");
    SecurityController.shakeCookie();
    
    if(Bittrex.config('apikey') && Bittrex.config('apisecret')) {
        Arbitrage.start();
    }
}, 5000);