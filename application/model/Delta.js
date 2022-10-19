var ExchangeModel = require('../../system/ExchangeModel.js');
var Balance = require('./Balance.js');
var Currency = require('./Currency.js');
var Market = require('./Market.js');

module.exports = class Delta extends ExchangeModel {

    /**
     * @static
     * @property {Boolean} trading 
     */
    static trading = false;

    /**
     * @property {Route} route 
     */
    route = null;
    
    /**
     * @property {Currency} inputCurrency
     */
    inputCurrency = null;
    
    /**
     * @property {Currency} outputCurrency 
     */
    outputCurrency = null;
    
    /**
     * @property {Number} input
     */
    input = null;
    
    /**
     * @property (Number} output
     */
    output = null;
    
    
    /**
     * @property (Number} price
     */
    price = 0;
    
    /**
     * @property (Market} market
     */
    market = null;
    
    /**
     * 
     * @param {Route} route
     * @param {Currency} inputCurrency
     * @param {Currency} outputCurrency
     * @returns {Delta}
     */
    constructor(route, inputCurrency, outputCurrency) {
        super();

        this.route = route;
        this.inputCurrency = inputCurrency;
        this.outputCurrency = outputCurrency;
        this.market = inputCurrency.getMarket(outputCurrency);
        this.market.routes.push(route);
        
        return this;
    }

    /**
     * 
     * @returns {Boolean}
     */
    isAllowed() {
        return this.inputCurrency.isAllowed()
                && this.outputCurrency.isAllowed()
                && this.market.isAllowed();
    }

    /**
     * 
     * @returns {Number}
     */
    getBtcBalance() {
        return this.inputCurrency.convertToBtc(Balance.getByCurrency(this.inputCurrency).getAvailable());
    }

    /**
     * 
     * @returns {Number}
     */
    getMinBtcMarket() {
        return this.market.getMinTradeSizeBtc();
    }

    /**
     * 
     * @returns {Number}
     */
    getPrice() {
        switch(this.getMode()) {
            case 'market' :
                this.price = this.market.getMarketPrice(this.outputCurrency);
                break;
            case 'potential' :
                this.price = this.market.getPotentialPrice(this.outputCurrency);
                break;
            case 'median' :
                this.price = this.market.getMedianPrice(this.outputCurrency);
            break;
            case 'last' :
                this.price = this.market.getLastPrice(this.outputCurrency);
                break;
            case 'fixed' :
                this.price = this.market.getMarketPrice(this.outputCurrency);
                break;
        
        }
       
        return this.price = Number.parseFloat(this.price).toFixed(8);
    }

    /**
     * 
     * @returns {Number}
     */
    getInput() {
        return this.input = Currency.getBtc().convertTo(this.inputCurrency, this.route.getInputBtc());
    }

    getOuput() {
        if(this.price === 0) {
            this.price = this.getPrice();
        }
        switch(this.getMode()) {
            case 'market' :
                this.output = this.market.convert(this.outputCurrency, this.getInput(), this.price);
                this.output = this.output - (this.output*this.market.takerFee);
                break;
            case 'potential' :
                this.output = this.market.convertPotential(this.outputCurrency, this.getInput(), this.price);
                this.output = this.output - (this.output*this.market.makerFee);
                break;
            case 'median' :
                this.output = this.market.convertMedian(this.outputCurrency, this.getInput(), this.price);
                this.output = this.output - (this.output*this.market.makerFee);
            break;
            case 'last' :
                this.output = this.market.convertLast(this.outputCurrency, this.getInput(), this.price);
                this.output = this.output - (this.output*this.market.makerFee);
                break;
            case 'fixed' :
                this.output = this.market.convertPotential(this.outputCurrency, this.getInput(), this.price);
                this.output = this.output - (this.output*this.market.makerFee);
                break;
        
        }
        return this.output;
    }

    getMode() {
        return Delta.config('mode');
    }

    isRestricted() {
        return !this.inputCurrency.canTrade()
                || !this.outputCurrency.canTrade()
                || !this.market.canTrade();
    }

    calculate() {
        this.price = 0;
        this.getOuput();
    }

    recalculate() {
        this.output = this.market.convert(this.outputCurrency, this.getInput(), this.price);
        this.output -= this.output*this.market.makerFee;
    }

    fixPrices(factor) {
        if(factor < 0) {
            var fix = Delta.config('fix') || 0;
            if (this.market.isBaseCurrency(this.inputCurrency)) {
               this.price = Number.parseFloat(this.price) - Number.parseFloat(this.price/100*(factor-fix));
            } else {
               this.price = Number.parseFloat(this.price) + Number.parseFloat(this.price/100*(factor-fix));
            }
        }
        this.price = Number.parseFloat(this.price).toFixed(8);
    }

    hasEnoughBalance() {
        return Balance.getByCurrency(this.inputCurrency).getAvailable() >= this.input;
    }

    /**
     * 
     * @returns {Number}
     */
    getVolume() {
        return this.input;
    }

    /**
     * Trade the route
     * @returns {Trade}
     */
    trade() {
        var trade = this.market.trade(this.inputCurrency, this.outputCurrency, this.input, this.price, this.output);
        return trade;
    }
};