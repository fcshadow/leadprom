/**
 * Created by developer123 on 17.02.15.
 */
"use strict";
var React = require('react');
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var ButtonGroup = require('react-bootstrap').ButtonGroup;
var Button = require('react-bootstrap').Button;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Tooltip = require('react-bootstrap').Tooltip;
var ProgressBar = require('react-bootstrap').ProgressBar;
var $ = require('jquery');
var _ = require('underscore');
var SearchField = require('./SearchField');
var StorageSwitch = require('./StorageSwitch');
var ModalActions = require('../actions/ModalActions');
var AlertActions = require('../actions/AlertActions');
var FilesListActions = require('../actions/FilesListActions');
var TemplatesActions = require('../actions/TemplatesActions');
var FilesListStore = require('../stores/FilesListStore');
var TableStore = require('../stores/TableStore');
var Storage = require('../libs/Storage');
var Requests = require('../libs/Requests');
var MainFunctions = require('../libs/MainFunctions');
var UserInfoStore = require('../stores/UserInfoStore');
var KudoApiUrl = UserInfoStore.getConfig('api') || "";

var ControlPanel = React.createClass({
    getInitialState: function () {
        return {
            percents: [],
            disabled: {},
            mode: "uploaded"
        }
    },

    createNewFolderModal: function (e) {
        ModalActions.createFolder(this.createNewFolder);
        e.currentTarget.blur();
    },

    createNewFileModal: function (e) {
        e.currentTarget.blur();
        Requests.sendRequest(KudoApiUrl + '/templates', "GET", [], JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (data) {
            if (data.status !== 'ok' || !data.results.length) {
                AlertActions.showError(data.error || "You should upload templates first", "danger");
            } else
                ModalActions.createFile(data.results);
        });
    },

    uploadSimulation: function (e) {
        e.preventDefault();
        e.currentTarget.blur();
        $('#dwgupload').click();
    },

    handleUpload: function (e) {
        e.currentTarget.blur();
        var files = $('input#dwgupload')[0].files, self = this;
        var filesmap = $.map(files, function (value) {
            return [value];
        });
        var results = TableStore.getTable().results, duplicates = "", duplicatesMessage = "You're trying to upload those files with duplicated names: ";
        $.each(MainFunctions.intersect(results, filesmap), function (i, elem) {
            duplicates += "\n " + elem.name;
        });
        var duplicateFiles = MainFunctions.intersect(results, filesmap), message = "", infoType = "success";
        if (duplicateFiles.length) {
            message = duplicatesMessage + duplicates + "\r\n";
            infoType = "danger";
        }
        if (duplicateFiles.length !== filesmap.length) {
            var fd = [],
                folderId = (FilesListStore.getCurrentFolder().folderId == -1) ? null : FilesListStore.getCurrentFolder().folderId,
                headers = JSON.parse(UserInfoStore.getConfig('defaultheaders')),
                over = this, i = 0, clearedFiles = [];
            for (var key in filesmap) {
                if (filesmap.hasOwnProperty(key)) {
                    var flag = _.find(duplicateFiles, function (elem) {
                        return elem.name == filesmap[key].name;
                    });
                    if (typeof flag == "undefined") {
                        fd[i] = new FormData();
                        clearedFiles[i] = filesmap[key];
                        fd[i++].append(0, filesmap[key]);
                    }
                }
            }
            if (folderId && this.props.type == "files") headers.push({"name": "folderId", "value": folderId});
            var cnt = fd.length, uploadlist = [], url = KudoApiUrl + (this.props.type == "templates" ? '/admin/templates' : '/files');
            i = 0;
            _.each(fd, function (fdElement, fi) {
                Requests.sendRequest(url, "POST", fdElement, headers, function (data) {
                    if (data.status != 'ok') {
                        message += "Error uploading file " + clearedFiles[i].name + ": " + data.error + '\n\r';
                        infoType = "danger";
                    } else {
                        var percents = over.state.percents;
                        percents[fi].cnt = -1;
                        over.setState({percents: percents}, null);
                        uploadlist.push(data.fileId);
                    }
                    if (!--cnt) {
                        if (!message) message = self.props.type + " are uploaded successfully";
                        over.setState({mode: "uploaded", percents: []}, null);
                        AlertActions.showError(message, infoType);
                        if (self.props.type == "files") FilesListActions.reloadList();
                        else TemplatesActions.reloadTemplates();
                        setTimeout(function () {
                            $.each(uploadlist, function (i, elem) {
                                $('tr#' + elem).addClass('uploaded');
                            });
                        }, 200);
                    }
                }, true, function () {
                    var myXhr = $.ajaxSettings.xhr();
                    if (myXhr.upload) {
                        over.setState({mode: "uploading"}, null);
                        myXhr.upload.addEventListener('progress', function showProgress(evt) {
                            if (evt.lengthComputable) {
                                var list = over.state.percents;
                                list[fi] = {name: filesmap[fi].name, cnt: Math.floor((evt.loaded / evt.total) * 100)};
                                over.setState({percents: list}, console.log(over.state.percents));
                            }
                        }, false);
                    } else
                        console.warn("Uploadress is not supported.");
                    return myXhr;
                }, false, "!true");
            });
        } else AlertActions.showError(message, infoType);
        $('#dwgupload').val('');
    },

    switchTrash: function (e) {
        e.currentTarget.blur();
        if (e.button == 0) {
            e.preventDefault();
            if (FilesListStore.getCurrentState() !== "trash")
                FilesListActions.toggleView(FilesListStore.getCurrentTrashFolder().folderName, FilesListStore.getCurrentTrashFolder().folderId, false, "trash");
            else
                FilesListActions.toggleView(FilesListStore.getCurrentFolder().folderName, FilesListStore.getCurrentFolder().folderId, false, "browser");
        }
    },

    componentDidMount: function () {
        FilesListStore.addSelectListener(this._onSelect);
        FilesListStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {
        FilesListStore.removeSelectListener(this._onSelect);
        FilesListStore.removeChangeListener(this._onChange);
    },

    render: function () {
        return (
            <div className="controlpanel">
                {this.state.mode == "uploading" ? (
                <div className="uploading">
                    {this.state.percents.map(function (elem) {
                        if (elem.cnt!==-1)
                            return (
                            <div className="uploadOverlay">
                                <span className="uploadSpan">{elem.name}</span>
                                <ProgressBar className="uploadbar" bsStyle="warning" active min={0} max={100}
                                             now={elem.cnt} label='%(percent)s%'/>
                            </div>
                                )
                        })}
                </div>
                    ) : ""}
                <form className="uploadform">
                    <input id="dwgupload" name="file" type="file"
                           accept=".dwg,.dwt,application/acad,image/vnd.dwg,image/vnd.dwt" multiple
                           onChange={this.handleUpload}/>
                </form>
                <SearchField type="files"/>
                {this.props.type=="files"?(
                <StorageSwitch />
                    ):""}
                <ButtonToolbar>
                    <ButtonGroup>
                        {this.props.type=="files"?(
                        <OverlayTrigger placement="top" overlay={<Tooltip>Create new folder</Tooltip>}>
                            <Button className="imginner" onClick={this.createNewFolderModal}
                                    disabled={this.state.disabled.viewOnly || FilesListStore.getCurrentState() == "trash" ? true : false}>
                                <img src={UserInfoStore.getConfig('path') + "images/newfolder.png"}/>
                            </Button>
                        </OverlayTrigger>
                            ):""}
                        {this.props.type=="files"?(
                        <OverlayTrigger placement="top" overlay={<Tooltip>Create new drawing</Tooltip>}>
                            <Button className="imginner" onClick={this.createNewFileModal}
                                    disabled={this.state.disabled.viewOnly || FilesListStore.getCurrentState() == "trash" ? true : false}>
                                <img src={UserInfoStore.getConfig('path') + "images/newfile.png"}/>
                            </Button>
                        </OverlayTrigger>
                            ):""}
                        <OverlayTrigger placement="top" overlay={<Tooltip>Upload file</Tooltip>}>
                            <Button className="imginner" onClick={this.uploadSimulation}
                                    disabled={this.state.disabled.viewOnly || FilesListStore.getCurrentState() == "trash" ? true : false}>
                                <img src={UserInfoStore.getConfig('path') + "images/upload.png"}/>
                            </Button>
                        </OverlayTrigger>
                        {this.props.type=="files"?(
                        <OverlayTrigger placement="top"
                                        overlay={<Tooltip>{"Switch " + (FilesListStore.getCurrentState() == "trash" ? "from" : "to") + " trash"}</Tooltip>}>
                            <Button className="trash imginner" onClick={this.switchTrash}>
                                <img src={UserInfoStore.getConfig('path') + "images/trash.png"} className="trash"/>
                            </Button>
                        </OverlayTrigger>
                            ):""}
                    </ButtonGroup>
                </ButtonToolbar>
            </div>
        )
    },

    _onSelect: function () {
        this.forceUpdate();
    },

    _onChange: function () {
        this.setState({
            disabled: FilesListStore.getCurrentFolder().additional || {}
        });
    }
});

module.exports = ControlPanel;