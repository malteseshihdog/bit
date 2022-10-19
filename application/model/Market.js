var ExchangeModel = require('../../system/ExchangeModel.js');
var Trade = require('./Trade.js');
var OrderBook = require('./OrderBook.js');
var Currency = require('./Currency.js');

// @TODO Abstract many exchanges
var Bittrex = require('../../exchange/bittrex/Bittrex.js');
var BittrexSocket = require('../../exchange/bittrex/BittrexSocket.js');

module.exports = class Market extends ExchangeModel {

    static socket = null;

    /**
     * @property {String} symbol 
     */
    symbol = null;

    /**
     * @property {String} baseCurrencySymbol 
     */
    baseCurrencySymbol = null;

    /**
     * @property {String} quoteCurrencySymbol 
     */
    quoteCurrencySymbol = null;

    /**
     * @property {Currency} baseCurrency 
     */
    baseCurrency = null;

    /**
     * @property {Currency} quoteCurrency 
     */
    quoteCurrency = null;

    /**
     * @property {String} minTradeSize 
     */
    minTradeSize = 0;

    /**
     * @property {String} precision 
     */
    precision = 0;

    /**
     * @property {String} createdAt 
     */
    createdAt = null;

    /**
     * @property {String} notice 
     */
    notice = null;

    /**
     * @property {Array} prohibitedIn 
     */
    prohibitedIn = null;

    /**
     * @property {OrderBook} orderBook 
     */
    orderBook = null;

    /**
     * @property {Array|Object[]} tickData 
     */
    tickData = [];

    /**
     * @property {Array|Route[]} routes 
     */
    routes = [];

    /**
     * @property {Float} makerFee
     */
    makerFee = 0;

    /**
     * @property {Float} takerFee
     */
    takerFee = 0;

    /**
     * @property {Market[]} list 
     */
    static list = [];

    /**
     * @property {NodeJS.Timer} tickerInterval 
     */
    static tickerInterval = null;

    /**
     * @property {NodeJS.Timer} updateInterval
     */
    static updateInterval = null;

    /**
     * @property {NodeJS.Timer} subscribeSocketTimeout
     */
    static subscribeSocketTimeout;

    /**
     * Initialize markets
     * @returns {undefined}
     */
    static async init() {
        console.log('Inititialize Market...');
        await Market.getAll();
        Market.subscribeTickers();
        return this;
    }

    /**
     * Get markets from bittres and assign them to the list when they are not
     * already in it
     * 
     * @returns {undefined}
     */
    static async getAll() {
        let markets = await Bittrex.markets();
        for (var i in markets) {
            if (!Market.getBySymbol(Market.symbol)) {
                Market.push(new Market(markets[i]));
            }
        }
        await Market.updateFees();
    }

    /**
     * Push market to list
     * 
     * @param {Market} market
     * @returns {undefined}
     */
    static push(market) {
        Market.list.push(market);
    }

    /**
     * Get a market by its symbol
     * @param {type} marketSymbol
     * @returns {String}
     */
    static getBySymbol(marketSymbol) {
        for (var i in Market.list) {
            if (Market.list[i].symbol === marketSymbol) {
                return Market.list[i];
            }
        }
    }

    /**
     * Get a market by its currencies
     * 
     * @param {Currency} currencyX
     * @param {Currency} currencyY
     * @returns {Market.list}
     */
    static getByCurrencies(currencyX, currencyY) {
        for (var i in Market.list) {
            if (Market.list[i].symbol === currencyX.symbol + '-' + currencyY.symbol
                    || Market.list[i].symbol === currencyY.symbol + '-' + currencyX.symbol) {
                return Market.list[i];
            }
        }
        return null;
    }

    /**
     * Constructor for market
     * 
     * @param {Object} market Bittrex market response object
     * @returns {Market}
     */
    constructor(market) {
        super();
        Object.assign(this, market);
        this.getCurrencies();
        this.orderBook = new OrderBook(this);
        if (this.baseCurrency && this.quoteCurrency) {
            this.baseCurrency.addMarket(this);
            this.quoteCurrency.addMarket(this);
            return this;
        }
    }

    /**
     * List of restricted currency symbols from configuration
     * 
     * @returns {Array|String[]}
     */
    static getRestricted() {
        return Market.config('restrict') || [];
    }

    /**
     * Whether the market is restricted
     * 
     * @returns {Boolean}
     */
    isRestricted() {
        return Market.getRestricted().indexOf(this.symbol) > -1;
    }

    /**
     * Whether the configuration allows the market to be traded
     * 
     * @returns {Boolean}
     */
    isAllowed() {
        return this.baseCurrency.isAllowed()
                && this.quoteCurrency.isAllowed()
                && !this.isRestricted();
    }

    /**
     * Find base and quote currency and set them
     * 
     * @returns {undefined}
     */
    getCurrencies() {
        this.baseCurrency = Currency.getBySymbol(this.baseCurrencySymbol);
        this.quoteCurrency = Currency.getBySymbol(this.quoteCurrencySymbol);
    }

    /**
     * Whether the given currency is the base currency of this market
     * 
     * @param {Currency} currency
     * @returns {Boolean}
     */
    isBaseCurrency(currency) {
        return currency.symbol === this.baseCurrency.symbol;
    }

    /**
     * Whether the given currency is the quote currency of this market
     * 
     * @param {type} currency
     * @returns {Boolean}
     */
    isQuoteCurrency(currency) {
        return currency.symbol === this.quoteCurrency.symbol;
    }

    /**
     * Whether the market is online
     * 
     * @returns {Boolean}
     */
    isOnline() {
        return this.status === 'ONLINE';
    }

    /**
     * Get the price precision of the market
     * 
     * @returns {Number}
     */
    getPrecision() {
        return Number.parseInt(this.precision);
    }

    /**
     * Get the minimum trade size of the market
     * 
     * @returns {Number}
     */
    getMinTradeSize() {
        return Number.parseFloat(this.minTradeSize);
    }

    /**
     * Get the minimum trade size of the market
     * 
     * @returns {Number}
     */
    getMinTradeSizeBtc() {
        return this.baseCurrency.convertToBtc(this.getMinTradeSize());
    }

    /**
     * Whether the market can trade
     * 
     * The market can trade when the currencies are configured
     * When the market is not restricted in the configuration
     * When the market is online
     * 
     * @returns {Boolean}
     */
    canTrade() {
        return this.isAllowed()
                && !this.isRestricted()
                && this.isOnline();
    }

    /**
     * Get the current market price for the given currency
     * 
     * @param {Currency} currency The currency to get the price for
     * @returns {Number}
     */
    getMarketPrice(currency) {
        var price;
        if (this.isBaseCurrency(currency)) {
            price = this.Ask();
        } else {
            price = this.Bid();
        }
        return Number.parseFloat(price).toFixed(this.getPrecision());
    }

    /**
     * Get the current reversed market prices for the given currency
     * Does the same as getMarketPrice but switches Ask to Bid and Bid to Ask
     * 
     * @param {Currency} currency The currency to get the price for
     * @returns {Number}
     */
    getPotentialPrice(currency) {
        var price;
        if (this.isBaseCurrency(currency)) {
            price = this.Bid();
        } else {
            price = this.Ask();
        }
        return Number.parseFloat(price).toFixed(this.getPrecision());
    }

    /**
     * Get the current reversed market prices for the given currency
     * Does the same as getMarketPrice but switches Ask to Bid and Bid to Ask
     * 
     * @param {Currency} currency The currency to get the price for
     * @returns {Number}
     */
    getMedianPrice(currency) {
        var price = this.Bid() + ((this.Ask() - this.Bid()) / 2);
        return Number.parseFloat(price).toFixed(this.getPrecision());
    }

    /**
     * Get last price
     * 
     * @param {type} currency
     * @returns {Number}
     */
    getLastPrice(currency) {
        return Number.parseFloat(this.Last()).toFixed(this.getPrecision());
    }

    /**
     * Current ask price from the order book
     * 
     * @returns {Number}
     */
    Ask() {
        return Number.parseFloat(this.orderBook.Ask());
    }

    /**
     * Accumulative quantity of available coins available at and under the given
     * price
     * 
     * @param {Number} price
     * @returns {Number}
     */
    Asks(price) {
        return this.orderBook.Asks(price);
    }

    /**
     * Current bid price from the order book
     * 
     * @returns {Number}
     */
    Bid() {
        return Number.parseFloat(this.orderBook.Bid());
    }

    /**
     * Accumulative quantity of available coins available at and above the given
     * price
     * 
     * @param {Number} price
     * @returns {Number}
     */
    Bids(price) {
        return this.orderBook.Bids(price);
    }

    /**
     * last price from the order book
     * 
     * @returns {Number}
     */
    Last() {
        return Number.parseFloat(this.orderBook.Last());
    }
    /**
     * Get quantity available for given currency
     * 
     * @param {Currency} currency
     * @param {Number} [price]
     * @returns {Number}
     */
    getQuantityAvailable(currency, price) {
        return this.isBaseCurrency(currency) ? this.Asks(price) : this.Bids(price);
    }

    /**
     * Get quantity available for given currency at the reversed price
     * 
     * @param {Currency} currency
     * @param {Number} [price]
     * @returns {Number}
     */
    getPotentialQuantityAvailable(currency, price) {
        return this.isBaseCurrency(currency) ? this.Bids(price) : this.Asks(price);
    }

    /**
     * Trade the input currency to the output currency in this market
     * 
     * @param {Currency} inputCurrency The currency to trade
     * @param {Currency} outputCurrency The currency received
     * @param {Number} inputQauntity The quantity to trade
     * @param {Number} price The price
     * @param {Number} outputQuantity The output quantity
     * @returns {Trade}
     */
    trade(inputCurrency, outputCurrency, inputQauntity, price, outputQuantity) {
        if (!price) {
            price = this.getMarketPrice(outputCurrency);
        }
        return new Trade(this, inputCurrency, outputCurrency, inputQauntity, price, outputQuantity);
    }

    /**
     * Trade the input currency to the output currency in this market at
     * reversed prices
     * 
     * @param {Currency} inputCurrency The currency to trade
     * @param {Currency} outputCurrency The currency received
     * @param {Number} inputQauntity The quantity to trade
     * @param {Number} [price] The price
     * @returns {Trade}
     */
    tradePotential(inputCurrency, outputCurrency, inputQauntity, price) {
        if (!price) {
            price = this.getPotentialPrice(outputCurrency);
        }
        return new Trade(this, inputCurrency, outputCurrency, inputQauntity, price);
    }

    /**
     * Convert the input currency to the output currency at current market price
     * Also calculates commission
     * 
     * @param {Currency} outputCurrency The currency to convert
     * @param {Currency} inputQuantity The currency convert to
     * @param {Number} [price]
     * @returns {Number}
     */
    convert(outputCurrency, inputQuantity, price) {
        if (!price) {
            price = this.getMarketPrice(outputCurrency);
        }
        var isBase = this.isBaseCurrency(outputCurrency);
        var output = isBase ? inputQuantity / price : price * inputQuantity;
        return  output;
    }

    /**
     * Convert the input currency to the output currency at reversed market price
     * Also calculates commission
     * 
     * @param {Currency} outputCurrency
     * @param {Currency} inputQuantity
     * @param {Number} [price]
     * @returns {Number}
     */
    convertPotential(outputCurrency, inputQuantity, price) {
        if (!price) {
            price = this.getPotentialPrice(outputCurrency);
        }
        var isBase = this.isBaseCurrency(outputCurrency);
        var output = isBase ? inputQuantity / price : price * inputQuantity;
        return  output;
    }

    /**
     * Convert the input currency to the output currency at median market price
     * Also calculates commission
     * 
     * @param {Currency} outputCurrency
     * @param {Currency} inputQuantity
     * @param {Number} [price]
     * @returns {Number}
     */
    convertMedian(outputCurrency, inputQuantity, price) {
        if (!price) {
            price = this.getMedianPrice(outputCurrency);
        }
        var isBase = this.isBaseCurrency(outputCurrency);
        var output = isBase ? inputQuantity / price : price * inputQuantity;
        return  output;
    }

    /**
     * Convert the input currency to the output currency at last price
     * Also calculates commission
     * 
     * @param {Currency} outputCurrency
     * @param {Currency} inputQuantity
     * @param {Number} [price]
     * @returns {Number}
     */
    convertLast(outputCurrency, inputQuantity, price) {
        if (!price) {
            price = this.getLastPrice(outputCurrency);
        }
        var isBase = this.isBaseCurrency(outputCurrency);
        var output = isBase ? inputQuantity / price : price * inputQuantity;
        return  output;
    }

    /**
     * Trigger the calculation of the routes assciated to this market
     * 
     * @returns {undefined}
     */
    triggerRoutes() {
        for (var i in this.routes) {
            if (typeof this.routes[i] === 'object') {
                this.routes[i].calculate();
            }
        }
    }

    /**
     * Update market fees
     * 
     * @TODO implement many exchanges
     * 
     * @returns {undefined}
     */
    static async updateFees() {
        try {
            var fees = await Bittrex.getAccountFees();
            for (var x in fees) {
                var market = Market.getBySymbol(fees[x].marketSymbol);
                if (market) {
                    market.takerFee = Number.parseFloat(fees[x].takerRate);
                    market.makerFee = Number.parseFloat(fees[x].makerRate);
                }
            }
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Update min trade sizes
     * 
     * @TODO implement many exchanges
     * 
     * @returns {undefined}
     */
    static async updateMinTradeSize() {
        try {
            let markets = await Bittrex.markets();
            for (var i in markets) {
                var market = Market.getBySymbol(markets[i].symbol);
                if (market) {
                    market.minTradeSize = markets[i].minTradeSize;
                }
            }
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Poll tickers web requests
     * 
     * @TODO refactor 'uodateInterval' to updateTimeout
     * 
     * @returns {undefined}
     */
    static subscribeTickers() {
        clearInterval(Market.tickerInterval);
        Market.updateTickers();
        Market.tickerInterval = setInterval(Market.subscribeTickers, Market.config('updateInterval'));
    }

    /**
     * Update market tickers
     * 
     * @TODO implement many exchanges
     * 
     * @returns {undefined}
     */
    static async updateTickers() {
        try {
            var tickers = await Bittrex.marketTickers();
            for (var i in tickers) {
                var market = Market.getBySymbol(tickers[i].symbol);
                if (market) {
                    market.orderBook.update(tickers[i].askRate, tickers[i].bidRate, tickers[i].lastTradeRate);
                }
            }
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Subscribe all market socket tickers
     * 
     * @TODO implement many exchanges
     * 
     * @returns {undefined}
     */
    static subscribeSocket() {
        clearTimeout(Market.subscribeSocketTimeout);
        var channels = [];
        for (var i in Market.list) {
            if (Market.list[i].routes.length > 0) {
                channels.push("ticker_" + Market.list[i].symbol);
            }
        }
        BittrexSocket.construct(Bittrex.config('apikey'), Bittrex.config('apisecret'), channels, Market.updateSocketTickers);
        Market.subscribeSocketTimeout = setTimeout(Market.subscribeSocket, 600000); // resubscrivbe sockets every 10 minutes
    }

    static async subscribeFeesAndMinTradeSizes() {
        clearTimeout(Market.updateFeesTimeout);
        await Market.updateFees();
        await Market.updateMinTradeSize();
        Market.updateFeesTimeout = setTimeout(Market.subscribeFeesAndMinTradeSizes, 600000); // get fees and min sizes every 10 minutes
    }

    /**
     * Update tickers
     * 
     * @TODO make Ticker model
     * 
     * @param {Object} ticker
     * @returns {undefined}
     */
    static async updateSocketTickers(ticker) {
        var market = Market.getBySymbol(ticker.symbol);
        if (market) {
            market.orderBook.update(ticker.askRate, ticker.bidRate, ticker.lastTradeRate);
        }
    }

};