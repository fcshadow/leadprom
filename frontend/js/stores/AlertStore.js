/**
 * Created by developer123 on 13.02.15.
 */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var AlertConstants = require('../constants/AlertConstants');
var FilesListConstants = require('../constants/FilesListConstants');
var assign = require('object-assign');

var CHANGE_EVENT = 'change';

var alert = {};

function saveError(message, type) {
    alert = {
        message: message,
        type: type,
        alertVisible: true
    }
}
function hideEror() {
    alert = {
        alertVisible: false
    }
}

var AlertStore = assign({}, EventEmitter.prototype, {

    getCurrentInfo: function () {
        return alert;
    },

    emitChange: function () {
        this.emit(CHANGE_EVENT);
    },

    /**
     * @param {function} callback
     */
    addChangeListener: function (callback) {
        this.on(CHANGE_EVENT, callback);
    },

    /**
     * @param {function} callback
     */
    removeChangeListener: function (callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }
});

// Register callback to handle all updates
AppDispatcher.register(function (action) {
    var message, type;

    switch (action.actionType) {

        case AlertConstants.ALERT_SHOW_ERROR:
            message = action.message ? action.message : null;
            type = action.type ? action.type : null;
            if (message && type)
                saveError(message, type);
            AlertStore.emitChange();
            break;
        case FilesListConstants.TOGGLE_VIEW:
        case AlertConstants.ALERT_HIDE_ERROR:
            hideEror();
            AlertStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = AlertStore;