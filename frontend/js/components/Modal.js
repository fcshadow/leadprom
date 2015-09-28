/**
 * Created by developer123 on 17.02.15.
 */
"use strict";
var React = require('react');
var ValidInput = require('./ValidInput');
var ControlledForm = require('./ControlledForm');
var StorageSwitch = require('./StorageSwitch');
var Modal = require('react-bootstrap').Modal;
var Button = require('react-bootstrap').Button;
var Collapse = require('react-bootstrap').Collapse;
var Well = require('react-bootstrap').Well;
var Input = require('react-bootstrap').Input;
var Table = require('react-bootstrap').Table;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Tooltip = require('react-bootstrap').Tooltip;
var Tree = require('./Tree');
var ModalStore = require('../stores/ModalStore');
var FilesListStore = require('../stores/FilesListStore');
var UsersInfoActions = require('../actions/UserInfoActions');
var UserInfoStore = require('../stores/UserInfoStore');
var AlertActions = require('../actions/AlertActions');
var TableActions = require('../actions/TableActions');
var ModalActions = require('../actions/ModalActions');
var FilesListActions = require('../actions/FilesListActions');
var Storage = require('../libs/Storage');
var Requests = require('../libs/Requests');
var MainFunctions = require('../libs/MainFunctions');
var KudoApiUrl = UserInfoStore.getConfig('api') || "";
var $ = require('jquery');
var _ = require('underscore');

function getModalData() {
    var current = ModalStore.getCurrentInfo();
    if (!current.hasOwnProperty('additionalInfo') || current.additionalInfo == null) current.additionalInfo = {};
    return {
        currentInfo: current
    };
}

var Version = React.createClass({
    render: function () {
        return (
            <tr>
                <td>{this.props.elem.verNum}</td>
                <td>{this.props.elem.filename}</td>
            </tr>
        )
    }
});

var SharingUser = React.createClass({
    handleDeshare: function () {
        this.props.deshare(this.props.elem._id);
    },

    render: function () {
        return (
            <tr>
                <td>
                    <span>{this.props.elem.name}</span>
                </td>
                <td>
                    <span>{this.props.type}</span>
                    {this.props.elem.name !== UserInfoStore.getUserInfo().username ? (
                    <img src={UserInfoStore.getConfig('path') + "images/cross.png"} onClick={this.handleDeshare}/>) : ""}
                </td>
            </tr>
        )
    }
});

var SingleDuplicate = React.createClass({
    getInitialState: function () {
        return {
            cancelFlag: "crossed",
            valid: "error"
        }
    },

    toggleCancel: function () {
        if (this.state.cancelFlag == "crossed") this.setState({cancelFlag: "ticked"}, function () {
            FilesListStore.changeRestoreObject(this.props.elem.id, null, false);
            this.props.toggleSubmit(FilesListStore.getRestoreFlag().length ? true : false);
        });
        else this.setState({cancelFlag: "crossed"}, function () {
            FilesListStore.changeRestoreObject(this.props.elem.id, null, true);
            this.props.toggleSubmit(FilesListStore.getRestoreFlag().length ? true : false);
        });
    },

    changeName: function (e) {
        this.setState({valid: FilesListStore.changeRestoreObject(this.props.elem.id, e.target.value, null) ? "success" : "error"}, function () {
            this.props.toggleSubmit(FilesListStore.getRestoreFlag().length ? true : false);
        });
    },

    render: function () {
        return (
            <div className={"restoreDiv " + this.state.cancelFlag}>
                <div className="restoreSpan">
                    <span>{this.props.elem.name}</span>
                </div>
                <div className="restoreInput">
                    {this.state.cancelFlag == "crossed" ? (
                    <input placeholder="rename" onChange={this.changeName} className={this.state.valid}/>) : (
                    <input placeholder="rename" disabled={true}/>)}
                    <OverlayTrigger placement="top"
                                    overlay={<Tooltip>{this.state.cancelFlag == "ticked" ? "Restore this" : "Cancel restore"}</Tooltip>}>
                        <div className={this.state.cancelFlag} onClick={this.toggleCancel}></div>
                    </OverlayTrigger>
                </div>
            </div>
        )
    }
});

