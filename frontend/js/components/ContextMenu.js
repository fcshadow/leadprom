/**
 * Created by developer123 on 06.03.15.
 */
var React = require('react');
var $ = require('jquery');
var _ = require('underscore');
var fs = require('fs');
var ContextMenuStore = require('../stores/ContextMenuStore');
var FilesListStore = require('../stores/FilesListStore');
var TableStore = require('../stores/TableStore');
var UserInfoStore = require('../stores/UserInfoStore');
var FilesListActions = require('../actions/FilesListActions');
var TableActions = require('../actions/TableActions');
var ContextMenuActions = require('../actions/ContextMenuActions');
var ModalActions = require('../actions/ModalActions');
var AlertActions = require('../actions/AlertActions');
var UsersActions = require('../actions/UsersActions');
var TemplatesActions = require('../actions/TemplatesActions');
var Storage = require('../libs/Storage');
var Requests = require('../libs/Requests');
var MainFunctions = require('../libs/MainFunctions');
var KudoApiUrl = UserInfoStore.getConfig('api') || "";
var session = UserInfoStore.getConfig('sessionId') || "";
var supportedTypes = ["dwg", "dwt", "dxf", "folder"];

var ContextMenu = React.createClass({

    getInitialState: function () {
        return {
            display: "none",
            top: 0,
            left: 0,
            info: [],
            type: "files"
        }
    },

    componentDidMount: function () {
        $(document).ready(function () {
            $(document).mousedown(function (e) {
                if (!$(e.target).hasClass('contextitem') && !$(e.target).parents('.modal').length && ContextMenuStore.getCurrentInfo().visible)
                    ContextMenuActions.hideMenu();
            });
        });
        var JThis = $('.contextmenu');
        if (JThis) {
            var height = JThis.height(), width = JThis.width(), offset = JThis.offset(), docheight = $(window).height(), docwidth = $(window).width(), state = {
                top: this.state.top,
                left: this.state.left
            };
            if (height && width) {
                if (height + offset.top > docheight)
                    state.top = docheight - height - 3;
                if (width + offset.left > docwidth)
                    state.left = docwidth - width - 3;
                if (offset.top < 3)
                    state.top = 3;
                if (offset.left < 3)
                    state.left = 3;
                if (state.top != this.state.top || state.left != this.state.left)
                    this.setState(state, null);
            }
        }
        ContextMenuStore.addChangeListener(this._onChange);
        UserInfoStore.addChangeListener(this._onInfoChange);
    },

    componentWillUnmount: function () {
        ContextMenuStore.removeChangeListener(this._onChange);
        UserInfoStore.removeChangeListener(this._onInfoChange);
    },

    open: function () {
        if (this.state.info) {
            if (this.state.info.type == "folder")
                FilesListActions.changeFolder(this.state.info.name, this.state.info.id);
            else
                FilesListActions.toggleView(this.state.info.name, this.state.info.id, this.state.info.viewOnly, "viewer");
            ContextMenuActions.hideMenu();
        }
    },

    rename: function () {
        this.state.info.rename();
        ContextMenuActions.hideMenu();
    },

    deleteHandler: function () {
        if (!FilesListStore.isAnyShared()) {
            ModalActions.deleteObject();
            ContextMenuActions.hideMenu();
        }
    },

    eraseHandler: function () {
        ModalActions.eraseObjects();
        ContextMenuActions.hideMenu();
    },

    restoreHandler: function () {
        if (FilesListStore.getCurrentTrashFolder().folderId == "-1") {
            FilesListActions.restoreSelected();
            ContextMenuActions.hideMenu();
        }
    },

    /*shareObject:function(state) {
     console.log("trying to share..");
     var url = KudoApiUrl + '/' + state.currentInfo.objtype + 's/' + state.currentInfo.id;
     var data={};
     if (state.currentInfo.type=="DESHARE") {
     data={deshare:[]};
     data.deshare.push(state.selectedUser);
     console.log(data);
     $.ajax({
     url: url,
     beforeSend: function (request) {
     request.setRequestHeader("sessionId", session);
     },
     type: "PUT",
     data:JSON.stringify(data),
     dataType: "JSON"
     }).always(function (data) {
     if (data.status != 200 && data.status != 'ok')
     AlertActions.showError(data.responseText,"danger");
     FilesListActions.reloadList();
     });
     }
     else
     if (state.selectedUser.length) {
     data={share:{editor:[],viewer:[]}};
     if (state.sharingType=="editor")
     data.share.editor.push(state.selectedUser);
     else
     data.share.viewer.push(state.selectedUser);
     console.log(data);
     $.ajax({
     url: url,
     beforeSend: function (request) {
     request.setRequestHeader("sessionId", session);
     },
     type: "PUT",
     data:JSON.stringify(data),
     dataType: "JSON"
     }).always(function (data) {
     if (data.status != 200 && data.status != 'ok')
     AlertActions.showError(data.responseText,"danger");
     FilesListActions.reloadList();
     });
     } else AlertActions.showError("You didn't select user","danger");
     },*/

    shareHandler: function () {
        ModalActions.shareManagement(this.state.info.id, this.state.info.type, this.state.info.name, this.state.info.owner);
        ContextMenuActions.hideMenu();
    },
    versionsHandler: function () {
        ModalActions.versionsManagement(null, this.state.info.id, this.state.info.type);
        ContextMenuActions.hideMenu();
    },

    downloadHandler: function () {
        var filename = this.state.info.name;
        var oReq = new XMLHttpRequest();
        oReq.open("GET", KudoApiUrl + '/files/' + this.state.info.id + '/data', true);
        oReq.setRequestHeader('sessionId', session);
        oReq.responseType = "arraybuffer";
        oReq.onload = function () {
            var blob = new Blob([oReq.response]);
            saveAs(blob, filename);
            ContextMenuActions.hideMenu();
        };

        oReq.send();
    },

    toggleStatus: function () {
        var json = {};
        var self = this;
        json.enabled = !this.state.info.enabled;
        Requests.sendRequest(KudoApiUrl + '/admin/users/' + this.state.info._id, "PUT", JSON.stringify(json), JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (data) {
            if (data.status != 'ok')
                AlertActions.showError(data.error, "danger");
            else
                UsersActions.toggleStatus(self.state.info._id, json.enabled);
            ContextMenuActions.hideMenu();
        });
    },

    toggleRole: function () {
        var json = {};
        var self = this;
        if (!this.state.info.isAdmin)
            json.rolesAdd = ["1"];
        else
            json.rolesRemove = ["1"];
        Requests.sendRequest(KudoApiUrl + '/admin/users/' + this.state.info._id, "PUT", JSON.stringify(json), JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (data) {
            if (data.status != 'ok')
                AlertActions.showError(data.error, "danger");
            else
                UsersActions.toggleRole(self.state.info._id, !self.state.info.isAdmin);
            ContextMenuActions.hideMenu();
        });
    },

    cloneHandler: function () {
        var type = this.state.info.type, json = {}, re = /(?:\.([^.]+))?$/, cloneReg = /\(([^)]+)\)/, filename = this.state.info.name,self=this;
        var cloneName = filename.substr(0, filename.lastIndexOf('.')) || filename, currentCopy = cloneReg.exec(cloneName);
        if (currentCopy && cloneName.indexOf('(') == -1)
            json[type + 'Name'] = cloneName.substr(0, cloneName.lastIndexOf('(')) + "(" + (parseInt(currentCopy[1]) + 1) + ")" + re.exec(filename)[0];
        else json[type + 'Name'] = cloneName + "(1)" + re.exec(filename)[0];
        var flag = false, i = 1;
        while (!flag) {
            $.each(TableStore.getTable().results, function (key, value) {
                if (json[type + 'Name'] == value.name && value.type == self.state.info.type) {
                    i++;
                    json[type + 'Name'] = cloneName + "(" + i + ")" + re.exec(filename)[0];
                    flag = false;
                    return flag;
                } else flag = true;
            });
        }
        if (flag)
            Requests.sendRequest(KudoApiUrl + '/' + this.state.info.type + 's/' + this.state.info.id + '/clone', "POST", JSON.stringify(json), JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (data) {
                if (data.status != 'ok') {
                    if (data.statusCode != 200)
                        AlertActions.showError(data.error, "danger");
                    else
                        AlertActions.showError(data.status, "danger");
                } else FilesListActions.reloadList();

            });
        ContextMenuActions.hideMenu();
    },

    deleteTemplate: function () {
        var templatename = this.state.info.name;
        Requests.sendRequest(KudoApiUrl + '/admin/templates/' + this.state.info.id, "DELETE", [], JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (data) {
            if (data.status != 'ok')
                AlertActions.showError(data.error, "danger");
            else {
                TemplatesActions.reloadTemplates();
                AlertActions.showError("Template " + templatename + " has been successfully deleted", "success");
            }
        });
        ContextMenuActions.hideMenu();
    },

    moveHandler: function () {
        if (!FilesListStore.isAnyShared()) {
            ModalActions.moveObjects();
            ContextMenuActions.hideMenu();
        }
    },

    disableSubMenu: function (e) {
        e.preventDefault();
    },

    componentDidUpdate: function () {
        var JThis = $('.contextmenu');
        if (JThis) {
            var height = JThis.height(), width = JThis.width(), offset = JThis.offset(), docheight = $(window).height(), docwidth = $(window).width(), state = {
                top: this.state.top,
                left: this.state.left
            };
            if (height && width) {
                if (height + offset.top > docheight)
                    state.top = docheight - height - 3;
                if (width + offset.left > docwidth)
                    state.left = docwidth - width - 3;
                if (offset.top < 3)
                    state.top = 3;
                if (offset.left < 3)
                    state.left = 3;
                if (state.top != this.state.top || state.left != this.state.left)
                    this.setState(state, null);
            }
        }
    },

    render: function () {
        //TODO: consider BOX behavior
        if (this.state.display != "none")
            if (this.state.type == "files" && TableStore.getMultiSelected().length == 1 && !(FilesListStore.getCurrentState() == "trash")) {
                return (
                    <div className="contextmenu" style={this.state} onContextMenu={this.disableSubMenu}>
                        {(supportedTypes.indexOf(MainFunctions.getIconClassName(null, this.state.info.type,this.state.info.filename||this.state.info.name)) !== -1) ? (
                        <div className="contextitem" onClick={this.open}>Open</div>
                            ) : ""}
                        {(!this.state.info.shared || this.state.info.owner == UserInfoStore.getUserInfo().username) ? (
                        <div className="contextitem" onClick={this.rename}>Rename</div>) : ""}
                        <div className="contextitem" onClick={this.cloneHandler}>Clone</div>
                        {(this.state.info.type == "file") ? (
                        <div className="contextitem" onClick={this.downloadHandler}>Download</div>) : ""}
                        {(!this.state.info.shared || this.state.info.owner == UserInfoStore.getUserInfo().username) ? (
                        <div className="contextitem" onClick={this.moveHandler}>Move</div>) : ""}
                        {(!this.state.info.shared || this.state.info.owner == UserInfoStore.getUserInfo().username) ? (
                        <div className="contextitem" onClick={this.deleteHandler}>Delete</div>) : ""}
                        {(!this.state.info.viewOnly) ? (
                        <div className="contextitem" onClick={this.shareHandler}>Share</div>) : ""}
                        {(this.state.info.type == "file" && 2 < 1) ? (
                        <div className="contextitem" onClick={this.versionsHandler}>Versions</div>) : ""}
                    </div>
                );
            }
            else if (this.state.type == "files" && TableStore.getMultiSelected().length > 1 && !(FilesListStore.getCurrentState() == "trash"))
                return (
                    <div className="contextmenu" style={this.state} onContextMenu={this.disableSubMenu}>
                        <div className={(FilesListStore.isAnyShared() ? ("disabled ") : "") + "contextitem"}
                             onClick={this.moveHandler}>Move
                        </div>
                        <div className={(FilesListStore.isAnyShared() ? ("disabled ") : "") + "contextitem"}
                             onClick={this.deleteHandler}>Delete
                        </div>
                    </div>
                );
            else if (this.state.type == "files" && FilesListStore.getCurrentState() == "trash")
                return (
                    <div className="contextmenu" style={this.state} onContextMenu={this.disableSubMenu}>
                        <div className="contextitem" onClick={this.eraseHandler}>Erase</div>
                        <div
                            className={(FilesListStore.getCurrentTrashFolder().folderId!=="-1" ? ("disabled ") : "") + "contextitem"}
                            onClick={this.restoreHandler}>Restore
                        </div>
                    </div>
                );
        if (this.state.type == "users")
            return (
                <div className="contextmenu" style={this.state} onContextMenu={this.disableSubMenu}>
                    <div className="contextitem"
                         onClick={this.toggleStatus}>{this.state.info.enabled ? "Disable" : "Enable"}</div>
                    <div className="contextitem"
                         onClick={this.toggleRole}>{this.state.info.isAdmin ? "Remove admin role" : "Make an admin"}</div>
                </div>
            );
        else if (this.state.type == "templates")
            return (
                <div className="contextmenu" style={this.state} onContextMenu={this.disableSubMenu}>
                    <div className="contextitem" onClick={this.rename}>Rename</div>
                    <div className="contextitem" onClick={this.deleteTemplate}>Delete</div>
                </div>
            );
        else
            return (<span></span>)
    },

    _onChange: function () {
        //noinspection JSSuspiciousNameCombination
        var newinfo = ContextMenuStore.getCurrentInfo();
        this.replaceState({
            display: newinfo.visible ? "block" : "none",
            top: newinfo.Y,
            left: newinfo.X,
            info: newinfo.info,
            type: newinfo.type
        }, null);
    },

    _onInfoChange: function () {
        this.forceUpdate();
    }

});

module.exports = ContextMenu;