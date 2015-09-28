/**
 * Created by developer123 on 17.02.15.
 */
var AppDispatcher = require('../dispatcher/AppDispatcher');
var FilesListConstants = require('../constants/FilesListConstants');

var FilesListActions = {

    reloadList: function () {
        AppDispatcher.dispatch({
            actionType: FilesListConstants.RELOAD_LIST
        });
    },

    changeFolder: function (folderName, folderId, viewOnly) {
        AppDispatcher.dispatch({
            actionType: FilesListConstants.CHANGE_FOLDER,
            folderId: folderId,
            folderName: folderName,
            viewOnly: viewOnly
        });
    },

    saveCurrentFiles: function (results) {
        AppDispatcher.dispatch({
            actionType: FilesListConstants.SAVE_FILES,
            results: results
        });
    },

    toggleView: function (name, targetId, viewOnly, pageType, historyUpdate) {
        AppDispatcher.dispatch({
            actionType: FilesListConstants.TOGGLE_VIEW,
            name: name,
            target: targetId,
            viewOnly: viewOnly,
            type: pageType,
            historyUpdate: historyUpdate
        });
    },

    search: function (searchText) {
        AppDispatcher.dispatch({
            actionType: FilesListConstants.SEARCH,
            search: searchText
        });
    },

    selectObject: function (fileInfo) {
        AppDispatcher.dispatch({
            actionType: FilesListConstants.SELECT_OBJECT,
            fileInfo: fileInfo
        });
    },

    addToSelected: function (fileInfo) {
        AppDispatcher.dispatch({
            actionType: FilesListConstants.MULTI_SELECT,
            fileInfo: fileInfo
        });
    },

    removeSelection: function () {
        AppDispatcher.dispatch({
            actionType: FilesListConstants.CLEAR_SELECT
        });
    },

    deleteSelected: function () {
        AppDispatcher.dispatch({
            actionType: FilesListConstants.DELETE_OBJECTS
        });
    },

    eraseSelected: function () {
        AppDispatcher.dispatch({
            actionType: FilesListConstants.ERASE_OBJECTS
        });
    },

    selectAll: function () {
        AppDispatcher.dispatch({
            actionType: FilesListConstants.SELECT_ALL
        });
    },

    restoreSelected: function () {
        AppDispatcher.dispatch({
            actionType: FilesListConstants.RESTORE_OBJECTS
        });
    },

    moveSelected: function (targetId) {
        AppDispatcher.dispatch({
            actionType: FilesListConstants.MOVE_OBJECTS,
            targetId: targetId
        });
    },

    makePath: function (path) {
        AppDispatcher.dispatch({
            actionType: FilesListConstants.MAKE_PATH,
            path: path
        });
    },

    saveTargetFolder: function (targetId) {
        AppDispatcher.dispatch({
            actionType: FilesListConstants.SAVE_TARGET,
            targetId: targetId
        });
    },

    sortList: function (type, order, vtype) {
        AppDispatcher.dispatch({
            actionType: FilesListConstants.SORT_TABLE,
            type: type,
            order: order,
            vtype: vtype
        });
    }
};

module.exports = FilesListActions;