/**
 * Created by khizh on 9/4/2015.
 */
"use strict";
var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var TableConstants = require('../constants/TableConstants');
var AlertActions = require('../actions/AlertActions');
var ModalActions = require('../actions/ModalActions');
var TableActions = require('../actions/TableActions');
var assign = require('object-assign');
var $ = require('jquery');
var Storage = require('../libs/Storage');
var Requests = require('../libs/Requests');
var UserInfoStore = require('../stores/UserInfoStore');
var KudoApiUrl = UserInfoStore.getConfig('api') || "";
var _ = require('underscore');
var CHANGE_EVENT = 'change';

var searchPreg = "";
var selected = [];
var _table = {};

function selectAll() {
    selected = _table.results;
}

function ClearSelection() {
    selected = [];
}

function saveOneSelected(object) {
    if (!(selected.length == 1 && selected[0] == object)) {
        selected = [];
        selected.push(object);
    }
}

function ToggleSelected(object) {
    var res = $.grep(selected, function (e) {
        return e.id == object.id;
    });
    if (!res.length)
        selected.push(object);
    else
        selected = selected.filter(function (element) {
            return element.id != object.id;
        });
}

function saveSearch(searchText) {
    try {
        searchPreg = new RegExp(searchText, 'ig');
    }
    catch (e) {
        searchPreg = searchText;
    }
}

function saveTable(table) {
    _table = table;
}

function cmp(a, b, vtype, mod) {
    if (vtype == "num") {
        a = parseFloat(a);
        b = parseFloat(b);
    }
    if (a > b) return -mod;
    if (a < b) return mod;
    return 0;
}

function sort(type) {
    var order = (_table.fields[type].order == "desc" ? "asc" : "desc"), mod = (_table.fields[type].order == "desc" ? -1 : 1), acmp, bcmp;
    _table.results.sort(function (a, b) {
        if (a.type.length > b.type.length)
            return -1;
        if (a.type.length < b.type.length)
            return 1;
        if (type == "modified") {
            acmp = parseInt(a["updateDate"] || a["creationDate"]);
            bcmp = parseInt(b["updateDate"] || b["creationDate"]);
        } else {
            if (typeof a[type] == "undefined" && typeof b[type] == "undefined") return 0;
            try {
                acmp = a[type].toString().toLowerCase();
            }
            catch (e) {
                acmp = "";
            }
            try {
                bcmp = b[type].toString().toLowerCase();
            }
            catch (e) {
                bcmp = "";
            }
        }
        if (_table.fields[type].type == "num") {
            if (acmp.indexOf('kb') != -1) acmp = parseFloat(acmp) * 1024;
            else if (acmp.indexOf('mb') != -1) acmp = parseFloat(acmp) * 1024 * 1024;
            if (bcmp.indexOf('kb') != -1) bcmp = parseFloat(bcmp) * 1024;
            else if (bcmp.indexOf('mb') != -1) bcmp = parseFloat(bcmp) * 1024 * 1024;
        }
        return cmp(acmp, bcmp, _table.fields[type].type, mod);
    });
    _table.orderedBy = type;
    _table.fields[type].order = order;
}

var TableStore = assign({}, EventEmitter.prototype, {

    isInList: function (name, oldname, type) {
        var res = $.grep(_table.results, function (e) {
            return (e.name == name && e.name !== oldname && e.type == type);
        });
        return res.length;
    },

    isSelected: function (target) {
        var res = _.where(selected, {id: target});
        return res.length;
    },

    getMultiSelected: function () {
        return selected;
    },

    getSearch: function () {
        return searchPreg;
    },

    getTable: function () {
        return _table;
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
    },

    emitChange: function () {
        this.emit(CHANGE_EVENT);
    }

});

// Register callback to handle all updates
TableStore.dispatcherIndex = AppDispatcher.register(function (action) {
    switch (action.actionType) {
        case TableConstants.SAVE_OBJECTS:
            saveTable(action.table);
            TableStore.emitChange();
            break;
        case TableConstants.SEARCH:
            saveSearch(action.search);
            TableStore.emitChange();
            break;
        case TableConstants.SELECT_OBJECT:
            saveOneSelected(action.objectInfo);
            TableStore.emitChange();
            break;
        case TableConstants.MULTI_SELECT:
            ToggleSelected(action.objectInfo);
            TableStore.emitChange();
            break;
        case TableConstants.CLEAR_SELECT:
            ClearSelection();
            TableStore.emitChange();
            break;
        case TableConstants.SELECT_ALL:
            selectAll();
            TableStore.emitChange();
            break;
        case TableConstants.SORT_TABLE:
            sort(action.type);
            TableStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = TableStore;