const CustomModalTrigger = React.createClass({
    getInitialState: function () {
        return {
            currentInfo: {},
            showModal: false,
            template: 0,
            templates: [],
            share: {editor: [], viewer: []},
            users: [],
            selectedUser: "",
            sharingType: "editor",
            currentUser: "",
            versions: [],
            validUser: "",
            submitEnabled: false,
            wells: {"username": false}
        }
    },

    close: function () {
        var wells = this.state.wells;
        _.each(wells, function (i, elem) {
            wells[elem] = false;
        });
        this.setState({
            showModal: !this.state.showModal,
            wells: wells
        }, function () {
            if (this.state.currentInfo.type !== "NEW_FILE" && this.state.currentInfo.type !== "FORGOT_PASSWORD") {
                AlertActions.hideError();
                var pageType = MainFunctions.detectPageType();
                if (pageType == 'files') FilesListActions.reloadList();
                else if (pageType == 'templates') {
                    var TemplatesActions = require('../actions/TemplatesActions');
                    TemplatesActions.reloadTemplates();
                }
                else if (pageType == 'users') {
                    var UsersActions = require('../actions/UsersActions');
                    UsersActions.reloadList();
                }
                TableActions.removeSelection();
            }
        });
    },

    componentDidMount: function () {
        ModalStore.addChangeListener(this._onChange);
        var self = this;
        $(document).keydown(function (e) {
            if (e.keyCode == 13 && self.state.showModal) {
                e.preventDefault();
                e.stopPropagation();
                self.handleSubmit();
            }
        });
    },

    toggleSubmit: function (bool) {
        this.setState({submitEnabled: bool}, null);
    },

    componentWillUnmount: function () {
        ModalStore.removeChangeListener(this._onChange);
    },

    createNewFile: function () {
        var fileName = this.refs.cform.getFormJSONed().fileName, files = FilesListStore.getCurrentFiles(), self = this;
        if (!fileName) AlertActions.showError("Filename couldn't be empty", "danger"); else {
            if (fileName.toLowerCase().indexOf('.dwg') == -1) fileName += '.dwg';
            var res = _.where(files, {name: fileName, type: "file"});
            if (!res.length) {
                var templateId = this.state.template, folderId = FilesListStore.getCurrentFolder().folderId, filejson = {filename: fileName};
                if (folderId != '-1') filejson.folderId = folderId;
                Requests.sendRequest(KudoApiUrl + '/templates/' + templateId + '/clone', "POST", JSON.stringify(filejson), JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (data) {
                    if (data.status != 'ok')
                        AlertActions.showError(data.error, "danger");
                    else {
                        self.close();
                        FilesListActions.toggleView(fileName, data.fileId, false, "viewer");
                    }
                });
            } else AlertActions.showError("Name is already used for file in destination folder", "danger");
        }
    },

    createNewFolder: function () {
        var folderName = this.refs.cform.getFormJSONed().folderName, files = FilesListStore.getCurrentFiles(), self = this;
        if (!folderName) AlertActions.showError("Folder name couldn't be empty", "danger"); else {
            var res = _.where(files, {name: folderName, type: "folder"});
            if (!res.length) {
                var folderId = FilesListStore.getCurrentFolder().folderId, folderjson = {name: folderName};
                if (folderId != '-1') folderjson.parentId = folderId;
                Requests.sendRequest(KudoApiUrl + '/folders', "POST", JSON.stringify(folderjson), JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (data) {
                    if (data.status != 'ok')
                        AlertActions.showError(data.error, "danger");
                    else
                        self.close();
                });
            } else AlertActions.showError("Name is already used for file in destination folder", "danger");
        }
    },

    shareObject: function () {
        var url = KudoApiUrl + '/' + this.state.currentInfo.additionalInfo.objType + 's/' + this.state.currentInfo.additionalInfo.objId, data = {};
        var formInfo = this.refs.cform.getFormJSONed();
        if (formInfo.username.length) {
            var userId = null;
            _.each(this.state.users, function (user) {
                if (formInfo.username == user.username || formInfo.username == user.email) userId = user._id;
            });
            data = {share: {editor: [], viewer: []}};
            if (userId == null) AlertActions.showError("Internal error", "danger"); else {
                if (formInfo.permissions == "editor")
                    data.share.editor.push(userId);
                else
                    data.share.viewer.push(userId);
                var self = this, json = {tryShare: userId};
                Requests.sendRequest(url, 'PUT', JSON.stringify(json), JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (answer) {
                    if (answer.status != 'ok')
                        AlertActions.showError(answer.error, "danger");
                    else {
                        if (!answer.possible) AlertActions.showError("This File/Folder Name is already used", "danger");
                        else
                            Requests.sendRequest(url, "PUT", JSON.stringify(data), JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (data) {
                                if (data.status != 'ok')
                                    AlertActions.showError(data.error, "danger");
                                else {
                                    var caption = self.state.currentInfo.caption.replace(/Share /ig, '');
                                    ModalActions.shareManagement(self.state.currentInfo.additionalInfo.objId, self.state.currentInfo.additionalInfo.objType, caption, self.state.currentInfo.owner);
                                    self.refs.cform.submitForm();
                                }
                            });
                    }
                });

            }
        }
        else
            AlertActions.showError("You didn't select user", "danger");
    },

    saveNewVersion: function (state) {
        /*var headers = JSON.parse(UserInfoStore.getConfig('defaultheaders'));
         headers.push({"name": "fileId", "value": state.currentInfo.id});
         headers.push({"name": "comment", "value": state.versionComment});
         Requests.sendRequest(KudoApiUrl + '/files', "POST", [], headers, function (data) {
         if (data.status != 'ok')
         AlertActions.showError(data.error, "danger");
         });
         ModalActions.versionsManagement(null, state.currentInfo.id, state.currentInfo.objtype);*/
    },
    moveFiles: function () {
        FilesListActions.moveSelected(FilesListStore.getSelectedMove());
        FilesListActions.reloadList();
        this.close();
    },

    forgotPassword: function () {
        var req = {"email": this.refs.cform.getFormJSONed().email}, self = this;
        Requests.sendRequest(KudoApiUrl + '/users/resetrequest', 'POST', JSON.stringify(req), [], function (answer) {
            if (answer.status != 'ok')
                AlertActions.showError(answer.error, "danger");
            else
                AlertActions.showError("Instructions have been sent to your email", "info");
            self.close();
        })
    },

    requestAccess: function () {
        var self = this;
        Requests.sendRequest(KudoApiUrl + '/files/' + this.state.currentInfo.additionalInfo.fileId + '/request', 'POST', null, JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (answer) {
            if (answer.status != 'ok')
                Storage.store('error', JSON.stringify({message: answer.error, type: "danger"}));
            else
                Storage.store('error', JSON.stringify({
                    message: "Request has been sent to owner's email",
                    type: "info"
                }));
            self.close();
        })
    },

    handleSubmit: function (formRef) {
        var self = this;
        if (typeof formRef != "undefined" || typeof this.refs.cform != "undefined")
            switch (this.state.currentInfo.type) {
                case 'VERSIONS':
                    //this.saveNewVersion();
                    console.warn("Versions control aren't implemented");
                    break;
                case 'SHARE':
                    this.shareObject();
                    break;
                case 'FORGOT_PASSWORD':
                    this.forgotPassword();
                    break;
                case 'NEW_FOLDER':
                    if (this.refs.cform.getFormJSONed().folderName)
                        this.createNewFolder();
                    else AlertActions.showError("Folder name couldn't be empty", "danger");
                    break;
                case 'NEW_FILE':
                    if (this.refs.cform.getFormJSONed().fileName)
                        this.createNewFile();
                    else AlertActions.showError("File name couldn't be empty", "danger");
                    break;
                case 'DELETE_OBJECT':
                    if (this.state.infoStyle == "info") FilesListActions.deleteSelected();
                    this.close();
                    break;
                case 'ERASE_OBJECTS':
                    FilesListActions.eraseSelected();
                    this.close();
                    break;
                case 'REQUEST_ACCESS':
                    this.requestAccess();
                    break;
                case 'RESTORE_DUPLICATES':
                    FilesListStore.restoreApproved();
                    this.close();
                    break;
                case 'MOVE_OBJECTS':
                    if (FilesListStore.getSelectedMove() && FilesListStore.getSelectedMove().length)
                        this.moveFiles();
                    else AlertActions.showError("You didn't choose target folder", "danger");
                    break;
                case 'PROFILE_SETTINGS':
                    Requests.sendRequest(KudoApiUrl + '/users', 'PUT', JSON.stringify(this.refs[formRef].getFormJSONed()), JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (answer) {
                        if (answer.status != 'ok') AlertActions.showError(answer.error, 'danger');
                        else {
                            AlertActions.showError("Profile information has been successfully changed", "success");
                            Requests.sendRequest(KudoApiUrl + '/users', 'GET', null, JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (answer) {
                                if (answer.status == 'ok') {
                                    var currInfo = self.state.currentInfo;
                                    currInfo.additionalInfo.user = answer.results[0];
                                    self.setState({currentInfo: currInfo}, UsersInfoActions.resetUserInfo(answer.results[0]));
                                }
                            });
                        }
                    });
                    break;
                case 'CHANGE_EDITOR':
                    Storage.store('editor', this.refs.cform.getFormJSONed().editor);
                    FilesListActions.toggleView(this.state.currentInfo.additionalInfo.file.fileName, this.state.currentInfo.additionalInfo.file._id, this.state.currentInfo.additionalInfo.file.viewOnly, "viewer");
                    this.close();
                    break;
                default:
                    console.error("No function found for request");
                    this.close();
            }
    },

    handleDeshare: function (id) {
        var state = this.state, url = KudoApiUrl + '/' + state.currentInfo.additionalInfo.objType + 's/' + state.currentInfo.additionalInfo.objId, data = {deshare: [id]};
        Requests.sendRequest(url, "PUT", JSON.stringify(data), JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (data) {
            if (data.status != 'ok')
                AlertActions.showError(data.error, "danger");
        });
        state.currentInfo.type = "SHARE";
        var caption = state.currentInfo.caption.replace(/Share /ig, '');
        ModalActions.shareManagement(state.currentInfo.additionalInfo.objId, state.currentInfo.additionalInfo.objType, caption, state.currentInfo.owner);
        this.refs.cform.submitForm();
    },

    toggleWell: function (mode) {
        var wells = this.state.wells;
        _.each(wells, function (i, elem) {
            if (elem != mode) wells[elem] = false;
        });
        wells[mode] = !wells[mode];
        this.setState({wells: wells}, null);
    },

    render: function () {
        var handleDeshare = this.handleDeshare, toggleSubmit = this.toggleSubmit, objects = FilesListStore.getMultiSelected();
        return (
            <div>
                <Modal show={this.state.showModal} onHide={this.close} animation={true}>
                    <Modal.Header closeButton>
                        <Modal.Title>{MainFunctions.shrinkString(this.state.currentInfo.caption)}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.state.currentInfo.type == "NEW_FOLDER" ?
                            (
                            <ControlledForm ref="cform">
                                <div className="inputHint">Folder name</div>
                                <ValidInput type="text" ref="firstInput" name="folderName" placeholder="Folder name"
                                            autofocus required checkType="noCheck"/>
                            </ControlledForm>
                                ) : ""}
                        {this.state.currentInfo.type == "NEW_FILE" ?
                            (
                            <ControlledForm ref="cform">
                                <ValidInput type="text" name="fileName" placeholder="File name"
                                            onChange={this.setFileName} autofocus required checkType="noCheck"/>
                                <Input type="select" onChange={this.setTemplate} name="template">
                                    {this.state.currentInfo.additionalInfo.templates.map(function (elem) {
                                        return (<option key={elem._id} value={elem._id}>{elem.name}</option>)
                                        })}
                                </Input>
                            </ControlledForm>
                                ) : ""}
                        {this.state.currentInfo.type == "REQUEST_ACCESS" ?
                            (
                            <ControlledForm ref="cform">
                                <div className={"deleteNotify " + this.state.infoStyle}>
                                    <span>{"Do you want to send file access request to the owner?"}</span>
                                </div>
                            </ControlledForm>
                                ) : ""}
                        {this.state.currentInfo.type == "RESTORE_DUPLICATES" ?
                            (
                            <ControlledForm ref="cform">
                                <div>
                                    <span>{"You're trying to restore objects with names, already used in destination folders. Please rename them or cancel restore of them."}</span>
                                    {this.state.currentInfo.additionalInfo.duplicates.map(function (elem, i) {
                                        return (
                                        <SingleDuplicate toggleSubmit={toggleSubmit} elem={elem}
                                                         key={i}></SingleDuplicate>
                                            )
                                        })}
                                </div>
                            </ControlledForm>
                                ) : ""}
                        {this.state.currentInfo.type == "FORGOT_PASSWORD" ?
                            (
                            <ControlledForm ref="cform">
                                <div className="inputHint">Your email</div>
                                <ValidInput autofocus type="email" checkType="isEmail" name="email"
                                            placeholder="Your email"/>
                            </ControlledForm>
                                ) : ""}
                        {(this.state.currentInfo.type == "DELETE_OBJECT" || this.state.currentInfo.type == "ERASE_OBJECTS") ?
                            (
                            <ControlledForm ref="cform">
                                <div className={"deleteNotify " + this.state.infoStyle}>
                                    {this.state.message}
                                </div>
                            </ControlledForm>
                                ) : ""}
                        {this.state.currentInfo.type == "SHARE" ?
                            (
                            <div>
                                <div className="headedblock">
                                    <ControlledForm ref="cform">
                                        <div className="inputHint">Username or email</div>
                                        <ValidInput type="text" name="username" placeholder="Username or email"
                                                    autofocus checkType="notList" list={this.state.users}
                                                    defValue="" required/>

                                        <div className="inputHint">Permissions</div>
                                        <Input type="select" name="permissions" value="editor">
                                            <option value="editor">Editor</option>
                                            <option value="viewer">Viewer</option>
                                        </Input>
                                        <Button onClick={this.handleSubmit} className="shareButton">Share</Button>
                                    </ControlledForm>
                                </div>
                                <div className="clear"></div>
                                <div className="headedblock">
                                    <div className="headingwrapper">
                                        <h4>Currently shared</h4>
                                    </div>
                                    <Table striped hover condensed className="sharingtable">
                                        <thead>
                                            <th>Name</th>
                                            <th>Permissions</th>
                                        </thead>
                                        <tbody>
                                            {this.state.share.editor.map(function (elem, i) {
                                                return (<SharingUser key={i} elem={elem} type="Editor"
                                                                     deshare={handleDeshare}/>)
                                                })}
                                            {this.state.share.viewer.map(function (elem, i) {
                                                return (
                                                <SharingUser key={i} elem={elem} type="Viewer"
                                                             deshare={handleDeshare}/>
                                                    )
                                                })}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                                ) : ""}
                        {this.state.currentInfo.type == "PROFILE_SETTINGS" ?
                            (
                            <div className="profileSettings">
                                <div
                                    className={"collapsibleArea " + (this.state.wells.username ? "opened" : "closed")}>
                                    <div className="optionOverlay" onClick={this.toggleWell.bind(null, "username")}>
                                        <div className="caption">Username</div>
                                    </div>
                                    <Collapse in={this.state.wells.username}>
                                        <div>
                                            <ControlledForm ref="form1">
                                                <div className="inputHint">Username</div>
                                                <ValidInput name="username" type="text" autofocus checkType="Login"
                                                            defValue={this.state.currentInfo.additionalInfo.hasOwnProperty('user') ? this.state.currentInfo.additionalInfo.user.username : ""}/>

                                                <div className="inputHint">Please provide password to save changes
                                                </div>
                                                <input className="hidden" type="password"
                                                       name="fakepasswordremembered"/>
                                                <ValidInput type="password" required checkType="noCheck"
                                                            name="currentPass" placeholder="Password"
                                                            defaultValue="" autocomplete="off"/>
                                                <Button onClick={this.handleSubmit.bind(null, "form1")}
                                                        bsStyle="info">Submit
                                                </Button>
                                            </ControlledForm>
                                        </div>
                                    </Collapse>
                                </div>
                                <div
                                    className={"collapsibleArea " + (this.state.wells.email ? "opened" : "closed")}>
                                    <div className="optionOverlay" onClick={this.toggleWell.bind(null, "email")}>
                                        <div className="caption">Email</div>
                                    </div>
                                    <Collapse in={this.state.wells.email}>
                                        <div>
                                            <ControlledForm ref="form2">
                                                <div className="inputHint">Email</div>
                                                <ValidInput name="email" type="text" autofocus checkType="isEmail"
                                                            defValue={this.state.currentInfo.additionalInfo.hasOwnProperty('user') ? this.state.currentInfo.additionalInfo.user.email : ""}/>

                                                <div className="inputHint">Please provide password to save changes
                                                </div>
                                                <input className="hidden" type="password"
                                                       name="fakepasswordremembered"/>
                                                <ValidInput type="password" required checkType="noCheck"
                                                            name="currentPass" placeholder="Password"
                                                            defaultValue="" autocomplete="off"/>
                                                <Button onClick={this.handleSubmit.bind(null, "form2")}
                                                        bsStyle="info">Submit
                                                </Button>
                                            </ControlledForm>
                                        </div>
                                    </Collapse>
                                </div>
                                <div className={"collapsibleArea " + (this.state.wells.name ? "opened" : "closed")}>
                                    <div className="optionOverlay" onClick={this.toggleWell.bind(null, "name")}>
                                        <div className="caption">Name and surname</div>
                                    </div>
                                    <Collapse in={this.state.wells.name}>
                                        <div>
                                            <ControlledForm ref="form3">
                                                <div className="inputHint">Name</div>
                                                <ValidInput name="name" type="text" autofocus checkType="isAlpha"
                                                            defValue={this.state.currentInfo.additionalInfo.hasOwnProperty('user') ? this.state.currentInfo.additionalInfo.user.name : ""}/>

                                                <div className="inputHint">Surname</div>
                                                <ValidInput name="surname" type="text" checkType="isAlpha"
                                                            defValue={this.state.currentInfo.additionalInfo.hasOwnProperty('user') ? this.state.currentInfo.additionalInfo.user.surname : ""}/>
                                                <Button onClick={this.handleSubmit.bind(null, "form3")}
                                                        bsStyle="info">Submit
                                                </Button>
                                            </ControlledForm>
                                        </div>
                                    </Collapse>
                                </div>
                                <div
                                    className={"collapsibleArea " + (this.state.wells.password ? "opened" : "closed")}>
                                    <div className="optionOverlay" onClick={this.toggleWell.bind(null, "password")}>
                                        <div className="caption">Password</div>
                                    </div>
                                    <Collapse in={this.state.wells.password}>
                                        <div>
                                            <ControlledForm ref="form4">
                                                <div className="inputHint">Current password</div>
                                                <input className="hidden" type="password"
                                                       name="fakepasswordremembered"/>
                                                <ValidInput name="currentPass" type="password" required autofocus
                                                            checkType="noCheck" defValue="" autocomplete="off"
                                                            placeholder="Current password"/>

                                                <div className="inputHint">New password</div>
                                                <ValidInput name="newPass" type="password" checkStrength required
                                                            checkType="noCheck" defValue=""
                                                            placeholder="New password"/>

                                                <div className="inputHint">Retype new password</div>
                                                <ValidInput name="newPassConfirm" type="password" required
                                                            checkType="ReNewPass" defValue=""
                                                            placeholder="Retype new password"/>
                                                <Button onClick={this.handleSubmit.bind(null, "form4")}
                                                        bsStyle="info">Submit
                                                </Button>
                                            </ControlledForm>
                                        </div>
                                    </Collapse>
                                </div>
                            </div>
                                ) : ""}
                        {this.state.currentInfo.type == "CHANGE_EDITOR" ? (
                        <ControlledForm ref="cform">
                            <div className="inputHint">Editor url</div>
                            <ValidInput type="text" name="editor" checkType="noCheck" required autofocus
                                        defValue={UserInfoStore.getConfig('editor')}/>
                        </ControlledForm>
                            ) : ""}
                        {this.state.currentInfo.type == "VERSIONS" ?
                            (
                            <div>
                                <div className="headedblock">
                                    <div className="headingwrapper">
                                        <h4>Save new version</h4>
                                    </div>
                                    <form>
                                        <Input type="text" placeholder="Version comment"
                                               onChange={this.setVersionComment}/>
                                        <Button onClick={this.handleSubmit}>Save</Button>
                                    </form>
                                </div>
                                <div className="clear"></div>
                                <div className="headedblock">
                                    <div className="headingwrapper">
                                        <h4>Current versions</h4>
                                    </div>
                                    <Table striped hover condensed className="sharingtable">
                                        <thead>
                                            <th>Version number</th>
                                            <th>Name</th>
                                        </thead>
                                        <tbody>
                                            {this.state.versions.map(function (elem) {
                                                return (<Version elem={elem}/>)
                                                })}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                                ) : ""}
                        {this.state.currentInfo.type == "MOVE_OBJECTS" ?
                            (
                            <div>
                                <ControlledForm ref="cform">
                                    <div className="headedblock">
                                        <div className="headingwrapper">
                                            <h4>Selected objects</h4>
                                        </div>
                                    </div>
                                    {objects.map(function (elem, i) {
                                        return (<div key={i} className="square-object">
                                            <div className={elem.type}></div>
                                            <div className="caption">{elem.name}</div>
                                        </div>)
                                        })}
                                    <div className="clear"></div>
                                    <div className="headedblock">
                                        <div className="headingwrapper">
                                            <h4>Move to</h4>
                                        </div>
                                    </div>
                                    <Tree />
                                </ControlledForm>
                            </div>
                                ) : ""}
                    </Modal.Body>
                    {this.state.currentInfo.type == "PROFILE_SETTINGS" ? (
                    <Modal.Footer>
                        <Button onClick={this.close}>Cancel</Button>
                    </Modal.Footer>
                        ) : ""}
                    {this.state.currentInfo.type == "RESTORE_DUPLICATES" ? (
                    <Modal.Footer>
                        {this.state.submitEnabled ? (<Button onClick={this.handleSubmit}>Restore files</Button>) : (
                        <Button disabled={true}>Restore files</Button>)}
                        <Button onClick={this.close}>Cancel</Button>
                    </Modal.Footer>
                        ) : ""}
                    {this.state.currentInfo.type == "REQUEST_ACCESS" ? (
                    <Modal.Footer>
                        <Button onClick={this.handleSubmit}>Send request</Button>
                        <Button onClick={this.close}>Cancel</Button>
                    </Modal.Footer>
                        ) : ""}
                    {this.state.currentInfo.type == "DELETE_OBJECT" ? (
                    <Modal.Footer>
                        <Button
                            onClick={this.handleSubmit}>{this.state.infoStyle == "info" ? "Delete my file(s)/folder(s)" : "Ok"}</Button>
                        {this.state.infoStyle == "info" ? (<Button onClick={this.close}>Cancel</Button>) : ""}
                    </Modal.Footer>
                        ) : ""}
                    {this.state.currentInfo.type == "ERASE_OBJECTS" ? (
                    <Modal.Footer>
                        <Button onClick={this.handleSubmit}>Erase my file(s)/folder(s)</Button>
                        <Button onClick={this.close}>Cancel</Button>
                    </Modal.Footer>
                        ) : ""}
                    {this.state.currentInfo.type != "DELETE_OBJECT" && this.state.currentInfo.type != "ERASE_OBJECTS" && this.state.currentInfo.type != "SHARE" && this.state.currentInfo.type != "REQUEST_ACCESS" && this.state.currentInfo.type != "RESTORE_DUPLICATES" && this.state.currentInfo.type != "PROFILE_SETTINGS" ? (
                    <Modal.Footer>
                        <Button onClick={this.handleSubmit}>Submit</Button>
                    </Modal.Footer>
                        ) : ""}
                </Modal>
            </div>
        );
    },

    _onChange: function () {
        this.setState(getModalData(), function () {
            var self = this;
            if (this.state.currentInfo.type == "NEW_FILE")
                this.setState({template: this.state.currentInfo.additionalInfo.templates[0]._id}, null);
            else if (this.state.currentInfo.type == "DELETE_OBJECT") {
                var selected = FilesListStore.getMultiSelected(), checkList = [];
                _.each(selected, function (elem) {
                    if (elem.type == "folder" && elem.shared) checkList.push(elem);
                });
                var count = checkList.length;
                if (!count) this.setState({
                    message: "Are you sure that you want to delete your file(s)/folder(s)?",
                    infoStyle: "info"
                }, null);
                else
                    _.each(checkList, function (elem) {
                        Requests.sendRequest(KudoApiUrl + '/folders/' + elem.id + '/owners', 'GET', null, JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (answer) {
                            var owners = _.without(_.uniq(answer.result), UserInfoStore.getConfig('username'));
                            if (!owners || !owners.length) checkList = _.without(checkList, elem);
                            else elem.owners = owners;
                            count--;
                            if (!count) {
                                if (checkList && checkList.length) {
                                    var errorMessage = "";
                                    _.each(checkList, function (checkEl) {
                                        errorMessage += "Folder " + checkEl.name + " has files/folders owned by the following users: " + checkEl.owners + ".";
                                    });
                                    errorMessage += "Please ask them to delete or move these files/folders.";
                                    self.setState({message: errorMessage, infoStyle: "warning"}, null);
                                } else
                                    self.setState({
                                        message: "Are you sure that you want to delete your file(s)/folder(s)?",
                                        infoStyle: "info"
                                    }, null);
                            }
                        })
                    });
            } else if (this.state.currentInfo.type == "ERASE_OBJECTS") {
                self.setState({
                    message: "Are you sure that you want to erase your file(s)/folder(s)? You will be unable to restore them in future.",
                    infoStyle: "info"
                }, null);
            } else if (this.state.currentInfo.type == "CHANGE_EDITOR") {
                Requests.sendRequest(KudoApiUrl + '/files/' + this.state.currentInfo.additionalInfo.file.id + '/info', 'GET', null, JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (answer) {
                    if (answer.status = 'ok') {
                        var current = self.state.currentInfo;
                        current.additionalInfo.file = answer;
                        self.setState({currentInfo: current}, null);
                    }
                })
            }
            else if (this.state.currentInfo.type == "RESTORE_DUPLICATES") {
                this.setState({submitEnabled: FilesListStore.getRestoreFlag().length ? true : false}, null);
            }
            else if (this.state.currentInfo.type == "SHARE") {
                if (!this.state.currentUser.length)
                    Requests.sendRequest(KudoApiUrl + '/users', "GET", null, JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (data) {
                        if (data.status == 'ok')
                            self.setState({currentUser: data.results[0]._id}, UsersInfoActions.resetUserInfo(data.results[0]));
                        else AlertActions.showError(data.error, "danger");
                    });
                var headers = JSON.parse(UserInfoStore.getConfig('defaultheaders'));
                headers.push({name: "pattern", value: "."});
                Requests.sendRequest(KudoApiUrl + '/users/find', "GET", [], headers, function (data) {
                    if (!data.error) {
                        var filtered = data.filter(function (elem) {
                            return (elem._id != self.state.currentUser && elem.username != self.state.currentInfo.additionalInfo.objOwner)
                        });
                        Requests.sendRequest(KudoApiUrl + '/' + self.state.currentInfo.additionalInfo.objType.toLowerCase() + 's/' + self.state.currentInfo.additionalInfo.objId + '/info', "GET", [], JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (data) {
                            if (data.status == 'ok') {
                                var share = [];
                                _.each(data.share.viewer, function (elem) {
                                    share.push(elem._id);
                                });
                                _.each(data.share.editor, function (elem) {
                                    share.push(elem._id);
                                });
                                filtered = _.filter(filtered, function (user) {
                                    var flag = true;
                                    for (var record in share) {
                                        if (user._id == share[record]) flag = false;
                                    }
                                    return flag;
                                });
                                self.setState({users: filtered, share: data.share}, null);
                            }
                            else AlertActions.showError(data.error, "danger");
                        });

                    } else AlertActions.showError(data.error, "danger");
                });
            }
        });
        this.setState({showModal: true, validUser: ""}, null);
    }
});

module.exports = CustomModalTrigger;