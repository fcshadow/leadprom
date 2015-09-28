/**
 * Created by developer123 on 17.02.15.
 */
"use strict";
var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var FilesListConstants = require('../constants/FilesListConstants');
var AlertActions = require('../actions/AlertActions');
var TableStore = require('../stores/TableStore');
var ModalActions = require('../actions/ModalActions');
var FilesListActions = require('../actions/FilesListActions');
var TableActions = require('../actions/TableActions');
var assign = require('object-assign');
var $ = require('jquery');
var Storage = require('../libs/Storage');
var Requests = require('../libs/Requests');
var MainFunctions = require('../libs/MainFunctions');
var UserInfoStore = require('../stores/UserInfoStore');
var KudoApiUrl = UserInfoStore.getConfig('api') || "";
var _ = require('underscore');
var CHANGE_EVENT = 'change';
var SELECT_EVENT = 'select';
var SORT_EVENT = 'sort';

var FileList = {};
var restoreList = {};
var currentFolder = {folderId: "-1", folderName: "~", additional: {}};
var currentTrashFolder = {folderId: "-1", folderName: "~"};
var folderPath = [currentFolder];
var trashFolderPath = [currentTrashFolder];
var files = [];
var mode = "browser";
var currentFile = "";
var searchPreg = "";
var selectedMove = "";

function moveToFolder(targetId) {
    var currentIndexes = {};
    $.each(TableStore.getMultiSelected(), function (i, element) {
        var json = {}, re = /(?:\.([^.]+))?$/, cloneReg = /\(([^)]+)\)/, filename = element.name;
        var moveName = filename.substr(0, filename.lastIndexOf('.')) || filename, currentCopy = cloneReg.exec(moveName);
        moveName = moveName.substr(0, moveName.indexOf('(')) || moveName;
        currentIndexes[moveName] = (currentIndexes[moveName] + 1) || 0;
    });
    $.each(TableStore.getMultiSelected(), function (i, element) {
        var json = {}, re = /(?:\.([^.]+))?$/, cloneReg = /\(([^)]+)\)/, filename = element.name;
        var moveName = filename.substr(0, filename.lastIndexOf('.')) || filename, currentCopy = cloneReg.exec(moveName);
        if (currentCopy && moveName.indexOf('(') == -1)
            json.fileName = moveName.substr(0, moveName.lastIndexOf('(')) + "(" + (parseInt(currentCopy[1]) + 1) + ")" + re.exec(filename)[0];
        else json.fileName = moveName + re.exec(filename)[0];
        var flag = false, j = currentIndexes[moveName];
        Requests.sendRequest(KudoApiUrl + '/folders/' + targetId, 'GET', [], JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (answer) {
            while (!flag) {
                if (!answer.results[element.type + 's'].length) flag = true;
                else
                    $.each(answer.results[element.type + 's'], function (key, value) {
                        if (json.fileName == value.name || json.fileName == value.filename) {
                            j++;
                            json.fileName = moveName + "(" + j + ")" + re.exec(filename)[0];
                            flag = false;
                            return flag;
                        } else flag = true;
                    });
            }
            if (flag) {
                var url = KudoApiUrl + '/' + element.type + 's/' + element.id;
                var data = {}, json2 = {};
                if (element.type == "folder")
                    data.parentId = targetId;
                else
                    data.folderId = targetId;
                Requests.sendRequest(url, "PUT", JSON.stringify(data), JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (answer) {
                    if (answer.status != 'ok')
                        AlertActions.showError(answer.error, "danger");
                    else {
                        AlertActions.showError("File(s)/folder(s) have been successfully moved to target folder", "success");
                        if (element.type == 'folder') json2.folderName = json.fileName; else json2.fileName = json.fileName;
                        var url = KudoApiUrl + "/" + ((element.type == "folder") ? "folders" : "files") + "/" + element.id;
                        Requests.sendRequest(url, "PUT", JSON.stringify(json2), JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (data) {
                            if (data.status != 'ok')
                                AlertActions.showError(data.error, "danger");
                            else FilesListActions.reloadList();
                        });
                    }
                })
            }
        });
    });
    TableActions.removeSelection();
}

function deleteSelected() {
    var mcount = TableStore.getMultiSelected().length, alertMessage = "File(s)/folder(s) have been successfully deleted", alertType = "success";
    $.each(TableStore.getMultiSelected(), function (i, element) {
        var url = KudoApiUrl + '/' + element.type + 's/' + element.id + '/trash';
        Requests.sendRequest(url, "PUT", [], JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (data) {
            if (data.status != 'ok') {
                if (alertType == "success") alertMessage = "Problems with deleting file(s)/folder(s): \r\n";
                alertMessage += data.error;
                alertType = "danger";
            }
            if (!--mcount) {
                FilesListStore.emitChange();
                AlertActions.showError(alertMessage, alertType);
            }
        });
    });
}

