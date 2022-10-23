var HasExchange = require('./HasExchange.js');
var Bittrex = require('../../exchange/bittrex/Bittrex.js');

module.exports = class OrderBook extends HasExchange  {

    market = null;
    ask = 0;
    bid = 0;
    getting = false;
    interval = null;
    socket = null;
    static nextIndex = 0;
    static list = [];
    
    /**
     * 
     * @param {Market} market
     * @param {Exchange} exchange
     * @returns {OrderBook}
     */
    constructor(market, exchange) {
        super(exchange);
        this.market = market;
        OrderBook.list.push(this);
        return this;
    }

    static async init() {
        console.log('Inititialize OrderBook...');
    }
    

    update(ask,bid,last) {
        this.ask = ask;
        this.bid = bid;
        this.last = last;
        this.triggerRoutes();
    }

    Ask() {
        return Number(this.ask);
    }
    
    Bid() {
        return Number(this.bid);
    }
    
    Last() {
        return Number(this.last);
    }

    triggerRoutes() {
        this.market.triggerRoutes();
    }

};