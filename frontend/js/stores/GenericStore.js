/**
 * Created by khizh on 9/16/2015.
 */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var GenericConstants = require('../constants/GenericConstants');
var assign = require('object-assign');

var CHANGE_EVENT = 'change';
var _page = "";

function savePageType(PageType) {
    _page = PageType;
}

var GenericStore = assign({}, EventEmitter.prototype, {

    getPageType: function () {
        return _page
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
        case GenericConstants.CHANGE_PAGE:
            savePageType(action.pageType);
            GenericStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = GenericStore;