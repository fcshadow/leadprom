/**
 * Created by khizh on 9/14/2015.
 */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var UsersInfoConstants = require('../constants/UserInfoConstants');
var assign = require('object-assign');

var CHANGE_EVENT = 'change';
var _user = {},_config={};

function saveUserInfo(userInfo) {
    _user = {
        id: userInfo._id,
        enabled: userInfo.enabled,
        name: userInfo.name,
        surname: userInfo.surname,
        email: userInfo.email,
        username: userInfo.username,
        isAdmin: userInfo.roles[0] == "1"
    };
}

function saveConfig(config) {
    _config=config;
}

var UsersInfoStore = assign({}, EventEmitter.prototype, {

    getConfig: function (name) {
        if (!name || !_config.hasOwnProperty(name)) return _config;
        else return _config[name];
    },

    getUserInfo: function (name) {
        if (!name || !_user.hasOwnProperty(name)) return _user;
        else return _user[name];
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

UsersInfoStore.setMaxListeners(0);

// Register callback to handle all updates
AppDispatcher.register(function (action) {

    switch (action.actionType) {
        case UsersInfoConstants.RESET_INFO:
            saveUserInfo(action.user);
            UsersInfoStore.emitChange();
            break;

        case UsersInfoConstants.SAVE_CONFIG:
            saveConfig(action.config);
            UsersInfoStore.emitChange();
            break;

        default:
        // no op
    }
});

module.exports = UsersInfoStore;