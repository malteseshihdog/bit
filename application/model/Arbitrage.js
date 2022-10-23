var Model = require('../../system/Model.js');

module.exports = class Arbitrage extends Model {



    static initialized = false;

    static async start() {
        if(Arbitrage.initialized === false) {
            Arbitrage.initialized = true;
            console.log('Initializing Arbitrages...');


        }
    }

    /**
     * @deprecated possibly?
     * @returns {unresolved}
     */
    static consoleOutput() {
        return Arbitrage.Route.consoleOutput()
            + Arbitrage.Balance.consoleOutput()
            + Arbitrage.Trade.consoleOutput()
            + Arbitrage.Order.consoleOutput();
    }

};