/**
 * Created by developer123 on 23.02.15.
 */
var React = require('react');
var $ = require('jquery');
var _ = require('underscore');
var Table = require('react-bootstrap').Table;
var Button = require('react-bootstrap').Button;
var AlertActions = require('../actions/AlertActions');
var TemplatesActions = require('../actions/TemplatesActions');
var ContextMenuActions = require('../actions/ContextMenuActions');
var TableActions = require('../actions/TableActions');
var TemplatesStore = require('../stores/TemplatesStore');
var TableStore = require('../stores/TableStore');
var TableView = require('./TableView');
var Storage = require('../libs/Storage');
var Requests = require('../libs/Requests');
var UserInfoStore = require('../stores/UserInfoStore');
var KudoApiUrl = UserInfoStore.getConfig('api') || "";

var TemplatesList = React.createClass({

    getInitialState: function () {
        var _table = {
            fields: {
                name: {order: "desc", type: "string", rename: true, search: true},
                description: {order: "desc", type: "string", rename: true, search: true},
                author: {order: "desc", type: "string", rename: true, search: true}
            },
            orderedBy: null,
            results: []
        };
        TableActions.saveObjects(_table);
        return {
            mode: "loaded"
        };
    },

    getTemplatesList: function () {
        var self = this;
        this.setState({mode: "loading"}, function () {
            Requests.sendRequest(KudoApiUrl + '/templates', "GET", [], JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (data) {
                if (data.status != 'ok')
                    AlertActions.showError(data.responseText, "danger");
                else {
                    var templates = [];
                    _.each(data.results, function (template) {
                        template.id = template._id;
                        template.type = "template";
                        templates.push(template);
                    });
                    var _table = {
                        fields: {
                            name: {order: "desc", type: "string", rename: true, search: true},
                            description: {order: "desc", type: "string", rename: true, search: true},
                            author: {order: "desc", type: "string", rename: true, search: true}
                        },
                        orderedBy: null,
                        results: templates
                    };
                    TableActions.saveObjects(_table);
                    self.setState({mode: "loaded"}, null);
                }
            });
        });
    },

    componentWillUnmount: function () {
        TemplatesStore.removeChangeListener(this._onChange);
    },

    componentDidMount: function () {
        this.getTemplatesList();
        TemplatesStore.addChangeListener(this._onChange);
    },

    _onChange: function () {
        this.getTemplatesList();
    },

    render: function () {
        return (
            <TableView type="templates" mode={this.state.mode}/>
        )
    }
});
module.exports = TemplatesList;