/**
 * Created by developer123 on 13.02.15.
 */
var AppDispatcher = require('../dispatcher/AppDispatcher');
var AlertConstants = require('../constants/AlertConstants');

var AlertActions = {

    showError: function (errormessage, type) {
        AppDispatcher.dispatch({
            actionType: AlertConstants.ALERT_SHOW_ERROR,
            message: errormessage,
            type: type
        });
    },

    hideError: function () {
        AppDispatcher.dispatch({
            actionType: AlertConstants.ALERT_HIDE_ERROR
        });
    }

};

module.exports = AlertActions;