function eraseSelected() {
    var mcount = TableStore.getMultiSelected().length, alertMessage = "File(s)/folder(s) have been successfully erased", alertType = "success";
    $.each(TableStore.getMultiSelected(), function (i, element) {
        var url = KudoApiUrl + '/' + element.type + 's/' + element.id;
        Requests.sendRequest(url, "DELETE", [], JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (data) {
            if (data.status != 'ok') {
                if (alertType == "success") alertMessage = "Problems with deleting file(s)/folder(s): \r\n";
                alertMessage += data.error;
                alertType = "danger";
            }
            if (!--mcount) {
                FilesListStore.emitChange();
                AlertActions.showError(alertMessage, alertType);
            }
        });
    });
}

function restoreSelected() {
    var count = TableStore.getMultiSelected().length, message = "", infoType = "success", duplicates = [];
    FileList = {};
    restoreList = {};
    _.each(TableStore.getMultiSelected(), function (elem) {
        restoreList[elem.id] = elem;
        restoreList[elem.id]['restore'] = true;
        restoreList[elem.id]['restoreName'] = elem['name'] || elem['filename'];
        restoreList[elem.id]['restoreNameFlag'] = true;
    });
    $.each(TableStore.getMultiSelected(), function (i, element) {
        var resobject = _.find(files, function (object) {
            return (object.id == element.id)
        });
        var url;
        if (resobject.parent == "-1")
            url = "/files";
        else
            url = "/folders/" + resobject.parent;
        url = KudoApiUrl + url;
        Requests.sendRequest(url, "GET", [], JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (data) {
            if (data.status != 'ok') {
                message += data.status + '\r\n';
                infoType = "danger";
            }
            else {
                FileList[resobject.parent] = MainFunctions.mergeLists(FileList[resobject.parent] || {}, data.results);
                var state = true;
                $.each(FileList[resobject.parent][element.type + 's'], function (key, value) {
                    if (value[(element.type + 's' == 'files') ? 'filename' : 'name'] == resobject.name) state = false;
                });
                if (state)
                    FileList[resobject.parent][element.type + 's'].push({name: element.name, filename: element.name});
                else {
                    message += "You're trying to restore " + element.type + " with name, already used in destination folder" + '\r\n';
                    infoType = "danger";
                    element.restoreNameFlag = false;
                    duplicates.push(element);
                }
                if (!--count) {
                    if (duplicates.length) ModalActions.restoreDuplicates(duplicates);
                    else RestoreApproved();
                }
            }
        });
    });
}

function RestoreApproved() {
    var message = "", infoType = "success", count = restoreList.length;
    _.each(FilesListStore.getRestoreFlag(), function (element) {
        if (element.restore) {
            var resurl = KudoApiUrl + '/' + element.type + 's/' + element.id + '/untrash';
            Requests.sendRequest(resurl, "PUT", [], JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (data) {
                if (data.status != 'ok') {
                    message += data.status + '\r\n';
                    infoType = "danger";
                    return false;
                } else {
                    var oldname = element.name || element.filename;
                    if (oldname !== element.restoreName) {
                        var json = {};
                        if (element.type == 'folder') json.folderName = element.restoreName; else json.fileName = element.restoreName;
                        Requests.sendRequest(KudoApiUrl + "/" + (element.type + 's') + "/" + element.id, "PUT", JSON.stringify(json), JSON.parse(UserInfoStore.getConfig('defaultheaders')));
                    }
                }
                if (!--count) {
                    AlertActions.showError(message || "File(s)/folder(s) have been successfully restored", infoType);
                    FilesListStore.emitChange();
                }
            });
        }
    });
}

function toggleMode(name, target, viewOnly, type, historyUpdate) {
    if (type == "viewer") {
        var ext = MainFunctions.getIconClassName(null, "file", name);
        if (ext == "dwg" || ext == "dwt" || ext == "dxf") {
            mode = type;
            currentFile = {
                id: target,
                name: name,
                viewOnly: viewOnly
            };
            if (target)
                history.pushState({
                    name: name,
                    id: target,
                    mode: type,
                    viewOnly: viewOnly
                }, "ARES Kudo - " + name, "?page=files&file=" + target + "&mode=viewer");
        }
    }
    else if (type == "browser" || type == "trash") {
        mode = type;
        setFolder(target, name, historyUpdate, {viewOnly: viewOnly});
    }
    document.title = "ARES Kudo - " + name;
    TableActions.removeSelection();
}

