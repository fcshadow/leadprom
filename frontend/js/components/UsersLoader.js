/**
 * Created by developer123 on 20.02.15.
 */
var React = require('react');
var Header = require('./Header');
var UsersList = require('./UsersList');
var ContextMenu = require('./ContextMenu');
var SearchField = require('./SearchField');
var ContextMenuActions = require('../actions/ContextMenuActions');
var AlertActions = require('../actions/AlertActions');
var $ = require('jquery');
var Storage = require('../libs/Storage');
var Requests = require('../libs/Requests');
var UserInfoStore = require('../stores/UserInfoStore');
var KudoApiUrl = UserInfoStore.getConfig('api') || "";

var UsersLoader = React.createClass({
    render: function () {
        return (
            <div className="page">
                <Header type="full"/>
                <ContextMenu />
                <div className="controlpanel">
                    <SearchField type="users"/>
                </div>
                <UsersList />
            </div>
        );
    }
});
module.exports = UsersLoader;