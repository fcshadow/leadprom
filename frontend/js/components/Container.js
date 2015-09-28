/**
 * Created by developer123 on 17.02.15.
 */
"use strict";
var React = require('react');
var Button = require('react-bootstrap').Button;
var Input = require('react-bootstrap').Input;
var DropdownButton = require('react-bootstrap').DropdownButton;
var MenuItem = require('react-bootstrap').MenuItem;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Tooltip = require('react-bootstrap').Tooltip;
var ContextMenu = require('./ContextMenu');
var $ = require('jquery');
var FilesListActions = require('../actions/FilesListActions');
var TableActions = require('../actions/TableActions');
var FilesListStore = require('../stores/FilesListStore');
var UserInfoStore = require('../stores/UserInfoStore');
var TableStore = require('../stores/TableStore');
var AlertActions = require('../actions/AlertActions');
var ContextMenuActions = require('../actions/ContextMenuActions');
var Storage = require('../libs/Storage');
var Requests = require('../libs/Requests');
var MainFunctions = require('../libs/MainFunctions');
var KudoApiUrl = UserInfoStore.getConfig('api') || "";
var supportedTypes = ["dwg", "dwt", "dxf", "folder"];

var Container = React.createClass({
    getInitialState: function () {
        return {
            info: this.props.element,
            rename: false,
            showOptions: "hideoptions"
        };
    },

    nameClickHandler: function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!this.state.rename && this.props.type == "files")
            if (this.state.info.type == "folder")
                FilesListActions.changeFolder(this.state.info.name, this.state.info.id, this.state.info.viewOnly);
            else if (FilesListStore.getCurrentState() !== "trash")
                FilesListActions.toggleView(this.state.info.name, this.state.info.id, this.state.info.viewOnly, "viewer");
    },

    handleClick: function (e) {
        if (e.button === 0) {
            if (!($(e.target).is('button')) && !($(e.target).parent().is('li')) && !($(e.target).is('img')))
                if (!e.ctrlKey)
                    TableActions.selectObject(this.state.info);
                else if (e.ctrlKey)
                    TableActions.addToSelected(this.state.info);
        }
    },

    rename: function () {
        this.setState({rename: true}, null);
    },

    toggleActions: function () {
        this.setState({showOptions: "showoptions"}, null);
    },

    blurRename: function (e) {
        var newobjname = e.target.value,
            self = this,
            json = {};
        if (!newobjname.length) {
            AlertActions.showError("You cannot set empty name", "danger");
            this.setState({rename: false}, null);
        } else if (TableStore.isInList(newobjname, this.state.info.name, this.state.info.type)) {
            AlertActions.showError("You cannot set name that is already used", "danger");
            this.setState({rename: false}, null);
        }
        else {
            switch (this.props.type) {
                case 'files':
                    if (this.state.info.type == 'folder') json.folderName = newobjname; else json.fileName = newobjname;
                    var url = KudoApiUrl + "/" + ((this.state.info.type == "folder") ? "folders" : "files") + "/" + this.state.info.id;
                    Requests.sendRequest(url, "PUT", JSON.stringify(json), JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (data) {
                        if (data.status != 'ok') {
                            AlertActions.showError(data.error, "danger");
                            self.setState({rename: false}, null);
                        }
                        else {
                            var stateInfo = self.state.info;
                            stateInfo.name = newobjname;
                            self.setState({rename: false, info: stateInfo}, null);
                        }
                    });
                    break;
                case 'templates':
                    json.name = newobjname;
                    Requests.sendRequest(KudoApiUrl + '/admin/templates/' + this.state.info.id, "PUT", JSON.stringify(json), JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (data) {
                        if (data.status != 'ok') {
                            AlertActions.showError(data.responseText, "danger");
                            self.setState({rename: false}, null);
                        }
                        else {
                            var stateInfo = self.state.info;
                            stateInfo.name = newobjname;
                            self.setState({rename: false, info: stateInfo}, null);
                        }
                    });
                    break;
            }
        }
    },

    renameEnd: function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            this.blurRename(e);
        }
        else if (e.keyCode == 27) {
            e.preventDefault();
            this.setState({rename: false}, null);
        }

    },

    renameChange: function (e) {
        this.setState({newname: e.target.value}, null);
    },

    showMenu: function (e) {
        if (!TableStore.isSelected(this.state.info.id))
            TableActions.selectObject(this.state.info);
        var evt = window.event || e;
        if (!$(evt.target).is('input')) {
            evt.preventDefault();
            this.state.info.rename = this.rename;
            var top = evt.pageY,
                left = evt.pageX;
            ContextMenuActions.showMenu(left, top, this.state.info, this.props.type, this.state.info.shared ? true : false);
        }
    },

    componentWillReceiveProps: function (newProps) {
        if (MainFunctions.objectDiff(newProps, this.props)) this.setState({info: newProps.element}, null);
    },

    hideTooltip: function () {
        if (this.refs.namespan.getDOMNode().offsetWidth <= this.refs.wddiv.getDOMNode().offsetWidth) this.refs.trigger.hide();
    },

    componentDidMount: function () {
        UserInfoStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {
        UserInfoStore.removeChangeListener(this._onChange);
    },

    render: function () {
        var search = TableStore.getSearch(), values = {}, splitted = {}, matches = {}, fields = TableStore.getTable().fields, renderFlag = false;
        for (var elem in fields) {
            if (fields.hasOwnProperty(elem)) {
                if (fields[elem].search) {
                    splitted[elem] = [];
                    matches[elem] = [];
                }
                values[elem] = this.state.info[elem];
            }
        }
        if (this.props.type == 'files') values['modified'] = this.state.info.updateDate || this.state.info.creationDate;
        else if (this.props.type == 'users') {
            var format = "";
            if (((this.state.info.name || "") + (this.state.info.surname || "")).length) {
                format += " (";
                if ((this.state.info.name || "").length) {
                    format += this.state.info.name;
                    if ((this.state.info.surname || "").length)
                        format += " " + this.state.info.surname + ")";
                    else format += ")";
                } else if ((this.state.info.surname || "").length)
                    format += this.state.info.surname + ")";
            }
            values['username'] = values['username'] + format;
        }
        if (typeof search == "object" && search.source.length > 0) {
            for (elem in fields) {
                if (fields.hasOwnProperty(elem)) {
                    if (fields[elem].search) {
                        if (MainFunctions.searchOverlay(values[elem], search)) {
                            splitted[elem] = values[elem].split(search);
                            if (values[elem].match(search))
                                matches[elem] = values[elem].match(search);
                        }
                    }
                }
            }
        }
        for (elem in splitted) {
            if (splitted.hasOwnProperty(elem)) {
                if (splitted[elem].length > 1) renderFlag = true;
            }
        }
        if ((typeof search == "object" && search.source.length == 0) || (typeof search == "string" && search.length == 0)) renderFlag = true;
        switch (this.props.type) {
            case 'files':
                var ext = MainFunctions.getIconClassName(ext, this.state.info.type, values['name']);
                if (renderFlag)
                    return (
                        <tr className={this.props.multiselected + " " + this.state.info.type}
                            onMouseDown={this.handleClick}
                            id={this.state.info.id} onContextMenu={this.showMenu}>
                            <td>
                                <img className={"containerTypeImage"}
                                     src={UserInfoStore.getConfig('path') + 'images/icons/' + ext + '.png'}></img>
                                {this.state.rename ? (
                                <div
                                    className={"openObject "+(supportedTypes.indexOf(ext)!==-1?"supported":"unsupported")}>
                                    <input className="nameEdit" onBlur={this.blurRename} onKeyDown={this.renameEnd}
                                           onChange={this.renameChange} ref="name" autoFocus
                                           defaultValue={values['name']}/>
                                </div>) : (
                                <div
                                    className={"openObject "+(supportedTypes.indexOf(ext)!==-1?"supported":"unsupported")}
                                    onClick={supportedTypes.indexOf(ext)!==-1?this.nameClickHandler:""}>
                                    <OverlayTrigger onEnter={this.hideTooltip} ref="trigger" placement="top"
                                                    overlay={<Tooltip className="nameBreak">{values['name']}</Tooltip>}>
                                        <div ref="wddiv">
                                            <span ref="namespan"
                                                  className={"objectname" + ((FilesListStore.getCurrentState() == "trash" && this.state.info.type == "file") ? " locked" : "")}>{splitted['name'].length > 1 ? (
                                                splitted['name'].map(function (elem, i) {
                                                    return (
                                                        (matches['name'][i]) ? (
                                                        <span key={i}>{elem}
                                                            <span className="searched">{matches['name'][i]}</span>
                                                        </span>
                                                            ) : (<span key={i}>{elem}</span>)
                                                        )
                                                    })
                                                ) : values['name']}</span>
                                        </div>
                                    </OverlayTrigger>
                                </div>
                                    )}
                            </td>
                            <td>
                                <span>{splitted['owner'].length > 1 ? (
                                    splitted['owner'].map(function (elem, i) {
                                        return (
                                            (matches['owner'][i]) ? (
                                            <span key={i}>{elem}
                                                <span className="searched">{matches['owner'][i]}</span>
                                            </span>
                                                ) : (<span key={i}>{elem}</span>)
                                            )
                                        })
                                    ) : values['owner']}</span>
                                {(this.state.info.shared && this.state.info.owner == UserInfoStore.getUserInfo().username) ? (
                                <OverlayTrigger placement="top"
                                                overlay={<Tooltip>{"This " + this.state.info.type + " is shared"}</Tooltip>}>
                                    <img className="sharedicon" src={UserInfoStore.getConfig('path') + "images/share.png"}/>
                                </OverlayTrigger>) : ""}
                                {(this.state.info.shared && this.state.info.owner != UserInfoStore.getUserInfo().username && this.state.info.viewOnly) ? (
                                <OverlayTrigger placement="top"
                                                overlay={<Tooltip>{"This " + this.state.info.type + " is shared only for viewing"}</Tooltip>}>
                                    <img className="sharedicon"
                                         src={UserInfoStore.getConfig('path') + "images/viewableShare.png"}/>
                                </OverlayTrigger>) : ""}
                                {(this.state.info.shared && this.state.info.owner != UserInfoStore.getUserInfo().username && !this.state.info.viewOnly) ? (
                                <OverlayTrigger placement="top"
                                                overlay={<Tooltip>{"This " + this.state.info.type + " is shared for editing"}</Tooltip>}>
                                    <img className="sharedicon"
                                         src={UserInfoStore.getConfig('path') + "images/editableShare.png"}/>
                                </OverlayTrigger>) : ""}
                            </td>
                            <td>
                                <span>{MainFunctions.dateFormat(values['modified']) + (this.state.info.type == 'file' ? (" by " + this.state.info.changer) : "")}</span>
                            </td>
                            <td>
                                <span>{(this.state.info.type == 'file' ? (this.state.info.size) : "")}</span>
                            </td>
                        </tr>
                    );
                else return (<span></span>);
                break;
            case 'users':
                if (renderFlag)
                    return (
                        <tr className={this.props.multiselected + " " + this.state.info.type}
                            onMouseDown={this.handleClick}
                            id={this.state.info.id} onContextMenu={this.showMenu}>
                            <td>
                                <span>{splitted['username'].length > 1 ? (
                                    splitted['username'].map(function (elem, i) {
                                        return (
                                            (matches['username'][i]) ? (
                                            <span>{elem}
                                                <span className="searched">{matches['username'][i]}</span>
                                            </span>
                                                ) : (<span>{elem}</span>)
                                            )
                                        })
                                    ) : values['username']}</span>
                            </td>
                            <td>
                                <span>{splitted['email'].length > 1 ? (
                                    splitted['email'].map(function (elem, i) {
                                        return (
                                            (matches['email'][i]) ? (
                                            <span>{elem}
                                                <span className="searched">{matches['email'][i]}</span>
                                            </span>
                                                ) : (<span>{elem}</span>)
                                            )
                                        })
                                    ) : values['email']}</span>
                            </td>
                            <td>
                                <span>{splitted['status'].length > 1 ? (
                                    splitted['status'].map(function (elem, i) {
                                        return (
                                            (matches['status'][i]) ? (
                                            <span>{elem}
                                                <span className="searched">{matches['status'][i]}</span>
                                            </span>
                                                ) : (<span>{elem}</span>)
                                            )
                                        })
                                    ) : values['status']}</span>
                            </td>
                            <td>
                                <span>{splitted['role'].length > 1 ? (
                                    splitted['role'].map(function (elem, i) {
                                        return (
                                            (matches['role'][i]) ? (
                                            <span>{elem}
                                                <span className="searched">{matches['role'][i]}</span>
                                            </span>
                                                ) : (<span>{elem}</span>)
                                            )
                                        })
                                    ) : values['role']}</span>
                            </td>
                        </tr>
                    );
                else return (<span></span>);
                break;
            case 'templates':
                if (renderFlag)
                    return (
                        <tr className={this.props.multiselected + " " + this.state.info.type}
                            onMouseDown={this.handleClick}
                            id={this.state.info.id} onContextMenu={this.showMenu}>
                            <td>
                                {this.state.rename ? (
                                <input className="nameEdit" onBlur={this.blurRename} onKeyDown={this.renameEnd}
                                       onChange={this.renameChange} ref="name" autoFocus
                                       defaultValue={values['name']}/>
                                    ) : (
                                <OverlayTrigger onEnter={this.hideTooltip} ref="trigger" placement="top"
                                                overlay={<Tooltip>{values['name']}</Tooltip>}>
                                    <div ref="wddiv">
                                        <span ref="namespan"
                                              className={"objectname" + ((FilesListStore.getCurrentState() == "trash" && this.state.info.type == "file") ? " locked" : "")}>{splitted['name'].length > 1 ? (
                                            splitted['name'].map(function (elem, i) {
                                                return (
                                                    (matches['name'][i]) ? (
                                                    <span key={i}>{elem}
                                                        <span className="searched">{matches['name'][i]}</span>
                                                    </span>
                                                        ) : (<span key={i}>{elem}</span>)
                                                    )
                                                })
                                            ) : values['name']}</span>
                                    </div>
                                </OverlayTrigger>
                                    )}
                            </td>
                            <td>
                                <span>{splitted['description'].length > 1 ? (
                                    splitted['description'].map(function (elem, i) {
                                        return (
                                            (matches['description'][i]) ? (
                                            <span>{elem}
                                                <span className="searched">{matches['description'][i]}</span>
                                            </span>
                                                ) : (<span>{elem}</span>)
                                            )
                                        })
                                    ) : values['description']}</span>
                            </td>
                            <td>
                                <span>{splitted['author'].length > 1 ? (
                                    splitted['author'].map(function (elem, i) {
                                        return (
                                            (matches['author'][i]) ? (
                                            <span>{elem}
                                                <span className="searched">{matches['author'][i]}</span>
                                            </span>
                                                ) : (<span>{elem}</span>)
                                            )
                                        })
                                    ) : values['author']}</span>
                            </td>
                        </tr>
                    );
                else return (<span></span>);
                break;
            default:
                return (
                    <tr>
                        <td colSpan="9">No case for rendering - please check js/components/Container.js</td>
                    </tr>
                );
                break;
        }

    },

    _onChange: function () {
        this.forceUpdate();
    }
});

module.exports = Container;