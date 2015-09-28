/**
 * Created by developer123 on 13.02.15.
 */
var AppDispatcher = require('../dispatcher/AppDispatcher');
var FormLoaderConstants = require('../constants/FormLoaderConstants');

var FormLoaderActions = {

    showLogin: function () {
        AppDispatcher.dispatch({
            actionType: FormLoaderConstants.FORM_LOADER_SHOW_LOGIN
        });
    },

    showSignUp: function () {
        AppDispatcher.dispatch({
            actionType: FormLoaderConstants.FORM_LOADER_SHOW_SIGN_UP
        });
    }

};

module.exports = FormLoaderActions;