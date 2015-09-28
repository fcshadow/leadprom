/**
 * Created by developer123 on 17.02.15.
 */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ModalConstants = require('../constants/ModalConstants');
var assign = require('object-assign');
var Storage = require('../libs/Storage');
var Requests = require('../libs/Requests');
var UserInfoStore = require('../stores/UserInfoStore');
var KudoApiUrl = UserInfoStore.getConfig('api');
var CHANGE_EVENT = 'change';

var modal = {};

function saveInner(caption, type, additionalInfo) {
    modal = {
        caption: caption,
        type: type,
        additionalInfo: additionalInfo
    }
}

var ModalStore = assign({}, EventEmitter.prototype, {

    getCurrentInfo: function () {
        return modal;
    },

    emitChange: function () {
        this.emit(CHANGE_EVENT);
    },

    /**
     * @param {function} callback
     */
    addChangeListener: function (callback) {
        this.on(CHANGE_EVENT, callback);
    },

    /**
     * @param {function} callback
     */
    removeChangeListener: function (callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }
});

// Register callback to handle all updates
AppDispatcher.register(function (action) {
    var caption, linkedFunction;

    switch (action.actionType) {

        case ModalConstants.CREATE_FOLDER_SHOW:
            caption = action.caption.trim();
            linkedFunction = action.linkedFunction;
            if (caption !== '') {
                saveInner(caption, "NEW_FOLDER", null);
            }
            ModalStore.emitChange();
            break;
        case ModalConstants.CREATE_FILE_SHOW:
            caption = action.caption.trim();
            if (caption !== '') {
                saveInner(caption, "NEW_FILE", {templates: action.templates});
            }
            ModalStore.emitChange();
            break;
        case ModalConstants.SHARE_MANAGEMENT_SHOW:
            caption = action.caption.trim();
            if (caption !== '') {
                saveInner(caption, "SHARE", {objId: action.id, objType: action.type, objOwner: action.owner});
            }
            ModalStore.emitChange();
            break;
        case ModalConstants.VERSIONS_MANAGEMENT_SHOW:
            /*caption=action.caption.trim();
             if (caption !== '') {
             saveInner(caption,"VERSIONS",action.linkedFunction,action.id,action.type,null,null);
             }
             ModalStore.emitChange();*/
            console.warn("Versions control aren't supported in ARES Kudo");
            break;
        case ModalConstants.REQUEST_ACCESS_SHOW:
            caption = action.caption.trim();
            if (caption !== '') {
                saveInner(caption, "REQUEST_ACCESS", {fileId: action.fileId});
            }
            ModalStore.emitChange();
            break;
        case ModalConstants.RESTORE_DUPLICATES_SHOW:
            caption = action.caption.trim();
            if (caption !== '') {
                saveInner(caption, "RESTORE_DUPLICATES", {duplicates: action.duplicates});
            }
            ModalStore.emitChange();
            break;
        case ModalConstants.FORGOT_PASSWORD_SHOW:
            caption = action.caption.trim();
            if (caption !== '') {
                saveInner(caption, "FORGOT_PASSWORD", null);
            }
            ModalStore.emitChange();
            break;
        case ModalConstants.CHANGE_EDITOR_SHOW:
            caption = action.caption.trim();
            if (caption !== '') {
                saveInner(caption, "CHANGE_EDITOR", {file: action.file});
            }
            ModalStore.emitChange();
            break;
        case ModalConstants.DELETE_SHOW:
            caption = action.caption.trim();
            if (caption !== '') {
                saveInner(caption, "DELETE_OBJECT", null);
            }
            ModalStore.emitChange();
            break;
        case ModalConstants.ERASE_SHOW:
            caption = action.caption.trim();
            if (caption !== '') {
                saveInner(caption, "ERASE_OBJECTS", null);
            }
            ModalStore.emitChange();
            break;
        case ModalConstants.PROFILE_SETTINGS_SHOW:
            caption = action.caption.trim();
            if (caption !== '') {
                Requests.sendRequest(KudoApiUrl + '/users', 'GET', null, JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (answer) {
                    saveInner(caption, "PROFILE_SETTINGS", {user: answer.results[0]});
                    ModalStore.emitChange();
                });
            }
            break;
        case ModalConstants.MOVE_OBJECTS_SHOW:
            caption = action.caption.trim();
            if (caption !== '') {
                saveInner(caption, "MOVE_OBJECTS", null);
            }
            ModalStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = ModalStore;