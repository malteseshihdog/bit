var Model = require('../../system/Model.js');
var Currency = require('./Currency.js');


module.exports = class Exchange extends Model {

    static name;
    
    static socket = null;
    
    /**
     * @static
     * @property {Currency} BTC 
     */
    static BTC;

    /**
     * @static
     * @property {Currency} USDT 
     */
    static USDT;
    
    static Currency;
    static Market;
    static OrderBook;
    static Balance;
    static Route;
    static Trade;
    static Order;
    
    static init() {
        throw Error("Exhcange init() must be implemnted.");
    }

    static async account() {

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

    }
    static async marketSummaries() {

    }
    static async marketTickers() {

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
};