var ExchangeModel = require('../../system/ExchangeModel.js');
var Trade = require('./Trade.js');
var Balance = require('./Balance.js');
var Currency = require('./Currency.js');
var Bittrex = require('../../exchange/bittrex/Bittrex.js');
var Util = require('../../system/Util.js');

module.exports = class Trade extends ExchangeModel {

    market = null;
    inputCurrency = null;
    outputCurrency = null;
    inputQuantity = null;
    outputQuantity = null;
    tradeQuantity = null;
    price;
    type = null;
    callback = null;
    requested = false;
    responded = false;
    response = false;
    createdAt = null;
    executedAt = null;
    requestedAt = null;
    respondedAt = null;
    timeInForce = null;
    maxTries = 10;
    tries = 0
    complete = false;

    static list = [];

    static push(trade) {
        Trade.list.push(trade);
    }

    static getCurrentTrades() {
        var trades = [];
        for (var i in trades) {
            var trade = trades[i];
            if (typeof trade === 'object') {
                if (trade.request && !trade.responeded) {
                    trades.push(trade);
                }
            }
        }
        return trades;
    }

    static consoleOutput() {
        var output = "<h3>Trades (" + Trade.list.length + ") </h3> <table><tr><th>" + ["Time", "Market", "Currency", "Quantity", "Rate"].join("</th><th>") + "</th></tr>";
        for (var i = Trade.list.length - 1; i >= 0; i--) {
            output += "<tr> " + Trade.list[i].consoleOutput() + "</tr>";
            if (Trade.list.length - i == 30) {
                break
            }
            ;
        }
        return output + "</table>";
    }

    constructor(market, inputCurrency, outputCurrency, inputQuantity, price, outputQuantity) {
        super();


        this.createdAt = Date.now();
        this.market = market;
        this.inputCurrency = inputCurrency;
        this.outputCurrency = outputCurrency;
        this.inputQuantity = inputQuantity;
        this.outputQuantity = outputQuantity;
        this.price = price;
        this.getTradeQuantity();
        return this;
    }

    getTradeQuantity() {
        if (this.getMarket().isBaseCurrency(this.inputCurrency)) {
            this.tradeQuantity = this.inputQuantity;
        } else {
            this.tradeQuantity = this.outputQuantity || this.inputCurrency.convertTo(this.outputCurrency, this.inputQuantity, this.deviation);
        }
    }

    getDirection() {
        return this.getMarket().isBaseCurrency(this.outputCurrency) ? 'BUY' : 'SELL';
    }

    getMarket() {
        return this.market;
    }

    getMarketSymbol() {
        return this.market.symbol;
    }

    getOutputCurrency() {
        return this.outputCurrency;
    }

    getQuantity() {
        return Number.parseFloat(this.tradeQuantity).toFixed(this.market.getPrecision());
    }

    getPrice() {
        return Number.parseFloat(this.price).toFixed(this.getMarket().getPrecision());
    }

    getType() {
        return this.type || Trade.config('orderType') || 'LIMIT';
    }

    getTimeInForce() {
        return this.getType() === 'MARKET' ? 'FILL_OR_KILL' : 'GOOD_TIL_CANCELLED';
    }

    getConditionType() {
        return 'NONE';
    }

    getCeiling() {
        return 0;//this.isBaseCurrency() ? this.quantity / this.getPrice() : this.quantity;
    }

    getNote() {
        return '';
    }

    getUseAwards() {
        return Trade.config('useAwards') === true || false;
    }

    getRequest() {
        return this.request;
    }

    getCreatedAt() {
        return this.createdAt;
    }
    getExecutedAt() {
        return this.executedAt;
    }
    getRequestedAt() {
        return this.requestedAt;
    }
    getRespondedAt() {
        return this.respondedAt;
    }

    setTypeLimit() {
        this.type = 'LIMIT';
    }

    setTypeMarket() {
        this.type = 'MARKET';
        this.timeInForce = 'FILL_OR_KILL';
    }

    meetsMinTradeRequirement() {
        return this.getMarket().getMinTradeSize() <= this.getQuantity()
    }

    hasBalance() {
        return Balance.getByCurrency(this.inputCurrency).getAvailable() >= this.inputQuantity;
    }

    canExecute(debug) {
        if (!this.getMarket().canTrade()) {
            if (debug) {
                console.log("Market not available " + this.getMarket().symbol);
            }
            return false;
        }
        if (!this.meetsMinTradeRequirement()) {
            if (debug) {
                console.log("Trade does not meet minimum requirement. Requirement: " + this.getMarket().getMinTradeSize() + " Quantity: " + this.getQuantity());
            }
            return false;
        }
        if (!this.hasBalance()) {
            if (debug) {
                console.log("Not enough balance for trade. Balance: " + Balance.getByCurrency(this.inputCurrency).getAvailable() + " Quantity: " + this.getQuantity());
            }
            return false;
        }
        return true;
    }

    async execute(callback) {
        if (this.canExecute(true)) {
            try {
                this.tries++;
                
                this.logData();
                this.executedAt = Date.now();
                let response = await Bittrex.newOrder(
                        this.getMarketSymbol(),
                        this.getDirection(),
                        this.getType(),
                        this.getTimeInForce(),
                        this.getQuantity(),
                        this.getCeiling(),
                        this.getType() === 'MARKET' ? 0 : this.getPrice(),
                        this.getNote(),
                        this.getUseAwards()
                        );
                
                this.complete = true;
                Trade.push(this);
                this.respondedAt = Date.now();
                this.response = response;
                this.logData();
                if (callback) {
                    callback(this);
                }
                return response;
            } catch (e) {
                console.log(e.response.data.code + " " + this.getMarketSymbol() + " " + this.getType() + " " + this.getDirection());
                if (this.tries < this.maxTries && this.getType() === 'LIMIT') {
                    var _this = this;
                    setTimeout(() => {
                        console.log("Retry trade " + _this.getMarketSymbol() + " " + _this.getType() + " " + _this.getDirection());
                        _this.execute(callback);
                    }, 1000);
                } else {
                    this.complete = true;
                }
            }
        } else {
            console.log("Cannot execute trade " + this.getMarketSymbol() + " " + this.getType() + " " + this.getDirection());
        }
        return null;
    }

    async executeMarket(callback) {
        this.setTypeMarket();
        return this.execute(callback);
    }

    logData() {
        var data = "\n\n" + (new Date().toLocaleString()) + JSON.stringify([
            this.getMarketSymbol(),
            this.getDirection(),
            this.getType(),
            this.getTimeInForce(),
            this.getQuantity(),
            this.getCeiling(),
            this.getPrice(),
            this.getNote(),
            this.getUseAwards(),
            this.response
        ], null, 2) + "\n";
        Util.log(data, 'trade');
    }

    /**
     * Output that gets logged to console
     * 
     * @returns {String}
     */
    consoleOutput() {
        return "<td>" + [
            new Date(this.getCreatedAt()).toLocaleString(),
            this.getMarketSymbol() + "  ",
            this.getOutputCurrency().getSymbol(),
            Util.pad(this.getQuantity()),
            Util.pad(this.getPrice())
        ].join("</td><td>") + "</td>";
    }
};