function saveFiles(results) {
    files = results;
}

function makePath(path) {
    var lastFolder = path[path.length - 1];
    currentFolder = {
        folderId: lastFolder.folderId,
        folderName: lastFolder.folderName,
        additional: {viewOnly: lastFolder.viewOnly}
    };
    folderPath = path;
    $.each(folderPath, function (i, elem) {
        history.pushState({
            folderId: elem.folderId,
            folderName: elem.folderName,
            mode: "browser",
            viewOnly: elem.viewOnly
        }, "ARES Kudo - folder " + elem.folderName, "?page=files&folder=" + elem.folderId + "&mode=" + FilesListStore.getCurrentState());
        document.title = "ARES Kudo - " + elem.folderName;
    });
}

function setFolder(newFolderId, newFolderName, historyUpdate, additional) {
    searchPreg = new RegExp("", 'ig');
    if (typeof historyUpdate == "undefined") historyUpdate = true;
    var res = [], newfolder = [];
    if (mode != "trash") {
        currentFolder = {
            folderId: newFolderId,
            folderName: newFolderName,
            additional: additional
        };
        res = _.where(folderPath, {folderId: newFolderId});
        if (!res.length) {
            folderPath.push(currentFolder);
            if (historyUpdate) history.pushState({
                name: newFolderName,
                id: newFolderId,
                mode: FilesListStore.getCurrentState(),
                viewOnly: additional.viewOnly
            }, "ARES Kudo - folder " + newFolderName, "?page=files&folder=" + newFolderId + "&mode=" + FilesListStore.getCurrentState() + "&name=" + newFolderName);
        } else {
            newfolder = [];
            newfolder.push({folderId: "-1", folderName: "~"});
            $.each(folderPath, function (i, element) {
                if (element.folderId !== newFolderId && element.folderId !== '-1')
                    newfolder.push({
                        folderId: element.folderId,
                        folderName: element.folderName,
                        additional: element.additional
                    });
                else if (element.folderId === newFolderId) return false;
            });
            if (newFolderId != "-1") newfolder.push(currentFolder);
            folderPath = newfolder;
            if (historyUpdate) history.pushState({
                name: newFolderName,
                id: newFolderId,
                mode: FilesListStore.getCurrentState(),
                viewOnly: additional.viewOnly
            }, "ARES Kudo - folder " + newFolderName, "?page=files&folder=" + newFolderId + "&mode=" + FilesListStore.getCurrentState() + "&name=" + newFolderName);
        }
        document.title = "ARES Kudo - " + newFolderName;
    } else {
        currentTrashFolder = {
            folderId: newFolderId,
            folderName: newFolderName,
            additional: additional
        };
        res = _.where(trashFolderPath, {folderId: newFolderId});
        if (!res.length) {
            trashFolderPath.push(currentTrashFolder);
            if (historyUpdate) history.pushState({
                name: newFolderName,
                id: newFolderId,
                mode: FilesListStore.getCurrentState(),
                viewOnly: additional.viewOnly
            }, "ARES Kudo - folder " + newFolderName, "?page=files&folder=" + newFolderId + "&mode=" + FilesListStore.getCurrentState() + "&name=" + newFolderName);
        } else {
            newfolder = [];
            newfolder.push({folderId: "-1", folderName: "~"});
            $.each(trashFolderPath, function (i, element) {
                if (element.folderId !== newFolderId && element.folderId !== '-1')
                    newfolder.push({folderId: element.folderId, folderName: element.folderName});
                else if (element.folderId === newFolderId) return false;
            });
            if (newFolderId != "-1") newfolder.push(currentTrashFolder);
            trashFolderPath = newfolder;
            if (historyUpdate) history.pushState({
                name: newFolderName,
                id: newFolderId,
                mode: FilesListStore.getCurrentState(),
                viewOnly: additional.viewOnly
            }, "ARES Kudo - folder " + newFolderName, "?page=files&folder=" + newFolderId + "&mode=" + FilesListStore.getCurrentState() + "&name=" + newFolderName);
        }
        document.title = "ARES Kudo - trash (" + newFolderName + ")";
    }
    TableActions.removeSelection();
}

function cmp(a, b, vtype, mod) {
    if (vtype == "num") {
        a = parseFloat(a);
        b = parseFloat(b);
    }
    if (a > b) return -mod;
    if (a < b) return mod;
    return 0;
}

function saveTarget(targetId) {
    selectedMove = targetId;
}

