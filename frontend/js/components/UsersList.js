/**
 * Created by developer123 on 20.02.15.
 */
var React = require('react');
var $ = require('jquery');
var _ = require('underscore');
var TableView = require('./TableView');
var Table = require('react-bootstrap').Table;
var Button = require('react-bootstrap').Button;
var AlertActions = require('../actions/AlertActions');
var ContextMenuActions = require('../actions/ContextMenuActions');
var TableActions = require('../actions/TableActions');
var UsersStore = require('../stores/UsersStore');
var TableStore = require('../stores/TableStore');
var Storage = require('../libs/Storage');
var Requests = require('../libs/Requests');
var UserInfoStore = require('../stores/UserInfoStore');
var KudoApiUrl = UserInfoStore.getConfig('api') || "";

var UsersList = React.createClass({

    getInitialState: function () {
        var _table = {
            fields: {
                username: {order: "desc", type: "string", rename: false, search: true},
                email: {order: "desc", type: "string", rename: false, search: true},
                status: {order: "desc", type: "string", rename: false, search: true},
                role: {order: "desc", type: "string", rename: false, search: true}
            },
            orderedBy: null,
            results: []
        };
        TableActions.saveObjects(_table);
        return {
            mode: "loaded"
        };
    },

    reloadList: function () {
        var self = this;
        this.setState({mode: "loading"}, function () {
            Requests.sendRequest(KudoApiUrl + '/admin/users', "GET", [], JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (data) {
                if (data.status != 'ok')
                    AlertActions.showError(data.error, "danger");
                else {
                    var users = [];
                    _.each(data.results, function (user) {
                        user.id = user._id;
                        user.status = user.enabled ? "enabled" : "disabled";
                        user.role = user.isAdmin ? "Admin" : "User";
                        user.type = "user";
                        users.push(user);
                    });
                    var _table = {
                        fields: {
                            username: {order: "desc", type: "string", rename: false, search: true},
                            email: {order: "desc", type: "string", rename: false, search: true},
                            status: {order: "desc", type: "string", rename: false, search: true},
                            role: {order: "desc", type: "string", rename: false, search: true}
                        },
                        orderedBy: null,
                        results: users
                    };
                    TableActions.saveObjects(_table);
                    self.setState({mode: "loaded"}, null);
                }
            });
        });
    },

    componentDidMount: function () {
        this.reloadList();
        UsersStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {
        UsersStore.removeChangeListener(this._onChange);
    },

    render: function () {
        return (
            <TableView type="users" mode={this.state.mode}/>
        )
    },

    _onChange: function () {
        this.reloadList();
    }
});
module.exports = UsersList;