var Model = require('../../system/Model.js');
var Balance = require('./Balance.js');
var Market = require('./Market.js');
var Currency = require('./Currency.js');
var Delta = require('./Delta.js');
var Util = require('../../system/Util.js');

/**
 * Route logic
 */
module.exports = class Route extends Model {

    static trading = false;

    /**
     * @property {Currency} currencyX 
     */
    currencyX = null;

    /**
     * @property {Currency} currencyZ 
     */
    currencyZ = null;

    /**
     * @property {Currency} currencyY 
     */
    currencyY = null;

    /**
     * @property {Number} profitFactorX 
     */
    profitFactorX = null;

    /**
     * @property {Number} profitFactorX 
     */
    profitFactorY = null;

    /**
     * @property {Number} profitFactorX 
     */
    profitFactorZ = null;

    /**
     * @property {Number} profitFactorX 
     */
    profitFactor = null;

    /**
     * @property {Array|Delta[]} deltaChain 
     */
    deltaChain = [];

    /**
     * @property {Array|Route[]} list
     */
    static list = [];
    static finding = false;

    static init() {
        this.find();
    }

    static find() {
        this.finding = true;
        this.clear();
        var currencies = Currency.getAllowed();
        for (var x in currencies) {
            for (var y in currencies) {
                if (x === y)
                    continue;
                for (var z in currencies) {
                    if (y === z || z === x)
                        continue;
                    if (!Route.exists(currencies[x], currencies[y], currencies[z])) {
                        var route = Route.possible(currencies[x], currencies[y], currencies[z]);
                        if (route) {
                            Route.push(route);
                        }
                    }
                }
            }
        }
        this.finding = false;
        Market.subscribeSocket();
        Market.subscribeFeesAndMinTradeSizes();
    }

    static clear() {
        Route.list = [];
    }

    static push(route) {
        Route.list.push(route);
    }

    static exists(currencyX, currencyY, currencyZ) {
        for (var i in Route.list) {
            if (Route.list[i].currencyX.symbol === currencyX
                    && Route.list[i].currencyY.symbol === currencyY
                    && Route.list[i].currencyZ.symbol === currencyZ) {
                return true;
            }
            if (Route.list[i].currencyX.symbol === currencyX
                    && Route.list[i].currencyY.symbol === currencyZ
                    && Route.list[i].currencyZ.symbol === currencyY) {
                return true;
            }
            if (Route.list[i].currencyX.symbol === currencyY
                    && Route.list[i].currencyY.symbol === currencyX
                    && Route.list[i].currencyZ.symbol === currencyZ) {
                return true;
            }
            if (Route.list[i].currencyX.symbol === currencyY
                    && Route.list[i].currencyY.symbol === currencyZ
                    && Route.list[i].currencyZ.symbol === currencyX) {
                return true;
            }
            if (Route.list[i].currencyX.symbol === currencyZ
                    && Route.list[i].currencyY.symbol === currencyX
                    && Route.list[i].currencyZ.symbol === currencyY) {
                return true;
            }
            if (Route.list[i].currencyX.symbol === currencyZ
                    && Route.list[i].currencyY.symbol === currencyY
                    && Route.list[i].currencyZ.symbol === currencyX) {
                return true;
            }
        }
        return false;
    }

    static findByCurrency(currency) {
        var routes = [];
        for (var i in Route.list) {
            if (Route.list[i].currencyX.symbol === currency.symbol
                    || Route.list[i].currencyY.symbol === currency.symbol
                    || Route.list[i].currencyZ.symbol === currency.symbol) {
                routes.push(Route.list[i]);
            }
        }
        return routes;
    }

    static getTradingRoute() {
        var routes = [];
        for (var i in Route.list) {
            if (Route.list[i] instanceof Route) {
                if (Route.list[i].isTrading()) {
                    routes.push(Route.list[i]);
                }
            }
        }
        return routes;
    }

    static isTrading() {
        return Route.getTradingRoute().length > 0;
    }

    constructor(currencyX, currencyY, currencyZ) {
        super();

        this.currencyX = currencyX;
        this.currencyY = currencyY;
        this.currencyZ = currencyZ;

        this.deltaChain.push(new Delta(this, this.currencyX, this.currencyY));
        this.deltaChain.push(new Delta(this, this.currencyY, this.currencyZ));
        this.deltaChain.push(new Delta(this, this.currencyZ, this.currencyX));
    }

    getInputBtc() {
        var minInputBtc = Route.config("minInputBtc");
        for (var i in this.deltaChain) {
            var deltaMinInputBtc = this.deltaChain[i].market.baseCurrency.convertToBtc(this.deltaChain[i].market.minTradeSize);
            if (deltaMinInputBtc > minInputBtc) {
                minInputBtc = deltaMinInputBtc;
            }
        }
        return minInputBtc;
    }

    calculate() {
        for (var i in this.deltaChain) {
            this.deltaChain[i].calculate();
        }
        this.profitX = (this.deltaChain[2].output - this.deltaChain[0].input);
        this.profitY = (this.deltaChain[0].output - this.deltaChain[1].input);
        this.profitZ = (this.deltaChain[1].output - this.deltaChain[2].input);
        this.profitFactorX = (this.profitX) / this.deltaChain[0].input * 100;
        this.profitFactorY = (this.profitY) / this.deltaChain[1].input * 100;
        this.profitFactorZ = (this.profitZ) / this.deltaChain[2].input * 100;
        this.profitFactor = this.profitFactorX + this.profitFactorY + this.profitFactorZ;

        if (this.deltaChain[0].getMode() === "fixed") {
            this.deltaChain[0].fixPrices(this.profitFactorY);
            this.deltaChain[1].fixPrices(this.profitFactorZ);
            this.deltaChain[2].fixPrices(this.profitFactorX);

            this.deltaChain[0].recalculate();
            this.deltaChain[1].recalculate();
            this.deltaChain[2].recalculate();


            this.profitX = (this.deltaChain[2].output - this.deltaChain[0].input);
            this.profitY = (this.deltaChain[0].output - this.deltaChain[1].input);
            this.profitZ = (this.deltaChain[1].output - this.deltaChain[2].input);
            this.profitFactorX = (this.profitX) / this.deltaChain[0].input * 100;
            this.profitFactorY = (this.profitY) / this.deltaChain[1].input * 100;
            this.profitFactorZ = (this.profitZ) / this.deltaChain[2].input * 100;
            this.profitFactor = this.profitFactorX + this.profitFactorY + this.profitFactorZ;
        }

        if (this.isProfitable()) {
            this.trade();
        }
    }

    isProfitable() {
        if (Route.config('profitAllThree')) {
            return this.profitFactorX > 0
                    && this.profitFactorY > 0
                    && this.profitFactorZ > 0
                    && this.profitFactor >= Route.config('minProfitFactor');
        } else {
            return this.profitFactor >= Route.config('minProfitFactor');
        }
    }

    hasEnoughBalance() {
        for (var i in this.deltaChain) {
            if (!this.deltaChain[i].hasEnoughBalance()) {
                return false;
            }
        }
        return true;
    }

    static possible(currencySymbolX, currencySymbolY, currencySymbolZ) {
        var currencyX = Currency.getBySymbol(currencySymbolX);
        var currencyY = Currency.getBySymbol(currencySymbolY);
        var currencyZ = Currency.getBySymbol(currencySymbolZ);
        if (currencyX && currencyY && currencyZ && currencyX.isAllowed() && currencyY.isAllowed() && currencyZ.isAllowed()) {
            var marketX = currencyX.getMarket(currencyY);
            var marketY = currencyY.getMarket(currencyZ);
            var marketZ = currencyZ.getMarket(currencyX);
            if (marketX && marketY && marketZ && marketX.isAllowed() && marketY.isAllowed() && marketZ.isAllowed()) {
                return new Route(currencyX, currencyY, currencyZ);
            }
        }
    }

    /**
     * Trade the route
     * @returns {undefined}
     */
    async trade() {
        var tradeX = this.deltaChain[0].trade();
        var tradeY = this.deltaChain[1].trade();
        var tradeZ = this.deltaChain[2].trade();

        if (Route.config('trade') && !Route.isTrading() && tradeX.canExecute() && tradeY.canExecute() && tradeZ.canExecute()) {
            await Balance.getAll();
            if (Route.config('trade') && !Route.isTrading() && tradeX.canExecute() && tradeY.canExecute() && tradeZ.canExecute()) {
                Route.trading = true;
                tradeX.execute();
                tradeY.execute();
                tradeZ.execute();

                await Balance.getAll();

                setTimeout(() => {
                    Route.trading = false;
                }, Route.config('nextTradeTimeout'));
            }
        }
    }

    /**
     * Whether there is currently a route trading
     * @returns {Boolean}
     */
    static isTrading() {
        return Route.trading;
    }

    currencyRouteString() {
        var output;
        for (var i in this.deltaChain) {
            output += this.deltaChain[i].inputCurrency.symbol;
        }
        output += ' > ' + this.deltaChain[0].inputCurrency.symbol;
        return output;
    }

    marketRouteString() {
        var output;
        for (var i in this.deltaChain) {
            output += this.deltaChain[i].market.symbol;
        }
        return output;
    }

    currencyTable() {
        return "<table>"
                + "<tr>"
                + "<td>"
                + "<img src=\"" + this.currencyX.logoUrl + "\" />"
                + "</td>"
                + "<td>"
                + this.currencyX.symbol
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td>"
                + "<img src=" + this.currencyY.logoUrl + " />"
                + "</td>"
                + "<td>"
                + this.currencyY.symbol
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td>"
                + "<img src=" + this.currencyZ.logoUrl + " />"
                + "</td>"
                + "<td>"
                + this.currencyZ.symbol
                + "</td>"
                + "</tr>"
                + "</table>";
    }

    inputTable() {
        return "<table>"
                + "<tr>"
                + "<td>"
                + Util.pad(Number.parseFloat(this.deltaChain[0].input))
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td>"
                + Util.pad(Number.parseFloat(this.deltaChain[1].input))
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td>"
                + Util.pad(Number.parseFloat(this.deltaChain[2].input))
                + "</td>"
                + "</tr>"
                + "</table>";
    }

    outputTable() {
        return "<table>"
                + "<tr>"
                + "<td>"
                + Util.pad(Number.parseFloat(this.deltaChain[2].output))
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td>"
                + Util.pad(Number.parseFloat(this.deltaChain[0].output))
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td>"
                + Util.pad(Number.parseFloat(this.deltaChain[1].output))
                + "</td>"
                + "</tr>"
                + "</table>";
    }

    profitTable() {
        return "<table>"
                + "<tr>"
                + "<td>"
                + Util.addPlusOrSpace(Number.parseFloat(this.profitX), 8)
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td>"
                + Util.addPlusOrSpace(Number.parseFloat(this.profitY), 8)
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td>"
                + Util.addPlusOrSpace(Number.parseFloat(this.profitZ), 8)
                + "</td>"
                + "</tr>"
                + "</table>";
    }

    profitFactorTable() {
        return "<table>"
                + "<tr>"
                + "<td>"
                + Util.addPlusOrSpace(Number.parseFloat(this.profitFactorX), 3) + "%"
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td>"
                + Util.addPlusOrSpace(Number.parseFloat(this.profitFactorY), 3) + "%"
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td>"
                + Util.addPlusOrSpace(Number.parseFloat(this.profitFactorZ), 3) + "%"
                + "</td>"
                + "</tr>"
                + "</table>";
    }

    static consoleOutput() {
        var output = "<h3>Triangular Routes (" + Route.list.length + ") " + new Date().toLocaleString() + "</h3>"
                + "<table>"
                + "<tr>"
                + "<th class=\"hidden-xs hidden-s hidden-m display-l display-xl\">Exchange</th>"
                + "<th class=\"hidden-xs hidden-s display-m display-l display-xl\">Type</th>"
                + "<th>Currency</th>"
                + "<th class=\"hidden-xs hidden-s display-m display-l display-xl\">Input</th>"
                + "<th class=\"hidden-xs hidden-s display-m display-l display-xl\">Output</th>"
                + "<th class=\"hidden-xs display-s\">Profit</th>"
                + "<th>Profit Factor</th>"
                + "<th>Net Profit</th>"
                + "</tr>";

        for (var x in Route.list) {
            if (x === 30)
                break;
            if (typeof Route.list[x] === "object") {
                output += Route.list[x].consoleOutput();
            }
        }
        return output + "</table>";
    }

    /**
     * Output that gets logged to console
     * 
     * @returns {String}
     */
    consoleOutput() {
        return "<tr>"
                + "<td class=\"hidden-xs hidden-s hidden-m display-l display-xl\">Bittrex</td>"
                + "<td class=\"hidden-xs hidden-s display-m display-l display-xl\">" + Delta.config("mode") + "</td>"
                + "<td>" + this.currencyTable() + "</td>"
                + "<td class=\"hidden-xs hidden-s display-m display-l display-xl\">" + this.inputTable() + "</td>"
                + "<td class=\"hidden-xs hidden-s display-m display-l display-xl\">" + this.outputTable() + "</td>"
                + "<td class=\"hidden-xs display-s display-m display-l display-xl\">" + this.profitTable() + "</td>"
                + "<td>" + this.profitFactorTable() + "</td>"
                + "<td>" + Util.addPlusOrSpace(this.profitFactor) + "%</td>"
                + "</tr>";
    }
};