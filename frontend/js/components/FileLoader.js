/**
 * Created by developer123 on 11.02.15.
 */
var React = require('react');
var $ = require('jquery');
var _ = require('underscore');
var Header = require('./Header');
var List = require('./FilesList');
var ControlPanel = require('./ControlPanel');
var ListPath = require('./ListPath');
var ContextMenu = require('./ContextMenu');
var AppDispatcher = require('../dispatcher/AppDispatcher');
var FilesListStore = require('../stores/FilesListStore');
var ContextMenuStore = require('../stores/ContextMenuStore');
var AlertStore = require('../stores/AlertStore');
var FilesListActions = require('../actions/FilesListActions');
var TableActions = require('../actions/TableActions');
var TableStore = require('../stores/TableStore');
var ContextMenuActions = require('../actions/ContextMenuActions');
var AlertActions = require('../actions/AlertActions');
var ModalActions = require('../actions/ModalActions');
var ProgressBar = require('react-bootstrap').ProgressBar;
var Storage = require('../libs/Storage');
var Requests = require('../libs/Requests');
var UserInfoStore = require('../stores/UserInfoStore');
var KudoApiUrl = UserInfoStore.getConfig('api') || "";
var session = Storage.store('sessionId') || "";

$(function () {

    var leftButtonDown = false;
    var state = false;

    $(document).mousedown(function (e) {
        if (e.which === 1) leftButtonDown = true;
    });

    $(document).mouseup(function (e) {
        if (FilesListStore.getCurrentState() != "trash") {
            var folder = $(e.target).closest('.folder');
            if (folder.length && !($(folder).hasClass('selected')) && FilesListStore.getCurrentState() != 'trash' && state)
                FilesListActions.moveSelected($(folder).attr('id'));
            $('.draggable').css('top', '0px');
            $('.folder').removeClass('highlited');
            $('.highlited-hover').removeClass('highlited-hover');
            $('.selected').removeClass('draggable');
            state = false;
            if (e.which === 1) leftButtonDown = false;
        }
    });

    function tweakMouseMoveEvent(e) {
        if (e.which === 1 && !leftButtonDown) e.which = 0;
    }

    $(document).mousemove(function (e) {
        if (FilesListStore.getCurrentState() != "trash") {
            tweakMouseMoveEvent(e);
            if (e.which === 1 && TableStore.getMultiSelected().length && !$('.modal').is(':visible') && !$('input.nameEdit').is(':visible') && UserInfoStore.getConfig('drag') === 'true' && 2 < 1) {
                state = true;
                e.stopPropagation();
                if (FilesListStore.getCurrentState() != 'trash')
                    $('.folder').not('.selected').addClass('highlited');
                $('.highlited-hover').removeClass('highlited-hover');
                $(e.target).closest('.highlited').not('.selected').addClass('highlited-hover');
                var topped = (e.clientY + 5 < $('table').position().top + 30) ? ($('table').position().top + 30) : (e.clientY + 5);
                $('tr.selected').addClass('draggable').css('top', topped);
            }
        }
    });
});

var QueryString = function () {
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = pair[1];
        } else if (typeof query_string[pair[0]] === "string") {
            query_string[pair[0]] = [query_string[pair[0]], pair[1]];
        } else {
            query_string[pair[0]].push(pair[1]);
        }
    }
    return query_string;
}();

var DrawingFrame = React.createClass({
    componentDidMount: function () {
        if (UserInfoStore.getConfig('debug') === 'false') document.domain = "graebert.com";
        $('iframe').load(function () {
            $('.loaderwrapper').hide();
        });
    },

    render: function () {
        var link = UserInfoStore.getConfig('editor') + this.props.currentFile + '&sessionId=' + session + (this.props.viewOnly ? "&access=view" : "");
        return (
            <div className="framewrapper">
                <div className="loaderwrapper">
                    <ProgressBar id="loader" active now={100}/>
                </div>
                <iframe src={link}/>
            </div>
        )
    }
});

