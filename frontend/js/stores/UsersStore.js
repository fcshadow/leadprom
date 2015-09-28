/**
 * Created by developer123 on 12.03.15.
 */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var UsersConstants = require('../constants/UsersConstants');
var TableStore = require('../stores/TableStore');
var TableActions = require('../actions/TableActions');
var assign = require('object-assign');

var CHANGE_EVENT = 'change';
var _table = TableStore.getTable();

function toggleStatus(id, newstatus) {
    _table = TableStore.getTable();
    for (var i in _table.results) {
        if (_table.results.hasOwnProperty(i))
            if (_table.results[i].id == id) {
                _table.results[i].enabled = newstatus;
                break;
            }
    }
}
function toggleRole(id, newrole) {
    _table = TableStore.getTable();
    for (var i in _table.results) {
        if (_table.results.hasOwnProperty(i))
            if (_table.results[i].id == id) {
                _table.results[i].isAdmin = newrole;
                break;
            }
    }
}


var UsersStore = assign({}, EventEmitter.prototype, {

    getTable: function () {
        return _table
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
        case UsersConstants.RELOAD_LIST:
            UsersStore.emitChange();
            break;
        case UsersConstants.TOGGLE_STATUS:
            toggleStatus(action.id, action.newstatus);
            UsersStore.emitChange();
            break;
        case UsersConstants.TOGGLE_ROLE:
            toggleRole(action.id, action.newrole);
            UsersStore.emitChange();
            break;

        default:
        // no op
    }
});

module.exports = UsersStore;