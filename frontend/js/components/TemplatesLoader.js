/**
 * Created by developer123 on 23.02.15.
 */
var React = require('react');
var Header = require('./Header');
var TemplatesList = require('./TemplatesList');
var ControlPanel = require('./ControlPanel');
var ContextMenu = require('./ContextMenu');
var ContextMenuActions = require('../actions/ContextMenuActions');
var AlertActions = require('../actions/AlertActions');
var TemplatesActions = require('../actions/TemplatesActions');
var TableActions = require('../actions/TableActions');
var ContextMenuStore = require('../stores/ContextMenuStore');
var TemplatesStore = require('../stores/TemplatesStore');
var $ = require('jquery');

$(document).mousedown(function (e) {
    if (!$(e.target).hasClass('contextitem') && !$(e.target).parents('.contextmenu').length && !$(e.target).parents('.modal').length) {
        if (ContextMenuStore.getCurrentInfo().visible)
            ContextMenuActions.hideMenu();
    }
});

var TemplatesLoader = React.createClass({

    componentDidMount: function () {
        var table = $('table'),
            body = $('body'),
            tbody = $('tbody'),
            offset = table.offset(),
            height = body.height();
        table.css('height', height - offset.top - 2 + 'px');
        tbody.css('height', height - offset.top - 32 + 'px');
        $(window).resize(function () {
            offset = table.offset();
            height = body.height();
            table.css('height', height - offset.top - 2 + 'px');
            tbody.css('height', height - offset.top - 32 + 'px');
        });
    },

    render: function () {
        return (
            <div className="page">
                <ContextMenu />
                <Header type="full"/>
                <ControlPanel type="templates"/>
                <TemplatesList />
            </div>
        );
    }
});
module.exports = TemplatesLoader;