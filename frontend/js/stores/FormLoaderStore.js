/**
 * Created by developer123 on 13.02.15.
 */
var React = require('react');
var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var FormLoaderConstants = require('../constants/FormLoaderConstants');
var assign = require('object-assign');
var LoginForm = require('../components/LoginForm');
var SignUpForm = require('../components/SignUpForm');

var CHANGE_EVENT = 'change';

var currentForm = "";

function changeType(type) {
    currentForm = type;
}

var FormLoaderStore = assign({}, EventEmitter.prototype, {

    getCurrentType: function () {
        return currentForm;
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
    var type;

    switch (action.actionType) {

        case FormLoaderConstants.FORM_LOADER_SHOW_LOGIN:
            changeType(<LoginForm />);
            FormLoaderStore.emitChange();
            break;

        case FormLoaderConstants.FORM_LOADER_SHOW_SIGN_UP:
            changeType(<SignUpForm />);
            FormLoaderStore.emitChange();
            break;

        default:
        // no op
    }
});

module.exports = FormLoaderStore;