var SecurityController = require('./SecurityController.js');
var View = require('../../system/View.js');

module.exports = class ArbitrageController extends SecurityController {

    static Arbitrage = require('../model/Arbitrage.js');

    static async actionIndex(uriParts, request, response) {
        if (ArbitrageController.authenticate(uriParts, request, response)) {
            response.send(await ArbitrageController.Arbitrage.consoleOutput());
        } else {
            response.redirect('/');
        }
    }

    static async socketIndex(socket, packet) {
        var _socket = socket;
        setInterval(() => {
            _socket.emit('arbitrage', JSON.stringify({
                routes: ArbitrageController.Arbitrage.Route.consoleOutput(),
                balances: ArbitrageController.Arbitrage.Balance.consoleOutput(),
                trades: ArbitrageController.Arbitrage.Trade.consoleOutput(),
                orders: ArbitrageController.Arbitrage.Order.consoleOutput(),
            }));
        }, ArbitrageController.config('socketInterval'));
    }

    static actionArbitrage(uriParts, request, response) {
        if (ArbitrageController.authenticate(uriParts, request, response)) {
            if (!ArbitrageController.Arbitrage.initialized) {
                ArbitrageController.Arbitrage.start();
            }
            console.log("Request abritrage...");
            View.render('template/tabs', {}, response);
        } else {
            ArbitrageController.actionLogin(uriParts, request, response);
        }
    }

};