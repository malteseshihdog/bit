var SecurityController = require('./SecurityController,js');
var Util = require('../../system/Util.js');

module.exports = class BalanceController extends SecurityController {

    static Currency = require('../model/Currency.js');
    static Balance = require('../model/Balance.js');
    static Route = require('../model/Route.js');
    static Order = require('../model/Order.js');

    static output = "";

    static async rebalance() {
        console.log('Initializing Balancer...');
        await BalanceController.Order.get();
        await BalanceController.closeOrders();
        setTimeout(() => {
            Util.when(() => {
                BalanceController.Order.get();
                return BalanceController.Order.list.length !== 0;
            }, BalanceController.tradeToUsdt, 1000);
        }, 1000);
        setTimeout(() => {
            Util.when(() => {
                BalanceController.Order.get();
                return BalanceController.Order.list.length > 0;
            }, BalanceController.tradeUsdtToAll, 1000);
        }, 5000);
    }

    static async closeOrders() {
        console.log('Close all orders...');
        return await BalanceController.Order.cancelAll();
    }

    static async tradeToUsdt() {
        console.log('Trade all to USDT..');
        var allowedCurrencies = BalanceController.Currency.getAllowed();
        for (var i in allowedCurrencies) {
            var currency = BalanceController.Currency.getBySymbol(allowedCurrencies[i]);
            if (currency.symbol === BalanceController.Currency.USDT.symbol) {
                continue;
            }
            var balance = BalanceController.Balance.getByCurrencySymbol(allowedCurrencies[i]);
            var price = currency.getMarket(BalanceController.Currency.USDT).getMarketPrice(BalanceController.Currency.USDT);

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
        return await BalanceController.Balance.getAll();
    }

    static async tradeUsdtToAll() {
        console.log('Trade USDT to all..');
        var allowedCurrencies = BalanceController.Currency.getAllowed();
        var totalCurrencies = allowedCurrencies.length;
        var totalUsdt = BalanceController.Balance.getByCurrencySymbol('USDT').getTotal();
        console.log(totalUsdt);
        var totalRoutes = BalanceController.Route.list.length;
        var currencyRoutes = [];
        var currencyDivider = 0;

        for (var i in allowedCurrencies) {
            var currency = BalanceController.Currency.getBySymbol(allowedCurrencies[i]);
            currencyRoutes[i] = BalanceController.Route.findByCurrency(currency);
            currencyDivider = currencyDivider + currencyRoutes[i].length;
        }
        for (var i in allowedCurrencies) {
            var currency = BalanceController.Currency.getBySymbol(allowedCurrencies[i]);
            if (currency.symbol === BalanceController.Currency.USDT.symbol) {
                continue;
            }
            var usdtQuantity = totalUsdt * (currencyRoutes[i].length / currencyDivider);
            var trade = BalanceController.Currency.USDT.tradeTo(currency, usdtQuantity);
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
        return await BalanceController.Balance.getAll();
    }

    static consoleOutput() {
        return BalanceController.output;
    }

    static stop() {
        // todo
    }

    static async actionRebalance(uriParts, request, response) {
        if (BalanceController.authenticate(uriParts, request, response)) {
            await BalanceController.rebalance();
        }
        response.redirect('/');
    }

};