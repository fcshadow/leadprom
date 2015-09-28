/**
 * Created by developer123 on 17.02.15.
 */
var React = require('react');
var $ = require('jquery');
var ProgressBar = require('react-bootstrap').ProgressBar;
var Table = require('react-bootstrap').Table;
var FilesListStore = require('../stores/FilesListStore');
var AlertStore = require('../stores/AlertStore');
var AlertActions = require('../actions/AlertActions');
var TableActions = require('../actions/TableActions');
var FilesListActions = require('../actions/FilesListActions');
var Container = require('./Container');
var TableView = require('./TableView');
var Storage = require('../libs/Storage');
var Requests = require('../libs/Requests');
var MainFunctions = require('../libs/MainFunctions');
var UserInfoStore = require('../stores/UserInfoStore');
var KudoApiUrl = UserInfoStore.getConfig('api') || "";

var List = React.createClass({
    getInitialState: function () {
        var _table = {
            fields: {
                name: {order: "desc", type: "string", rename: true, search: true},
                owner: {
                    order: "desc",
                    type: "string", rename: true, search: true
                },
                modified: {order: "desc", type: "updateDate", rename: false, search: false},
                size: {order: "desc", type: "num", rename: false, search: false}
            },
            orderedBy: null,
            results: []
        };
        TableActions.saveObjects(_table);
        return ({
            results: [],
            currentfolderId: this.props.currentfolderId,
            mode: "loading",
            pageMode: this.props.pageMode
        });
    },

    getNewList: function () {
        var search = this.state.search;
        if (search == "/(?:)/gi") search = "";
        var self = this, uid = this.props.uid, url, headers = JSON.parse(UserInfoStore.getConfig('defaultheaders'));
        this.setState({mode: "loading"}, null);
        if (FilesListStore.getCurrentState() == "trash") {
            if (this.state.currentfolderId == "-1") {
                if (!uid) url = "/trash";
                else url = "/admin/files";
            } else {
                if (!uid)
                    url = "/trash/folder/" + this.state.currentfolderId;
                else
                    url = "/admin/folders/" + this.state.currentfolderId;
            }
            url = KudoApiUrl + url;
            if (uid) headers.push({"name": "userId", "value": uid});
            Requests.sendRequest(url, "GET", [], headers, function (data) {
                if (data.status != 'ok')
                    AlertActions.showError(data.status, "danger");
                else {
                    var results = [];
                    $.each(data.results.files, function (key, value) {
                        if (MainFunctions.searchOverlay(value.filename, search) || MainFunctions.searchOverlay(value.owner, search))
                            results.push({
                                id: value._id,
                                name: value.filename,
                                creationDate: value.creationDate,
                                updateDate: value.updateDate,
                                type: "file",
                                owner: value.owner,
                                changer: value.changer,
                                size: value.size,
                                parent: value.folderId,
                                shared: value.shared
                            });
                    });
                    $.each(data.results.folders, function (key, value) {
                        if (MainFunctions.searchOverlay(value.name, search) || MainFunctions.searchOverlay(value.owner, search))
                            results.push({
                                id: value._id,
                                parent: value.parent,
                                name: value.name,
                                creationDate: value.creationDate,
                                type: "folder",
                                owner: value.owner,
                                changer: value.changer,
                                shared: value.shared
                            });
                    });
                    results.sort(function (a, b) {
                        if (a.type.length > b.type.length) {
                            return -1
                        }
                        if (a.type.length < b.type.length) {
                            return 1
                        }
                        if (a.name.toUpperCase() > b.name.toUpperCase()) {
                            return 1
                        }
                        if (a.name.toUpperCase() < b.name.toUpperCase()) {
                            return -1
                        }
                        return 0;
                    });
                    self.setState({mode: "loaded", results: results}, function () {
                        var _table = {
                            fields: {
                                name: {order: "desc", type: "string", rename: true, search: true},
                                owner: {
                                    order: "desc",
                                    type: "string", rename: true, search: true
                                },
                                modified: {order: "desc", type: "updateDate", rename: false, search: false},
                                size: {order: "desc", type: "num", rename: false, search: false}
                            },
                            orderedBy: null,
                            results: self.state.results
                        };
                        FilesListActions.saveCurrentFiles(self.state.results);
                        TableActions.saveObjects(_table);
                    });
                }
            });
        } else if (this.state.currentfolderId != "browser") {
            if (this.state.currentfolderId == "-1") {
                if (!uid) url = "/files";
                else url = "/admin/files";
            } else {
                if (!uid)
                    url = "/folders/" + this.state.currentfolderId;
                else
                    url = "/admin/folders/" + this.state.currentfolderId;
            }
            url = KudoApiUrl + url;
            if (uid) headers.push({"name": "userId", "value": uid});
            Requests.sendRequest(url, "GET", [], headers, function (data) {
                if (data.status != 'ok')
                    AlertActions.showError(data.status, "danger");
                else {
                    var results = [];
                    $.each(data.results.files, function (key, value) {
                        if (MainFunctions.searchOverlay(value.filename, search) || MainFunctions.searchOverlay(value.owner, search))
                            results.push({
                                id: value._id,
                                name: value.filename,
                                creationDate: value.creationDate,
                                updateDate: value.updateDate,
                                type: "file",
                                owner: value.owner,
                                changer: value.changer,
                                size: value.size,
                                shared: value.shared,
                                viewOnly: value.viewOnly
                            });
                    });
                    $.each(data.results.folders, function (key, value) {
                        if (MainFunctions.searchOverlay(value.name, search) || MainFunctions.searchOverlay(value.owner, search))
                            results.push({
                                id: value._id,
                                parent: value.parent,
                                name: value.name,
                                creationDate: value.creationDate,
                                type: "folder",
                                owner: value.owner,
                                changer: value.changer,
                                shared: value.shared,
                                viewOnly: value.viewOnly
                            });
                    });
                    results.sort(function (a, b) {
                        if (a.type.length > b.type.length) {
                            return -1
                        }
                        if (a.type.length < b.type.length) {
                            return 1
                        }
                        if (a.name.toUpperCase() > b.name.toUpperCase()) {
                            return 1
                        }
                        if (a.name.toUpperCase() < b.name.toUpperCase()) {
                            return -1
                        }
                        return 0;
                    });
                    self.setState({mode: "loaded", results: results}, function () {
                        var _table = {
                            fields: {
                                name: {order: "desc", type: "string", rename: true, search: true},
                                owner: {
                                    order: "desc",
                                    type: "string", rename: true, search: true
                                },
                                modified: {order: "desc", type: "updateDate", rename: false, search: false},
                                size: {order: "desc", type: "num", rename: false, search: false}
                            },
                            orderedBy: null,
                            results: self.state.results
                        };
                        FilesListActions.saveCurrentFiles(self.state.results);
                        TableActions.saveObjects(_table);
                    });
                }
            });
        }
    },

    componentDidMount: function () {
        this.getNewList();
        FilesListStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {
        FilesListStore.removeChangeListener(this._onChange);
    },

    render: function () {
        return (
            <TableView type="files" mode={this.state.mode}/>
        )
    },

    _onChange: function () {
        if (this.isMounted())
            this.setState({
                currentfolderId: FilesListStore.getCurrentState() == "trash" ? FilesListStore.getCurrentTrashFolder().folderId : FilesListStore.getCurrentFolder().folderId,
                pageMode: FilesListStore.getCurrentState()
            }, function () {
                if (FilesListStore.getCurrentState() !== "viewer")
                    this.getNewList();
            });
    }
});

module.exports = List;