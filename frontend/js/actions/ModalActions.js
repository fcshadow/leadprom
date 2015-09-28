/**
 * Created by developer123 on 17.02.15.
 */
var AppDispatcher = require('../dispatcher/AppDispatcher');
var ModalConstants = require('../constants/ModalConstants');

var ModalActions = {

    createFolder: function () {
        AppDispatcher.dispatch({
            actionType: ModalConstants.CREATE_FOLDER_SHOW,
            caption: "Create new folder"
        });
    },

    createFile: function (templates) {
        AppDispatcher.dispatch({
            actionType: ModalConstants.CREATE_FILE_SHOW,
            caption: "Create new drawing",
            templates: templates
        });
    },

    shareManagement: function (id, type, name, owner) {
        AppDispatcher.dispatch({
            actionType: ModalConstants.SHARE_MANAGEMENT_SHOW,
            caption: "Share " + name,
            id: id,
            type: type,
            owner: owner
        });
    },

    changeEditor: function (file) {
        AppDispatcher.dispatch({
            actionType: ModalConstants.CHANGE_EDITOR_SHOW,
            caption: "Change editor server",
            file: file
        });
    },

    requestAccess: function (fileId) {
        AppDispatcher.dispatch({
            actionType: ModalConstants.REQUEST_ACCESS_SHOW,
            caption: "Request access",
            fileId: fileId
        });
    },

    restoreDuplicates: function (duplicates) {
        AppDispatcher.dispatch({
            actionType: ModalConstants.RESTORE_DUPLICATES_SHOW,
            caption: "Restore duplicates",
            duplicates: duplicates
        });
    },

    forgotPassword: function () {
        AppDispatcher.dispatch({
            actionType: ModalConstants.FORGOT_PASSWORD_SHOW,
            caption: "Forgot password"
        });
    },

    deleteObject: function () {
        AppDispatcher.dispatch({
            actionType: ModalConstants.DELETE_SHOW,
            caption: "Delete file(s)/folder(s)"
        });
    },

    eraseObjects: function () {
        AppDispatcher.dispatch({
            actionType: ModalConstants.ERASE_SHOW,
            caption: "Erase file(s)/folder(s)"
        });
    },

    moveObjects: function () {
        AppDispatcher.dispatch({
            actionType: ModalConstants.MOVE_OBJECTS_SHOW,
            caption: "Move objects"
        });
    },

    versionsManagement: function (id, type) {
        AppDispatcher.dispatch({
            actionType: ModalConstants.VERSIONS_MANAGEMENT_SHOW,
            caption: "Manage versions",
            id: id,
            type: type
        });
    },

    showProfile: function () {
        AppDispatcher.dispatch({
            actionType: ModalConstants.PROFILE_SETTINGS_SHOW,
            caption: "Profile settings"
        });
    }

};

module.exports = ModalActions;