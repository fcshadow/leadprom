/**
 * Created by developer123 on 11.02.15.
 */
var Dispatcher=require('flux').Dispatcher;

var dispatcher = new Dispatcher();
var actionQueue = [];
var isProcessing = false;

function queueAction(payload) {
    actionQueue.push(payload);
    if (!isProcessing)
        startProcessing();
}

function startProcessing() {
    isProcessing = true;
    while (actionQueue.length > 0) {
        if (dispatcher.isDispatching())
            return setTimeout(startProcessing, 100); // Be safe; Avoid an Invariant error from Flux
        var payload = actionQueue.shift();
        dispatcher.dispatch(payload)
    }
    isProcessing = false
}

var AppDispatcher = {
    isProcessing: function() {
    return isProcessing
},

dispatch:function(payload) {
    console.info(payload);
    queueAction(payload)
},

register:function(callback) {
    return dispatcher.register(callback)
}
};

module.exports = AppDispatcher;