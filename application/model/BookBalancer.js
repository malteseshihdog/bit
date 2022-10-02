var Model = require('../../system/Model.js');
var Util = require('../../system/Util.js');


module.exports = class BookBalancer extends Model {

    static Currency = require('./Currency.js');
    static Market = require('./Market.js');
    static OrderBook = require('./OrderBook.js');
    static Balance = require('./Balance.js');
    static Route = require('./Route.js');
    static Trade = require('./Trade.js');
    static Order = require('./Order.js');

    static output = "";

    static async rebalance() {
        console.log('Initializing Balancer...');
        await BookBalancer.Order.get();
        await BookBalancer.closeOrders();
        setTimeout(() => {
            Util.when(() => {
                BookBalancer.Order.get();
                return BookBalancer.Order.list.length !== 0;
            }, BookBalancer.tradeToUsdt, 1000);
        }, 1000);
        setTimeout(() => {
            Util.when(() => {
                BookBalancer.Order.get();
                return BookBalancer.Order.list.length > 0;
            }, BookBalancer.tradeUsdtToAll, 1000);
        }, 5000);
    }

    static async closeOrders() {
        console.log('Close all orders...');
        return await BookBalancer.Order.cancelAll();
    }

    static async tradeToUsdt() {
        console.log('Trade all to USDT..');
        var allowedCurrencies = BookBalancer.Currency.getAllowed();
        for (var i in allowedCurrencies) {
            var currency = BookBalancer.Currency.getBySymbol(allowedCurrencies[i]);
            if (currency.symbol === BookBalancer.Currency.USDT.symbol) {
                continue;
            }
            var balance = BookBalancer.Balance.getByCurrencySymbol(allowedCurrencies[i]);
            var price = currency.getMarket(BookBalancer.Currency.USDT).getMarketPrice(BookBalancer.Currency.USDT);

            console.log("price: " + balance.getTotal());
            console.log("total: " + balance.getTotal());

            var trade = currency.tradeToUsdt(balance.getTotal(), price);
            
            if (trade) {
                try {
                    console.log('Placed trade ' + trade.inputCurrency.symbol + ' -> ' + trade.outputCurrency.symbol + ' ' + trade.getQuantity());
                    await trade.executeMarket((trade) => {
                        console.log('Executed trade ' + trade.inputCurrency.symbol + ' -> ' + trade.outputCurrency.symbol + ' ' + trade.getQuantity());
                    });
                } catch (e) {
                    console.log(e);
                }
            }
        }
        return await BookBalancer.Balance.getAll();
    }

    static async tradeUsdtToAll() {
        console.log('Trade USDT to all..');
        var allowedCurrencies = BookBalancer.Currency.getAllowed();
        var totalCurrencies = allowedCurrencies.length;
        var totalUsdt = BookBalancer.Balance.getByCurrencySymbol('USDT').getTotal();
        console.log(totalUsdt);
        var totalRoutes = BookBalancer.Route.list.length;
        var currencyRoutes = [];
        var currencyDivider = 0;

        for (var i in allowedCurrencies) {
            var currency = BookBalancer.Currency.getBySymbol(allowedCurrencies[i]);
            currencyRoutes[i] = BookBalancer.Route.findByCurrency(currency);
            currencyDivider = currencyDivider + currencyRoutes[i].length;
        }
        for (var i in allowedCurrencies) {
            var currency = BookBalancer.Currency.getBySymbol(allowedCurrencies[i]);
            if (currency.symbol === BookBalancer.Currency.USDT.symbol) {
                continue;
            }
            var usdtQuantity = totalUsdt * (currencyRoutes[i].length / currencyDivider);
            var trade = BookBalancer.Currency.USDT.tradeTo(currency, usdtQuantity);
            if (trade) {
                try {
                    console.log('Placed trade ' + trade.inputCurrency.symbol + ' -> ' + trade.outputCurrency.symbol + ' ' + trade.getQuantity());
                    await trade.executeMarket((trade) => {
                        console.log('Executed trade ' + trade.inputCurrency.symbol + ' -> ' + trade.outputCurrency.symbol + ' ' + trade.getQuantity());
                    });
                } catch (e) {
                    console.log(e);
                }
            }
        }
        return await BookBalancer.Balance.getAll();
    }

    static consoleOutput() {
        return BookBalancer.output;
    }

    static stop() {
        // todo
    }

};