var FilesListStore = assign({}, EventEmitter.prototype, {

    isSelected: function (target) {
        var res = _.where(TableStore.getMultiSelected(), {id: target});
        return res.length;
    },

    isInList: function (objName, prevName, objType) {
        var res = $.grep(files, function (e) {
            return (e.name == objName && e.name !== prevName && e.type == objType);
        });
        return res.length;
    },

    isAnyShared: function () {
        var answer = false;
        _.each(TableStore.getMultiSelected(), function (selectedElement) {
            _.some(files, function (fileElement) {
                if (selectedElement.id == fileElement.id && fileElement.shared && fileElement.owner != UserInfoStore.getConfig('username')) answer = true;
            });
        });
        return answer;
    },

    saveCurrentFile: function (fileInfo) {
        currentFile = {
            id: fileInfo.id,
            name: fileInfo.name,
            viewOnly: fileInfo.viewOnly
        };
    },

    getRestoreFlag: function () {
        var torestore = [];
        _.each(restoreList, function (element) {
            if (element.restore && element.restoreNameFlag) torestore.push(element);
        });
        return torestore;
    },

    changeRestoreObject: function (fileId, restoreName, restoreFlag) {
        if (restoreName !== null) {
            var flagName = true, rName = "";
            _.each(FileList[restoreList[fileId].parent][restoreList[fileId].type + 's'], function (element) {
                rName = element.name || element.filename;
                if (restoreName == rName) flagName = false;
            });
            _.each(restoreList, function (element) {
                rName = element.restoreName;
                if (restoreName == rName && element.id != fileId) flagName = false;
            });
            if (!restoreName.length) flagName = false;
            restoreList[fileId].restoreNameFlag = flagName;
            if (flagName)
                restoreList[fileId].restoreName = restoreName;
            return flagName;
        }
        if (restoreFlag !== null)
            restoreList[fileId].restore = restoreFlag;
        return true;
    },

    restoreApproved: function () {
        RestoreApproved();
    },

    getSelectedMove: function () {
        return selectedMove;
    },

    getMultiSelected: function () {
        return TableStore.getMultiSelected();
    },

    getSearch: function () {
        return searchPreg;
    },

    getCurrentFolder: function () {
        return currentFolder;
    },

    getCurrentTrashFolder: function () {
        return currentTrashFolder;
    },

    getCurrentState: function () {
        return mode;
    },

    getCurrentFile: function () {
        return currentFile;
    },

    getFolderPath: function () {
        return folderPath;
    },

    getTrashFolderPath: function () {
        return trashFolderPath;
    },

    getCurrentFiles: function () {
        return files;
    },

    emitChange: function () {
        this.emit(CHANGE_EVENT);
    },

    emitSort: function () {
        this.emit(SORT_EVENT);
    },

    /**
     * @param {function} callback
     */
    addSortListener: function (callback) {
        this.on(SORT_EVENT, callback);
    },

    /**
     * @param {function} callback
     */
    removeSortListener: function (callback) {
        this.removeListener(SORT_EVENT, callback);
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
    },

    emitSelect: function () {
        this.emit(SELECT_EVENT);
    },

    /**
     * @param {function} callback
     */
    addSelectListener: function (callback) {
        this.on(SELECT_EVENT, callback);
    },

    /**
     * @param {function} callback
     */
    removeSelectListener: function (callback) {
        this.removeListener(SELECT_EVENT, callback);
    }
});
//noinspection JSUnresolvedFunction
FilesListStore.setMaxListeners(0);

// Register callback to handle all updates
FilesListStore.dispatcherIndex = AppDispatcher.register(function (action) {
    switch (action.actionType) {

        case FilesListConstants.CHANGE_FOLDER:
            if (action.folderId !== '')
                setFolder(action.folderId, action.folderName, true, {viewOnly: action.viewOnly});
            FilesListStore.emitChange();
            break;
        case FilesListConstants.RELOAD_LIST:
            FilesListStore.emitChange();
            break;
        case FilesListConstants.SAVE_FILES:
            saveFiles(action.results);
            break;
        case FilesListConstants.SAVE_TARGET:
            saveTarget(action.targetId);
            FilesListStore.emitSelect();
            break;
        case FilesListConstants.TOGGLE_VIEW:
            toggleMode(action.name, action.target, action.viewOnly, action.type, action.historyUpdate);
            FilesListStore.emitChange();
            break;
        case FilesListConstants.DELETE_OBJECTS:
            deleteSelected();
            break;
        case FilesListConstants.ERASE_OBJECTS:
            eraseSelected();
            break;
        case FilesListConstants.RESTORE_OBJECTS:
            restoreSelected();
            break;
        case FilesListConstants.MOVE_OBJECTS:
            moveToFolder(action.targetId);
            FilesListStore.emitChange();
            break;
        case FilesListConstants.MAKE_PATH:
            makePath(action.path);
            FilesListStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = FilesListStore;