/**
 * Created by developer123 on 13.02.15.
 */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var TemplatesConstants = require('../constants/TemplatesConstants');
var assign = require('object-assign');
var _ = require('underscore');

var CHANGE_EVENT = 'change';

var TemplatesStore = assign({}, EventEmitter.prototype, {

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

    switch (action.actionType) {
        case TemplatesConstants.RELOAD_TEMPLATES:
            TemplatesStore.emitChange();
            break;

        default:
        // no op
    }
});

module.exports = TemplatesStore;