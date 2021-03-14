var Configurable = require('../../system/Configurable.js');
const binance = require('node-binance-api');

class Binance extends Configurable {}

var _binance = new binance();

_binance.options({
    'APIKEY': Binance.config('apikey'),
    'APISECRET': Binance.config('apisecret')
});

module.exports = _binance;