const Exchange = require('../Exchange.js');
const Binance = require('node-binance-api');

module.exports = class Binance extends Exchange {

    static async account() {
        const binance = new Binance().options({
            APIKEY: Binance.config('apikey'),
            APISECRET: Binance.config('apisecret')
        });
    }
    static async accountVolume() {

    }
    static async addresses() {

    }
    static async address(currency) {

    }
    static async newaddress(currency) {

    }

    static async balances() {
        const binance = new Binance().options({
            APIKEY: Binance.config('apikey'),
            APISECRET: Binance.config('apisecret')
        });
        binance.openOrders(false, (error, openOrders) => {
            console.info("openOrders()", openOrders);
        });
    }
    static async balance(currency) {

    }
    static async currencies() {

    }
    static async currency(currency) {

    }
    static async openDeposits() {

    }
    static async closedDeposits() {

    }
    static async depositByTxId(id) {

    }
    static async depositId(id) {

    }
    static async markets() {
        const binance = new Binance().options({
            APIKEY: Binance.config('apikey'),
            APISECRET: Binance.config('apisecret')
        });
        console.log(await binance.exchangeInfo());
    }
    static async marketSummaries() {

    }
    static async marketTickers() {
        const binance = new Binance().options({
            APIKEY: Binance.config('apikey'),
            APISECRET: Binance.config('apisecret')
        });
        console.log(await binance.exchangeInfo());
        binance.prices('BNBBTC', (error, ticker) => {
            console.info("Price of BNB: ", ticker.BNBBTC);
        });
    }
    static async marketBySymbol(marketSymbol) {

    }

    static async marketSymbolTicker(marketSymbol) {

    }
    static async marketSymbolSummary(marketSymbol) {

    }
    static async marketSymbolOrderbook(marketSymbol) {

    }
    static async marketSymbolTrades(marketSymbol) {

    }
    static async closedOrder() {

    }
    static async openOrder() {

    }
    static async orderId(id) {

    }
    static async deleteOrder(id) {

    }
    static async newOrder(marketSymbol, direction, type, timeInForce, quantity, ceiling, limit, clientOrderId, useAwards) {

    }
    static async subaccounts() {

    }
    static async sentTransfers() {

    }
    static async receivedTransfers() {

    }
    static async transfersById(id) {

    }
    static async newTransfer(toSubaccountId, requestId, currencySymbol, amount, toMasterAccount) {

    }
    static async openWithdrawals() {

    }
    static async closedWithdrawals() {

    }
    static async withdrawalByTxId(id) {

    }
    static async withdrawalById(id) {

    }
    static async deleteWithdrawals(id) {

    }
    static async getAccountFees() {

    }
    static async getAccountFeesByMarketSymbol(marketSymbol) {

    }
}