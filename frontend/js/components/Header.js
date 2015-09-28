/**
 * Created by developer123 on 13.02.15.
 */
var React = require('react');
var $ = require('jquery');
var Navbar = require('react-bootstrap').Navbar;
var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;
var Button = require('react-bootstrap').Button;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Tooltip = require('react-bootstrap').Tooltip;
var Alert = require('./Alert');
var FilesListActions = require('../actions/FilesListActions');
var TableActions = require('../actions/TableActions');
var UserInfoActions = require('../actions/UserInfoActions');
var UserInfoStore = require('../stores/UserInfoStore');
var ModalActions = require('../actions/ModalActions');
var AlertActions = require('../actions/AlertActions');
var ContextMenuActions = require('../actions/ContextMenuActions');
var FilesListStore = require('../stores/FilesListStore');
var CustomModalTrigger = require('./Modal');
var Storage = require('../libs/Storage');
var Requests = require('../libs/Requests');
var MainFunctions = require('../libs/MainFunctions');
var KudoApiUrl = UserInfoStore.getConfig('api') || "";

var Header = React.createClass({

    getInitialState: function () {
        var pageType = "Index", historyName = MainFunctions.detectPageType();
        if (historyName == 'files') pageType = "My drawings";
        else if (historyName == 'users') pageType = "Users";
        else if (historyName == 'templates') pageType = "Templates";
        /*if (pageType !== "Index" && checkStorage(UserInfoStore.getConfig('defaultheaders'))) {
         Requests.sendRequest(KudoApiUrl + '/auth', "GET", [], JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (answer) {
         if (answer.statusCode == 401) {
         MainFunctions.transitToPage('index');
         UserInfoStore.getConfig('error'), UserInfoStore.getConfig('session')Id") == "logout" ? "" : 'loginfirst');
         UserInfoStore.getConfig('defaultheaders'), "");
         }
         });
         } else if (pageType == "Index" && UserInfoStore.getConfig('error') == "loginfirst") {
         AlertActions.showError("You aren't logged in or your session has expired", "danger");
         UserInfoStore.getConfig('error'), "");
         UserInfoStore.getConfig('defaultheaders'), "");
         } else if (pageType !== "Index" && !checkStorage(UserInfoStore.getConfig('defaultheaders'))) {
         MainFunctions.transitToPage('index');
         UserInfoStore.getConfig('error'), UserInfoStore.getConfig('session')Id") == "logout" ? "" : 'loginfirst');
         UserInfoStore.getConfig('defaultheaders'), "");
         }
         setTimeout(function () {
         if (pageType!=="Index" && !checkStorage(UserInfoStore.getConfig('defaultheaders'))) {
         MainFunctions.transitToPage('index');
         UserInfoStore.getConfig('error'), UserInfoStore.getConfig('session')Id") == "logout" ? "" : 'loginfirst');
         UserInfoStore.getConfig('defaultheaders'), "");
         }
         }, 6000);*/
        return {pageType: pageType, optionsVisible: false};
    },

    logout: function (e) {
        e.preventDefault();
        Requests.sendRequest(KudoApiUrl + '/logout', "POST", [], JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (answer) {
            Storage.clearStorage();
            Storage.store('sessionId', "logout");
        });
    },

    changePageType: function (e) {
        e.preventDefault();
        if (this.state.pageType !== "Index")
            if (this.state.pageType == "My drawings") {
                if (FilesListStore.getCurrentState() !== "browser")
                    FilesListActions.toggleView(FilesListStore.getCurrentFolder().folderName || "~", FilesListStore.getCurrentFolder().folderId || "-1", FilesListStore.getCurrentFolder().additional.viewOnly || false, "browser", true);
                else
                    FilesListActions.changeFolder("~", "-1");
                TableActions.search("");
            }
            else MainFunctions.transitToPage('files');
    },

    showUsers: function (e) {
        e.preventDefault();
        MainFunctions.transitToPage('users');
    },

    showTemplates: function (e) {
        e.preventDefault();
        MainFunctions.transitToPage('templates');
    },

    handleMode: function (e) {
        e.preventDefault();
    },

    shareFile: function (e) {
        e.preventDefault();
        ModalActions.shareManagement(this.props.fileId, 'file', this.props.fileName, this.props.fileOwner);
    },

    changeEditor: function (e) {
        e.preventDefault();
        ModalActions.changeEditor({id: this.props.fileId});
    },

    showOptions: function (e) {
        e.preventDefault();
        if (this.isMounted())
            this.setState({optionsVisible: !this.state.optionsVisible}, null);
    },

    showUserProfile: function () {
        ModalActions.showProfile();
    },

    componentDidMount: function () {
        var self = this;
        UserInfoStore.addChangeListener(this._onChange);
        $(document).click(function (e) {
            if (!$(e.target).parents('.useroptions').length && self.state.optionsVisible && self.isMounted()) self.setState({optionsVisible: false}, null);
        });
        $(document).keydown(function (e) {
            if (e.keyCode == 27 && self.isMounted()) self.setState({optionsVisible: false});
        });
        if (this.state.pageType !== "Index")
            Requests.sendRequest(KudoApiUrl + '/users', "GET", [], JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (data) {
                if (data.status == 'ok')
                    UserInfoActions.resetUserInfo(data.results[0]);
                else AlertActions.showError(data.error, "danger");
            });
    },

    componentWillUnmount: function () {
        UserInfoStore.removeChangeListener(this._onChange);
    },

    render: function () {
        var userInfo = UserInfoStore.getUserInfo();
        return (
            <header>
                <Navbar>
                    <Nav>
                        {this.props.type == "full" ? (
                            <NavItem className="useroptions" onClick={this.showOptions}>
                                <div>
                                <span
                                    className="caption modecaption username">{userInfo.username}</span>
                                </div>
                            </NavItem>
                        ) : ""}
                        <NavItem
                            disabled={this.state.pageType=="Index"}>
                            <span className="caption logo"
                                  onClick={this.state.pageType=="Index" ? "" : this.changePageType}>
                            </span>
                        </NavItem>
                        {this.props.fileId ? (
                            <NavItem className="fileOptions">
                            <span
                                className="caption modecaption">{MainFunctions.shrinkString(this.props.fileName)}</span>
                                <img src={UserInfoStore.getConfig('path')+"images/right.png"}/>
                                <ul className="optionsTab">
                                    <li>
                                        <OverlayTrigger placement="bottom"
                                                        overlay={<Tooltip>{"Share this file"}</Tooltip>}>
                                            <img src={UserInfoStore.getConfig('path') + 'images/share.png'}
                                                 onClick={this.shareFile}/>
                                        </OverlayTrigger>
                                    </li>
                                    <li>
                                        <OverlayTrigger placement="bottom"
                                                        overlay={<Tooltip>{"Change editor"}</Tooltip>}>
                                            <img src={UserInfoStore.getConfig('path') + 'images/gear.png'}
                                                 onClick={this.changeEditor}/>
                                        </OverlayTrigger>
                                    </li>
                                </ul>
                            </NavItem>
                        ) : (
                            (this.state.pageType == "Index") ? "" : (
                                <NavItem>
                                <span className="caption modecaption"
                                      onClick={this.handleMode}>{this.props.fileName ? MainFunctions.shrinkString(this.props.fileName) : (this.props.mode == "trash" ? "Trash" : (this.state.pageType == "My drawings" ? ("My drawings - " + MainFunctions.shrinkString(FilesListStore.getCurrentFolder().folderName)) : this.state.pageType))}</span>
                                </NavItem>
                            )
                        )}

                    </Nav>
                </Navbar>
                < Alert />
                <CustomModalTrigger />
                {this.state.optionsVisible ? (
                    <div className="options">
                        {(this.props.toggling == "true" || (this.state.pageType !== "My drawings" && this.state.pageType !== "Index") && this.props.type != "minified") ? (
                            <div className="optionItem" onClick={this.changePageType}>
                                <span>My drawings</span>
                            </div>
                        ) : ""}
                        {(userInfo.isAdmin && this.state.pageType !== "Users" && this.props.type != "minified") ? (
                            <div className="optionItem" onClick={this.showUsers}>
                                <span>Users</span>
                            </div>
                        ) : ""}
                        {(userInfo.isAdmin && this.state.pageType !== "Templates" && this.props.type != "minified") ? (
                            <div className="optionItem" onClick={this.showTemplates}>
                                <span>Templates</span>
                            </div>
                        ) : ""}
                        <div className="optionItem" onClick={this.showUserProfile}>
                            <span>Profile</span>
                        </div>
                        {this.props.type == "full" ? (
                            <div className="optionItem" onClick={this.logout}>
                                <span>Logout</span>
                            </div>
                        ) : ""}
                    </div>
                ) : ""}
            </header>
        );
    },

    _onChange: function () {
        this.forceUpdate();
    }
});
module.exports = Header;