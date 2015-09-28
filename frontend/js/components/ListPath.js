/**
 * Created by developer123 on 17.02.15.
 */
var React = require('react');
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var ButtonGroup = require('react-bootstrap').ButtonGroup;
var Button = require('react-bootstrap').Button;
var ModalActions = require('../actions/ModalActions');
var AlertActions = require('../actions/AlertActions');
var FilesListActions = require('../actions/FilesListActions');
var FilesListStore = require('../stores/FilesListStore');
var FolderButton = require('./FolderButton');

function getPath() {
    return FilesListStore.getCurrentState() == "trash" ? FilesListStore.getTrashFolderPath() : FilesListStore.getFolderPath();
}

var ListPath = React.createClass({
    getInitialState: function () {
        return {
            folderpath: getPath()
        };
    },

    componentDidMount: function () {
        FilesListStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {
        FilesListStore.removeChangeListener(this._onChange);
    },

    render: function () {
        var length = this.state.folderpath.length, last = this.state.folderpath[length - 1].folderId;
        return (
            <ul className="breadcrumbs">
                {this.state.folderpath.map(function (element, i) {
                    if (element.folderId != last)
                        return (
                        <FolderButton key={i} id={element.folderId} name={element.folderName}></FolderButton>
                            );
                        else
                        return (
                        <FolderButton key={i} id={element.folderId} name={element.folderName} disabled></FolderButton>
                            );
                    })}
            </ul>
        )
    },

    _onChange: function () {
        this.setState({
            folderpath: getPath()
        }, null);
    }

});

module.exports = ListPath;