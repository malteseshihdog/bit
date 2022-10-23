var Model = require('../../system/Model.js');
var Exchange = require('./Exchange.js');

module.exports = class HasExchange extends Model {
    
    /**
     * @property {Exchange} exchange
     */
    exchange = null;
    
    construct(exchange) {
        if(!(exchange instanceof Exchange)) {
            throw new Error("Exchange not an instance of an exchange");
        }
        
        this.exchange = exchange;
    }
    
};