var FilesLoader = React.createClass({
    getInitialState: function () {
        var mode = QueryString.mode || "browser";
        var folder = QueryString.folder || "-1";
        if (folder != "-1") {
            Requests.sendRequest(KudoApiUrl + '/folders/' + folder + '/path', "GET", [], JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (answer) {
                if (answer.status != 'ok')
                    AlertActions.showError(answer.error, "danger");
                else {
                    var reslist = answer.result;
                    reslist.reverse();
                    for (var i = 0; i < reslist.length; i++) {
                        reslist[i].folderId = reslist[i]._id;
                        reslist[i].folderName = reslist[i].name;
                    }
                    FilesListActions.makePath(reslist);
                    Requests.sendRequest(KudoApiUrl + '/folders/' + folder, 'GET', [], JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (answer) {});
                }
            });
        } else {
            var file = QueryString.file || null, fileName = null;
            if (file)
                mode = "viewer";
        }
        if (mode == "trash")
            FilesListActions.toggleView(FilesListStore.getCurrentTrashFolder().folderName, FilesListStore.getCurrentTrashFolder().folderId, false, "trash");
        if (mode=="viewer") {
            Requests.sendRequest(KudoApiUrl+'/files/'+file+'/info','GET',[],JSON.parse(UserInfoStore.getConfig('defaultheaders')),function(answer){});
        }
        return {
            mode: mode,
            currentFolder: folder,
            currentFile: file,
            fileName: fileName
        }
    },

    componentDidMount: function () {
        var self = this;
        if (this.state.mode == "viewer") {
            Requests.sendRequest(KudoApiUrl + '/files/' + self.state.currentFile + '/info', "GET", [], JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (answer) {
                if (answer.statusCode == 403)
                    ModalActions.requestAccess(self.state.currentFile);
                else if (answer.statusCode == 404)
                    self.setState({mode: "browser", currentFolder: "-1"}, function () {
                        AlertActions.showError("File doesn't exist", "danger");
                    });
                else
                    self.setState({fileName: answer.filename, fileOwner: answer.owner}, function () {
                        FilesListActions.toggleView(answer.filename, answer._id, answer.viewOnly, "viewer");
                    });
            });
        }
        window.onpopstate = function (event) {
            if (event.state == null) FilesListActions.toggleView("~", "-1", false, "browser");
            else {
                switch (event.state.mode) {
                    default:
                    case "browser":
                        FilesListActions.toggleView(event.state.name || "~", event.state.id || "-1", false, "browser");
                        break;
                    case "trash":
                        FilesListActions.toggleView(event.state.name || "~", event.state.id || "-1", false, "trash");
                        break;
                    case "viewer":
                        FilesListActions.toggleView(event.state.name, event.state.id, false, "viewer");
                        break;
                }
            }
        };
        FilesListStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {
        FilesListStore.removeChangeListener(this._onChange);
    },

    render: function () {
        if (this.state.mode == "browser")
            return (
                <div className="page">
                    <Header type="full"/>
                    <ContextMenu />
                    <ControlPanel type="files"/>
                    <ListPath mode="browser"/>
                    <List currentfolderId={this.state.currentFolder} pageMode="browser"/>
                </div>
            );
        else if (this.state.mode == "viewer")
            return (
                <div className="page">
                    <Header type="full" toggling="true" fileName={this.state.fileName} fileId={this.state.currentFile}
                            fileOwner={this.state.fileOwner}/>
                    <DrawingFrame currentFile={this.state.currentFile} viewOnly={this.state.viewOnly}/>
                </div>
            );
        else if (this.state.mode == "trash")
            return (
                <div className="page">
                    <Header type="full" mode="trash"/>
                    <ContextMenu />
                    <ControlPanel type="files"/>
                    <ListPath mode="trash"/>
                    <List mode="trash" currentfolderId={this.state.currentFolder} pageMode="trash"/>
                </div>
            );
    },

    _onChange: function () {
        if (FilesListStore.getCurrentState() == "viewer")
            this.setState({
                mode: "viewer",
                currentFile: FilesListStore.getCurrentFile().id,
                fileName: FilesListStore.getCurrentFile().name,
                viewOnly: FilesListStore.getCurrentFile().viewOnly
            }, function () {
                window.timer1 = setInterval(function () {
                    Requests.sendRequest(KudoApiUrl + '/auth', 'GET', [], JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (answer) {
                        if (answer.status != 'ok') {
                            AlertActions.showError("Session has expired", "danger");
                            Storage.clearStorage();
                        }
                    });
                }, 29 * 60 * 1000);
            });
        else {
            clearInterval(window.timer1);
            if (FilesListStore.getCurrentState() == "browser")
                this.setState({
                    mode: "browser",
                    currentFolder: FilesListStore.getCurrentFolder().folderId
                });
            else if (FilesListStore.getCurrentState() == "trash")
                this.setState({
                    mode: "trash"
                });
        }
    }
});

module.exports = FilesLoader;