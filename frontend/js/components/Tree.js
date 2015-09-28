/**
 * Created by developer123 on 15.07.15.
 */
var React = require('react');
var AlertActions = require('../actions/AlertActions');
var FilesListActions = require('../actions/FilesListActions');
var FilesListStore = require('../stores/FilesListStore');
var Storage = require('../libs/Storage');
var Requests = require('../libs/Requests');
var UserInfoStore = require('../stores/UserInfoStore');
var KudoApiUrl = UserInfoStore.getConfig('api') || "";

var ListItem = React.createClass({
    getInitialState: function () {
        return {
            folderName: this.props.folderName,
            folderId: this.props.folderId,
            unfolded: this.props.unfolded,
            folders: [],
            inside: false
        }
    },

    isInside: function () {
        var url = "", self = this;
        if (this.state.folderId == "-1")
            url = "/files";
        else
            url = "/folders/" + this.state.folderId;
        url = KudoApiUrl + url;
        var headers = JSON.parse(UserInfoStore.getConfig('defaultheaders'));
        Requests.sendRequest(url, "GET", [], headers, function (data) {
            if (data.status != 'ok')
                AlertActions.showError(data.status, "danger");
            else
                self.setState({inside: data.results.folders.length !== 0}, null);
        });
    },

    getInnerList: function () {
        var url = "", self = this;
        if (this.state.folderId == "-1")
            url = "/files";
        else
            url = "/folders/" + this.state.folderId;
        url = KudoApiUrl + url;
        var headers = JSON.parse(UserInfoStore.getConfig('defaultheaders'));
        Requests.sendRequest(url, "GET", [], headers, function (data) {
            if (data.status != 'ok')
                AlertActions.showError(data.status, "danger");
            else {
                var results = [];
                $.each(data.results.folders, function (key, value) {
                    results.push({
                        id: value._id,
                        name: value.name,
                        shared: value.shared
                    });
                });
                results.sort(function (a, b) {
                    if (a.name.toUpperCase() > b.name.toUpperCase())
                        return 1;
                    if (a.name.toUpperCase() < b.name.toUpperCase())
                        return -1;
                    return 0;
                });
                self.setState({folders: results}, null);
            }
        });
    },

    componentDidMount: function () {
        FilesListStore.addSelectListener(this._onSelect);
        if (this.state.unfolded == "true") this.getInnerList();
        this.isInside();
    },

    componentWillUnmount: function () {
        FilesListStore.removeSelectListener(this._onSelect);
    },

    toggleFolded: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var self = this;
        if (this.state.folderId!==FilesListStore.getCurrentFolder().folderId && !FilesListStore.isSelected(this.state.folderId)) FilesListActions.saveTargetFolder(this.state.folderId);
        if (this.state.unfolded == "true")
            this.setState({unfolded: "false", folders: []}, null);
        else
            this.setState({unfolded: "true"}, self.getInnerList());
    },

    render: function () {
        return (
            <li>
                <label onClick={this.toggleFolded} htmlFor={this.state.folderName} className={(FilesListStore.getCurrentFolder().folderId==this.state.folderId||FilesListStore.isSelected(this.state.folderId)?"notMove ":(FilesListStore.getSelectedMove()==this.state.folderId?"selected ":" "))+(this.state.inside?(
                (this.state.unfolded=="true"?"unfoldedMulti":"foldedMulti")
                ):(this.state.unfolded=="true"?"unfoldedSingle":"foldedSingle"))}>{this.state.folderName}</label>
                <ol>
                    {this.state.folders.map(function (elem) {
                        return (
                            <ListItem key={elem.id} folderId={elem.id} folderName={elem.name} unfolded="false"/>
                        )
                    })}
                </ol>
            </li>
        )
    },

    _onSelect: function () {
        this.forceUpdate();
    }
});

var Tree = React.createClass({
    componentDidMount: function () {
        if (FilesListStore.getCurrentFolder().folderId!=="-1") FilesListActions.saveTargetFolder("-1");
    },

    render: function () {
        return (
            <ol className="treeList">
                <ListItem folderId="-1" folderName="~" unfolded/>
            </ol>
        )
    }
});

module.exports = Tree;