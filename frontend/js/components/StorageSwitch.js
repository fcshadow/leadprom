/**
 * Created by root on 06.08.15.
 */
var React = require('react');
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var ButtonGroup = require('react-bootstrap').ButtonGroup;
var Button = require('react-bootstrap').Button;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Tooltip = require('react-bootstrap').Tooltip;
var AlertActions = require('../actions/AlertActions');
var FilesListActions = require('../actions/FilesListActions');
var FilesListStore = require('../stores/FilesListStore');
var Storage = require('../libs/Storage');
var Requests = require('../libs/Requests');
var UserInfoStore = require('../stores/UserInfoStore');
var KudoApiUrl = UserInfoStore.getConfig('api') || "";

var StorageSwitch = React.createClass({

    getInitialState: function () {
        return {
            storageType: "",
            includedStorages: [
                "box",
                "fluorine"
            ]
        }
    },

    componentDidMount: function () {
        var self = this;
        Requests.sendRequest(KudoApiUrl + '/users', 'GET', null, JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (answer) {
            if (answer.status != 'ok') AlertActions.showError(answer.error, "danger");
            else {
                var storageType = answer.results[0].storageType || "fluorine";
                self.setState({storageType: storageType.toLowerCase()}, null);
            }
        });
    },

    integrateStorage: function (storageType) {
        var self = this, json = {};
        switch (storageType) {
            case 'box':
                json = {storage: {type: "BOX"}};
                Requests.sendRequest(KudoApiUrl + '/users', 'PUT', JSON.stringify(json), JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (answer) {
                    if (answer.status != 'ok') {
                        //TODO: replace with GET /integration call
                        if (answer.statusCode == 400) {
                            Requests.sendRequest(KudoApiUrl + '/integration', 'GET', null, JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (answer) {
                                location.href = 'http://app.box.com/api/oauth2/authorize?response_type=code&client_id=' + answer.box + '&state=' + UserInfoStore.getUserInfo('username') + Storage.store('sessionId');
                            });
                        }
                        else
                            AlertActions.showError(answer.error, "danger");
                    }
                    else {
                        self.setState({storageType: "box"}, null);
                        FilesListActions.reloadList();
                    }
                });
                break;
            case 'fluorine':
                json = {storage: {type: "FLUORINE"}};
                Requests.sendRequest(KudoApiUrl + '/users', 'PUT', JSON.stringify(json), JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (answer) {
                    if (answer.status != 'ok') AlertActions.showError(answer.error, "danger");
                    else {
                        self.setState({storageType: "fluorine"}, null);
                        FilesListActions.reloadList();
                    }
                });
                break;
            default:
                console.warn("Storage isn't integrated.");
                break;
        }
    },

    render: function () {
        var self = this;
        return (
            <ButtonToolbar>
                <ButtonGroup>
                    {this.state.includedStorages.map(function (elem, i) {
                        var name=elem.charAt(0).toUpperCase() + elem.slice(1);
                        if (name=="Fluorine") name="ARES Kudo";
                        return (
                            <OverlayTrigger key={i} placement="top"
                                            overlay={<Tooltip>Switch to {name} storage</Tooltip>}>
                                <Button
                                    className={(elem.toLowerCase()==self.state.storageType.toLowerCase()?"selectedStorage":"")+" imginner"+(self.props.big?" extended":"")}
                                    onClick={self.integrateStorage.bind(null, elem)}>
                                    <img
                                        src={UserInfoStore.getConfig('path')+"images/storages/"+elem.toLowerCase()+"-active.png"}/>
                                </Button>
                            </OverlayTrigger>
                        )
                    })}
                </ButtonGroup>
            </ButtonToolbar>
        )
    }
});
module.exports = StorageSwitch;