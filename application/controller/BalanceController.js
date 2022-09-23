var Controller = require('../../system/Controller.js');

module.exports = class BalanceController extends Controller {

    static Arbitrage = require('../model/Arbitrage.js');

    static async actionIndex(uriParts, request, response) {
        response.send(await BalanceController.Arbitrage.consoleOutput());
    }
    

};