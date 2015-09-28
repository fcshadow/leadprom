/**
 * Created by khizh on 9/16/2015.
 */
var AppDispatcher = require('../dispatcher/AppDispatcher');
var GenericConstants = require('../constants/GenericConstants');

var GenericActions = {

    changePage: function (pageType) {
        AppDispatcher.dispatch({
            actionType: GenericConstants.CHANGE_PAGE,
            pageType: pageType
        });
    }

};

module.exports = GenericActions;