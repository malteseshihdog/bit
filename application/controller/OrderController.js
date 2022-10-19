var SecurityController = require('./SecurityController.js');
var SocketServer = require('../../system/SocketServer.js');
var View = require('../../system/View.js');

module.exports = class OrderController extends SecurityController {

    static Arbitrage = require('../model/Arbitrage.js');

    static async actionCancelAll(uriParts, request, response) {
        if (OrderController.authenticate(uriParts, request, response)) {
            await OrderController.Arbitrage.Order.cancelAll();
        }
        response.redirect('/');
    }

    static actionIndex(uriParts, request, response) {
        View.render('template/base', {socketServerPort: SocketServer.config('port')}, response);
    }

};