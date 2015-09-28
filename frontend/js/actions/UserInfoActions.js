/**
 * Created by khizh on 9/14/2015.
 */
var AppDispatcher = require('../dispatcher/AppDispatcher');
var UserInfoConstants = require('../constants/UserInfoConstants');

var UsersInfoActions = {

    resetUserInfo: function (user) {
        AppDispatcher.dispatch({
            actionType: UserInfoConstants.RESET_INFO,
            user: user
        });
    },

    saveConfig: function (config) {
        AppDispatcher.dispatch({
            actionType: UserInfoConstants.SAVE_CONFIG,
            config: config
        });
    }

};

module.exports = UsersInfoActions;