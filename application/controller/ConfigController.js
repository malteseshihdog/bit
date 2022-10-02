var SecurityController = require('./SecurityController.js');
var ArbitrageController = require('./ArbitrageController.js');
var SocketServer = require('../../system/SocketServer.js');
var View = require('../../system/View.js');
var Route = require('../model/Route.js');
var Delta = require('../model/Delta.js');
var User = require('../model/User.js');
var Trade = require('../model/Trade.js');
var Bittrex = require('../../exchange/bittrex/Bittrex.js');
var Security = require('../../system/Security.js');

module.exports = class ConfigController extends SecurityController {

    static actionIndex(uriParts, request, response) {
        View.render('template/base', {socketServerPort: SocketServer.config('port')}, response);
    }

    static actionConfig(uriParts, request, response) {
        if (ConfigController.authenticate(uriParts, request, response)) {
            var confirmPasswordError = false;
            var passwordNotMatchError = false;

            if (request.body.trade !== undefined) {
                Route.setConfig('trade', Array.isArray(request.body.trade) ? true : false);
            }
            if (request.body.minInputBtc) {
                Route.setConfig('minInputBtc', parseFloat(request.body.minInputBtc));
            }
            if (request.body.minProfitFactor) {
                Route.setConfig('minProfitFactor', parseFloat(request.body.minProfitFactor));
            }
            if (request.body.profitAllThree !== undefined) {
                Route.setConfig('profitAllThree', Array.isArray(request.body.profitAllThree) ? true : false);
            }
            if (request.body.nextTradeTimeout) {
                Route.setConfig('nextTradeTimeout', parseInt(request.body.nextTradeTimeout));
            }
            if (request.body.orderType) {
                Trade.setConfig('orderType', request.body.orderType);
            }
            if (request.body.mode) {
                Delta.setConfig('mode', request.body.mode);
                if(request.body.mode !== 'market') {
                    Trade.setConfig('orderType', 'LIMIT'); // prevent perople from configuring a money drain
                }
            }
            if (request.body.fix) {
                Delta.setConfig('fix', parseFloat(request.body.fix));
            }
            if (request.body.password) {
                if (!request.body.confirmPassword) {
                    confirmPasswordError = true;
                }
                if (request.body.confirmPassword && request.body.password !== request.body.confirmPassword) {
                    passwordNotMatchError = true;
                }
                if (!confirmPasswordError && !passwordNotMatchError) {
                    Security.shake();
                    User.setConfig('password', Security.hash(request.body.password));
                    User.commitConfig();
                }
                Delta.setConfig('fix', request.body.fix);
            }
            if (request.body.apiKey) {
                Bittrex.setConfig('apikey', request.body.apiKey);
            }
            if (request.body.apiSecret) {
                Bittrex.setConfig('apisecret', request.body.apiSecret);
            }

            Bittrex.setConfig('subaccountid', request.body.subAccountId);
            Bittrex.commitConfig();
            Route.commitConfig();
            Trade.commitConfig();
            Delta.commitConfig();
            console.log('Update config...');
            setTimeout(function () {
                View.render('config/config', {trade: Trade, route: Route, delta: Delta, bittrex: Bittrex, confirmPasswordError: confirmPasswordError, passwordNotMatchError: passwordNotMatchError}, response);
            }, 2000);
        } else {
            ConfigController.reload(uriParts, request, response);
        }
    }

};