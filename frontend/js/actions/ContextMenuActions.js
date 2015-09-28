/**
 * Created by developer123 on 06.03.15.
 */
var AppDispatcher = require('../dispatcher/AppDispatcher');
var ContextMenuConstants = require('../constants/ContextMenuConstants');

var ContextMenuActions = {

    showMenu: function (X, Y, info, type, isShared) {
        AppDispatcher.dispatch({
            actionType: ContextMenuConstants.TOGGLE_MENU,
            isVisible: true,
            x: X,
            y: Y,
            info: info,
            type: type,
            isShared: isShared
        });
    },

    hideMenu: function () {
        AppDispatcher.dispatch({
            actionType: ContextMenuConstants.TOGGLE_MENU,
            isVisible: false,
            x: 0,
            y: 0
        });
    }

};

module.exports = ContextMenuActions;