/**
 * Created by developer123 on 17.02.15.
 */
var React = require('react');
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var ButtonGroup = require('react-bootstrap').ButtonGroup;
var Button = require('react-bootstrap').Button;
var AlertActions = require('../actions/AlertActions');
var FilesListActions = require('../actions/FilesListActions');
var FilesListStore = require('../stores/FilesListStore');
var MainFunctions = require('../libs/MainFunctions');

var FolderButton = React.createClass({
    switchFolder: function () {
        FilesListActions.changeFolder(this.props.name, this.props.id);
    },

    render: function () {
        if (this.props.disabled)
            return (
                <li>
                    <span className="current">{MainFunctions.shrinkString(this.props.name)}</span>
                </li>
            );
        else
            return (
                <li onClick={this.switchFolder}>
                    <span className="active">{MainFunctions.shrinkString(this.props.name)}</span>
                </li>
            )
    }
});
module.exports = FolderButton;