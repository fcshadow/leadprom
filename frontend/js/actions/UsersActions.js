/**
 * Created by developer123 on 12.03.15.
 */
var AppDispatcher = require('../dispatcher/AppDispatcher');
var UsersConstants = require('../constants/UsersConstants');

var UsersActions = {

    reloadList: function () {
        AppDispatcher.dispatch({
            actionType: UsersConstants.RELOAD_LIST
        });
    },

    toggleStatus: function (id, newstatus) {
        AppDispatcher.dispatch({
            actionType: UsersConstants.TOGGLE_STATUS,
            id: id,
            newstatus: newstatus
        });
    },

    toggleRole: function (id, newrole) {
        AppDispatcher.dispatch({
            actionType: UsersConstants.TOGGLE_ROLE,
            id: id,
            newrole: newrole
        });
    }

};

module.exports = UsersActions;