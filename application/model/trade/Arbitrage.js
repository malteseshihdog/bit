var Model = require('../../../system/Model.js');


module.exports = class Arbitrage extends Model {

    static Currency = require('./Currency.js');
    static Market = require('./Market.js');
    static OrderBook = require('./OrderBook.js');
    static Balance = require('./Balance.js');
    static Route = require('./Route.js');
    static Trade = require('./Trade.js');
    static Order = require('./Order.js');

    static initialized = false;

    static async start() {
        if(Arbitrage.initialized === false) {
            Arbitrage.initialized = true;
            console.log('Initializing Arbitrages...');

            setTimeout(function(){
                Arbitrage.Currency.init();
                
            }, 500);
            setTimeout(function(){
                Arbitrage.Market.init();
                
            }, 1000);
            
//            await Arbitrage.OrderBook.init();
         //   await Arbitrage.Balance.init();
//            await Arbitrage.Order.init();

//            setTimeout(() => {
//                console.log('Initializing Routes...');
//                Arbitrage.Route.init();
//            }, 5000);
        }
    }

    static consoleOutput() {
        return Arbitrage.Route.consoleOutput()
            + Arbitrage.Balance.consoleOutput()
            + Arbitrage.Trade.consoleOutput()
            + Arbitrage.Order.consoleOutput();
    }

    static stop() {
        // todo
    }

};