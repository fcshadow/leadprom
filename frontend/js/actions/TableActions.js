/**
 * Created by khizh on 9/4/2015.
 */
var AppDispatcher = require('../dispatcher/AppDispatcher');
var TableConstants = require('../constants/TableConstants');

var TableActions = {

    saveObjects: function (table) {
        AppDispatcher.dispatch({
            actionType: TableConstants.SAVE_OBJECTS,
            table: table
        });
    },

    search: function (searchText) {
        AppDispatcher.dispatch({
            actionType: TableConstants.SEARCH,
            search: searchText
        });
    },

    selectObject: function (objectInfo) {
        AppDispatcher.dispatch({
            actionType: TableConstants.SELECT_OBJECT,
            objectInfo: objectInfo
        });
    },

    addToSelected: function (objectInfo) {
        AppDispatcher.dispatch({
            actionType: TableConstants.MULTI_SELECT,
            objectInfo: objectInfo
        });
    },

    removeSelection: function () {
        AppDispatcher.dispatch({
            actionType: TableConstants.CLEAR_SELECT
        });
    },

    selectAll: function () {
        AppDispatcher.dispatch({
            actionType: TableConstants.SELECT_ALL
        });
    },

    sortList: function (type) {
        AppDispatcher.dispatch({
            actionType: TableConstants.SORT_TABLE,
            type: type
        });
    }
};

module.exports = TableActions;