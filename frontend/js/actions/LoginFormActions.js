/**
 * Created by developer123 on 12.02.15.
 */
var AppDispatcher = require('../dispatcher/AppDispatcher');
var LoginFormConstants = require('../constants/LoginFormConstants');

var LoginFormActions = {
    /**
     * Check specified field
     * @param name
     * @param value field value
     * @param checkType field validation rule
     */
    inputChange: function (name, value, checkType) {
        AppDispatcher.dispatch({
            actionType: LoginFormConstants.LOGIN_FORM_INPUT_CHANGE,
            name: name,
            value: value,
            checkType: checkType
        });
    }

};

module.exports = LoginFormActions;