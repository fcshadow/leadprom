/**
 * Created by developer123 on 06.03.15.
 */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ContextMenuConstants = require('../constants/ContextMenuConstants');
var assign = require('object-assign');

var CHANGE_EVENT = 'change';

var contextmenu = {visible: false};

function toggleMenu(isVisible, x, y, info, type, isShared) {
    contextmenu = {
        visible: isVisible,
        X: x,
        Y: y,
        info: info,
        type: type,
        isShared: isShared
    }
}

var ContextMenuStore = assign({}, EventEmitter.prototype, {

    getCurrentInfo: function () {
        return contextmenu;
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

    switch (action.actionType) {

        case ContextMenuConstants.TOGGLE_MENU:
            toggleMenu(action.isVisible, action.x, action.y, action.info, action.type, action.isShared);
            ContextMenuStore.emitChange();
            break;


        default:
        // no op
    }
});

module.exports = ContextMenuStore;