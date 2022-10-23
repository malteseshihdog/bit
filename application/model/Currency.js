var HasExchange = require('./HasExchange.js');
var Bittrex = require('../../exchange/bittrex/Bittrex.js');

module.exports = class Currency extends HasExchange {

    /**
     * @property {String} symbol 
     */
    symbol = null;

    /**
     * @property {String} name 
     */
    name = null;

    /**
     * @property {String} coinType 
     */
    coinType = null;

    /**
     * @property {String} status 
     */
    status = null;

    /**
     * @property {Number} status 
     */
    minConfirmations = null;

    /**
     * @property {String} status 
     */
    notice = null;

    /**
     * @property {Number} txFee 
     */
    txFee = null;

    /**
     * @property {String} logoUrl 
     */
    logoUrl = null;

    /**
     * @property {Array|String[]} prohibitedIn 
     */
    prohibitedIn = [];

    /**
     * @property {Array|Market[]} markets 
     */
    markets = [];

    /**
     * Init currencies
     * @returns {undefined}
     */
    static async init(exchange) {
        console.log('Inititialize Currency ' + exchange.name);
        return this.getAll(exchange);
    }

    /**
     * Get currencies from Bittrex
     * @returns {undefined}
     */
    static async getAll(exchange) {
        let currencies = await exchange.currencies();
        for (var i in currencies) {
            var currency = new Currency(currencies[i], exchange);
            exchange.currencyList.push(currency);
        }
    }

    /**
     * @returns {Currency}
     */
    getBtc() {
        return this.exchange.Currency.BTC;
    }

    /**
     * @returns {Currency}
     */
    getUsdt() {
        return this.exchange.Currency.USDT;
    }

    /**
     * Get a currency by it's code (example: "BTC","USD","USDT")
     * @param {string} symbol
     * @returns {Currency}
     */
    static getBySymbol(symbol, exchange) {
        exchange = exchange || this.exchange;
        for (var i in exchange.currencyList) {
            if (exchange.currencyList[i].symbol === symbol) {
                return exchange.currencyList[i];
            }
        }
        return null;
    }

    /**
     * List of allowed currency symbols from configuration
     * 
     * @returns {Array|String[]}
     */
    static getAllowed() {
        return Currency.config('allow') || [];
    }

    /**
     * List of restricted currency symbols from configuration
     * 
     * @returns {Array|String[]}
     */
    static getRestricted() {
        return Currency.config('restrict') || [];
    }

    /**
     * Instantiate a new Currency
     * 
     * @param {Object} currency Bittrex currency response object
     * @param {Exchange} exchange
     * @returns {Currency}
     */
    constructor(currency, exchange) {
        super(exchange);
        Object.assign(this, currency);

        if (this.isBtc()) {
            exchange.BTC = this;
        }
        if (this.isUsdt()) {
            exchange.USDT = this;
        }
        return this;
    }

    /**
     * Whether the currenci is restricted
     * 
     * @returns {Boolean}
     */
    isRestricted() {
        return Currency.getRestricted().indexOf(this.symbol) > -1;
    }

    /**
     * Whether the currenci is allowed
     * 
     * @returns {Boolean}
     */
    isAllowed() {
        return !this.isRestricted()
                && Currency.getAllowed().indexOf(this.symbol) > -1;
    }

    /**
     * Whethter this currency is the configured base curreny
     * 
     * @returns {Boolean}
     */
    isBase() {
        return this.symbol === Currency.getBaseSymbol();
    }

    /**
     * Whethter this currency is Bitcoin
     * 
     * @returns {Boolean}
     */
    isBtc() {
        return this.symbol === 'BTC';
    }

    /**
     * Whethter this currency is USDT
     * 
     * @returns {Boolean}
     */
    isUsdt() {
        return this.symbol === 'USDT';
    }

    /**
     * Associate a market to this currency
     * 
     * @param {Market} market
     * @returns {undefined}
     */
    addMarket(market) {
        this.markets.push(market);
    }

    /**
     * Get a market assciated with this currency by its symbol
     * 
     * @param {String} marketSymbol
     * @returns {Market}
     */
    getMarketBySymbol(marketSymbol) {
        for (var i in this.markets) {
            if (this.markets[i].symbol === marketSymbol) {
                return this.markets[i];
            }
        }
    }

    /**
     * Get the market that can be used to trade this currency to the given
     * currency
     * 
     * @param {Currency} currency
     * @returns {Market}
     */
    getMarket(currency) {
        return this.getMarketBySymbol(this.symbol + '-' + currency.symbol)
                || this.getMarketBySymbol(currency.symbol + '-' + this.symbol);
    }

    /**
     * Whether the currency is online
     * @returns {Boolean}
     */
    isOnline() {
        return this.status === 'ONLINE';
    }

    /**
     * Whether the currency can trade
     * 
     * @returns {Boolean}
     */
    canTrade() {
        return this.isAllowed()
                && !this.isRestricted();
    }

    /**
     * Get currency symbol
     * @returns {String}
     */
    getSymbol() {
        return this.symbol;
    }

    /**
     * Get currency name
     * 
     * @returns {String}
     */
    getName() {
        return this.name;
    }

    /**
     * Get currency price
     * 
     * @param {Currency} currency
     * @returns {Number}
     */
    getMarketPrice(currency) {
        return this.getMarket(currency).getMarketPrice(currency);
    }

    /**
     * Get potential currency price
     * 
     * @param {Currency} currency
     * @returns {Number}
     */
    getPotentialPrice(currency) {
        return this.getMarket(currency).getPotentialPrice(currency);
    }

    /**
     * Get median currency price
     * 
     * @param {Currency} currency
     * @returns {Number}
     */
    getMedianPrice(currency) {
        return this.getMarket(currency).getMedianPrice(currency);
    }
    
    /**
     * Get last currency price
     * 
     * @param {Currency} currency
     * @returns {Number}
     */
    getLastPrice(currency) {
        return this.getMarket(currency).getLastPrice(currency);
    }

    /**
     * Convert the given amount of this currency into Bitcoins
     * 
     * @param {Number} inputQuantity
     * @returns {Number}
     */
    convertToBtc(inputQuantity) {
        return this.isBtc() ? inputQuantity : this.convertTo(Currency.BTC, inputQuantity);
    }

    /**
     * Convert the given amount of this currency into USDT
     * 
     * @param {Number} inputQuantity
     * @returns {Number}
     */
    convertToUsdt(inputQuantity) {
        return this.isUsdt() ? inputQuantity : this.convertTo(Currency.USDT, inputQuantity);
    }

    /**
     * Convert the given amount of this currency into USDT
     * 
     * @param {Number} inputQuantity
     * @returns {Number}
     */
    convertToPotentialUsdt(inputQuantity) {
        return this.isUsdt() ? inputQuantity : this.convertToPotential(Currency.USDT, inputQuantity);
    }

    /**
     * Convert the given amount of this currency into Bitcoins
     * 
     * @param {Number} inputQuantity
     * @returns {Number}
     */
    convertToPotentialBtc(inputQuantity) {
        return this.isUsdt() ? inputQuantity : this.convertToPotential(Currency.USDT, inputQuantity);
    }

    /**
     * Convert this currency to the given output currency through Bitcoin
     * 
     * @param {Currency} outputCurrency
     * @param {Number} inputQuantity
     * @returns {Boolean}
     */
    convertThroughBtc(outputCurrency, inputQuantity) {
        if (this.symbol === outputCurrency.symbol)
            return inputQuantity;

        var marketX = this.getMarket(Currency.BTC);
        var marketY = Currency.BTC.getMarket(outputCurrency);
        return marketX && marketY ? Currency.BTC.convertTo(outputCurrency, this.convertToBtc(inputQuantity)) : false;
    }

    /**
     * Convert this currency to the given output currency through the potential
     * price of Bitcoin
     * 
     * @param {Currency} outputCurrency
     * @param {Number} inputQuantity
     * @returns {Number|Boolean}
     */
    convertPotentialThroughBtc(outputCurrency, inputQuantity) {
        if (this.symbol === outputCurrency.symbol)
            return inputQuantity;

        var marketX = this.getMarket(Currency.BTC);
        var marketY = Currency.BTC.getMarket(outputCurrency);
        return marketX && marketY ? Currency.BTC.convertToPotential(outputCurrency, this.convertToBtc(inputQuantity)) : false;
    }

    /**
     * Convert this currency to the given output currency through USDT
     * 
     * @param {Currency} outputCurrency
     * @param {Number} inputQuantity
     * @returns {Boolean}
     */
    convertThroughUsdt(outputCurrency, inputQuantity) {
        if (this.symbol === outputCurrency.symbol)
            return inputQuantity;

        var marketX = this.getMarket(Currency.UST);
        var marketY = Currency.USDT.getMarket(outputCurrency);
        return marketX && marketY ? Currency.USDT.convertTo(outputCurrency, this.convertToUsdt(inputQuantity)) : false;
    }

    /**
     * Convert this to the given currency
     * 
     * @param {Currency} outputCurrency
     * @param {Number} inputQuantity
     * @param {Number} price
     * @returns {Number|Boolean}
     */
    convertStraight(outputCurrency, inputQuantity, price) {
        if (this.symbol === outputCurrency.symbol)
            return inputQuantity;

        var market = this.getMarket(outputCurrency);
        return market ? market.convert(outputCurrency, inputQuantity, price) : false;
    }

    /**
     * Convert this to potential of the given currency
     * 
     * @param {Currency} outputCurrency
     * @param {Number} inputQuantity
     * @param {Number} price
     * @returns {Number|Boolean}
     */
    convertPotential(outputCurrency, inputQuantity, price) {
        if (this.symbol === outputCurrency.symbol)
            return inputQuantity;

        var market = this.getMarket(outputCurrency);
        return market ? market.convertPotential(outputCurrency, inputQuantity, price) : false;
    }

    /**
     * Convert this to median of the given currency
     * 
     * @param {Currency} outputCurrency
     * @param {Number} inputQuantity
     * @param {Number} price
     * @returns {Number|Boolean}
     */
    convertMedian(outputCurrency, inputQuantity, price) {
        if (this.symbol === outputCurrency.symbol)
            return inputQuantity;

        var market = this.getMarket(outputCurrency);
        return market ? market.convertMedian(outputCurrency, inputQuantity, price) : false;
    }
    
    /**
     * Convert this to median of the given currency
     * 
     * @param {Currency} outputCurrency
     * @param {Number} inputQuantity
     * @param {Number} price
     * @returns {Number|Boolean}
     */
    convertLast(outputCurrency, inputQuantity, price) {
        if (this.symbol === outputCurrency.symbol)
            return inputQuantity;

        var market = this.getMarket(outputCurrency);
        return market ? market.convertLast(outputCurrency, inputQuantity, price) : false;
    }

    /**
     * Convert this to the given currency
     * When straight conversion is not possible conversion is attempted through
     * Bitcoin
     * 
     * @param {Currency} outputCurrency
     * @param {Number} inputQuantity
     * @param {Number} [price] 
     * @returns {Number|Boolean}
     */
    convertTo(outputCurrency, inputQuantity, price) {
        if (this.symbol === outputCurrency.symbol)
            return inputQuantity;

        return this.convertStraight(outputCurrency, inputQuantity, price)
                || this.convertThroughBtc(outputCurrency, inputQuantity, price);
    }

    /**
     * Convert this Currency to the potential of the given Currency
     * When straight conversion is not possible conversion is attempted through
     * Bitcoin
     * 
     * @param {Currency} outputCurrency
     * @param {Number} inputQuantity
     * @param {Number} [price] 
     * @returns {Number|Boolean}
     */
    convertToPotential(outputCurrency, inputQuantity, price) {
        if (this.symbol === outputCurrency.symbol)
            return inputQuantity;

        return this.convertPotential(outputCurrency, inputQuantity, price)
                || this.convertPotentialThroughBtc(outputCurrency, inputQuantity);
    }

    /**
     * Trade given quantity of this currency to Bitcoin
     * 
     * @param {Number} inputQuantity
     * @param {Number} [price] 
     * @returns {Trade|Boolean}
     */
    tradeToBtc(inputQuantity, price) {
        return this === Currency.BTC ? false : this.tradeTo(Currency.BTC, inputQuantity, price);
    }

    /**
     * Trade given quantity of this currency to Bitcoin
     * 
     * @param {Number} inputQuantity
     * @param {Number} [price] 
     * @returns {Trade|Boolean}
     */
    tradeToUsdt(inputQuantity, price) {
        return this === Currency.USDT ? false : this.tradeTo(Currency.USDT, inputQuantity, price);
    }

    /**
     * Trade given quantity of this currency to the configured base currency
     * 
     * @param {Number} inputQuantity
     * @param {Number} [price] 
     * @returns {Trade|Boolean}
     */
    tradeToBase(inputQuantity, price) {
        return this === Currency.BASE ? false : this.tradeTo(Currency.BASE, inputQuantity, price);
    }

    /**
     * Trade given quantity of this currency through Bitcoin to the output
     * currency
     * 
     * @param {Currency} outputCurrency
     * @param {Number} inputQuantity
     * @param {Number} [price] 
     * @returns {Trade|Boolean|Undefined}
     */
    tradeTo(outputCurrency, inputQuantity, price) {
        if (this.symbol === outputCurrency.symbol)
            return;

        var market = this.getMarket(outputCurrency);
        return market ? market.trade(this, outputCurrency, inputQuantity, price) : false;
    }

    /**
     * Trade given quantity of this currency through Bitcoin to the output
     * currency
     * 
     * @param {Currency} outputCurrency
     * @param {Number} inputQuantity
     * @param {Number} [price] 
     * @returns {Trade|Boolean|Undefined}
     */
    tradePotential(outputCurrency, inputQuantity, price) {
        if (this.symbol === outputCurrency.symbol)
            return;

        var market = this.getMarket(outputCurrency);
        return market ? market.tradePotential(this, outputCurrency, inputQuantity, price) : false;
    }

};