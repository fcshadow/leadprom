/**
 * Created by khizh on 9/4/2015.
 */
"use strict";
var React = require('react');
var $ = require('jquery');
var ProgressBar = require('react-bootstrap').ProgressBar;
var Table = require('react-bootstrap').Table;
var FilesListStore = require('../stores/FilesListStore');
var AlertStore = require('../stores/AlertStore');
var ContextMenuStore = require('../stores/ContextMenuStore');
var TableStore = require('../stores/TableStore');
var AlertActions = require('../actions/AlertActions');
var ContextMenuActions = require('../actions/ContextMenuActions');
var TableActions = require('../actions/TableActions');
var FilesListActions = require('../actions/FilesListActions');
var Container = require('./Container');
var Storage = require('../libs/Storage');
var Requests = require('../libs/Requests');
var UserInfoStore = require('../stores/UserInfoStore');
var KudoApiUrl = UserInfoStore.getConfig('api') || "";

var TableView = React.createClass({
    getInitialState: function () {
        return ({
            mode: this.props.mode
        });
    },

    componentDidMount: function () {
        var self = this;
        $(document).ready(function () {
            $(document).click(function (e) {
                var flag = $(e.target).parents('tr').length || $(e.target).parent().is('tr') || $(e.target).is('span') || $(e.target).hasClass('btn') || $(e.target).is('a') || $(e.target).parents('.modal').length || $(e.target).parents('.contextmenu').length || $(e.target).parents('.btn').length || $(e.target).parents('.btn-group').length;
                if (!flag && TableStore.getMultiSelected().length) TableActions.removeSelection();
            });

            $(document).keydown(function (e) {
                if (e.keyCode == 27) {
                    if (AlertStore.getCurrentInfo().alertVisible) AlertActions.hideError();
                    if (ContextMenuStore.getCurrentInfo().visible) ContextMenuActions.hideMenu();
                    if (TableStore.getMultiSelected().length) TableActions.removeSelection();
                } else if (e.ctrlKey && e.keyCode == 65 && ($('input:focus').length == 0))
                    TableActions.selectAll();
            });
        });
        $(window).load(function () {
            var table = $('table'),
                tbody = $('tbody'),
                body = $(window),
                offset = table.offset(),
                height = body.height();
            if (typeof table != "undefined" && typeof offset != "undefined") {
                table.css('height', height - offset.top + 'px');
                tbody.css('height', height - offset.top - 30 + 'px');
            }
            self.forceUpdate();
            $(window).resize(function () {
                offset = table.offset();
                height = body.height();
                table.css('height', height - offset.top + 'px');
                tbody.css('height', height - offset.top - 30 + 'px');
                self.forceUpdate();
            });
        });
        TableStore.addChangeListener(this._onChange);
    },

    componentDidUpdate: function () {
        var table = $('table'),
            tbody = $('tbody'),
            body = $(window),
            offset = table.offset(),
            height = body.height();
        if (typeof table != "undefined" && typeof offset != "undefined") {
            table.css('height', height - offset.top + 'px');
            tbody.css('height', height - offset.top - 30 + 'px');
        }
        $(window).resize(function () {
            offset = table.offset();
            height = body.height();
            table.css('height', height - offset.top + 'px');
            tbody.css('height', height - offset.top - 30 + 'px');
        });
        var tableInfo=TableStore.getTable();
        if (!tableInfo.orderedBy && tableInfo.fields.hasOwnProperty('name')) TableActions.sortList('name');
    },

    componentWillUnmount: function () {
        TableStore.removeChangeListener(this._onChange);
    },

    sortByColumn: function (type) {
        TableActions.sortList(type);
    },

    componentWillReceiveProps: function (nextProps) {
        this.setState({
            mode: nextProps.mode
        });
    },

    render: function () {
        var self = this, headers = [], i = 0, table = TableStore.getTable();
        if (typeof table != "undefined") {
            for (var elem in table.fields) {
                if (table.fields.hasOwnProperty(elem)) {
                    headers.push(
                        <th key={i++} onClick={self.sortByColumn.bind(this, elem)}>{elem} {table.orderedBy == elem ?
                            <img
                                src={UserInfoStore.getConfig('path') + 'images/sort-' + table.fields[elem].order + '.png'}/> : ""}</th>
                    );
                }
            }
            var res;
            return (
                <div className="fileListOverlay">
                    <Table className={"filelist blockable"+" sized"+headers.length} striped hover condensed>
                        <thead>
                        <tr>
                            {headers}
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.mode == "loaded" ? (
                            table.results.length ? (table.results.map(function (element) {
                                if (typeof TableStore.getMultiSelected == "function") res = $.grep(TableStore.getMultiSelected(), function (e) {
                                    return e.id == element.id;
                                }); else res = [];
                                return (
                                    <Container type={self.props.type} key={element.id} element={element}
                                               multiselected={(res.length) ? "selected" : "casual"}/>
                                )
                            })) : (<tr>
                                <td colSpan="4">No files in current folder</td>
                            </tr>)
                        ) : ""}
                        </tbody>
                    </Table>
                    {this.state.mode == "loading" ? (
                        <div className="loadbar">
                            <img src={UserInfoStore.getConfig('path') + 'images/Loader.gif'}/>
                        </div>
                    ) : ""}
                </div>
            );
        }
        else
            return (
                <span></span>
            )
    },

    _onChange: function () {
        this.forceUpdate();
    }
});

module.exports = TableView;