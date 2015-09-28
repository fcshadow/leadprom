/**
 * Created by developer123 on 11.02.15.
 */
var React = require('react');
var $ = require('jquery');
var ValidInput = require('./ValidInput');
var ControlledForm = require('./ControlledForm');
var Alert = require('./Alert');
var Button = require('react-bootstrap').Button;
var AlertActions = require('../actions/AlertActions');
var Storage = require('../libs/Storage');
var Requests = require('../libs/Requests');
var MainFunctions = require('../libs/MainFunctions');
var UserInfoStore = require('../stores/UserInfoStore');
var UserInfoActions = require('../actions/UserInfoActions');
var KudoApiUrl = UserInfoStore.getConfig('api') || "";

var NotifyLoader = React.createClass({
    getInitialState: function () {
        return {message: "Incorrect data provided. Please check link.", style: "danger", type: "", timer: false}
    },

    componentDidMount: function () {
        this.setState({
            mode: MainFunctions.QueryString('mode'),
            key: MainFunctions.QueryString('key'),
            hash: MainFunctions.QueryString('hash')
        }, function () {
            var self = this;
            var json;
            if (this.state.mode == "confirm") {
                if (this.state.key.length && this.state.hash.length) {
                    var confirmdata = {};
                    confirmdata.userId = this.state.key;
                    confirmdata.hash = this.state.hash;
                    self.setState({message: "Wait for confirmation process to finish", style: "info"}, function () {
                        Requests.sendRequest(KudoApiUrl + "/users/confirm", "POST", JSON.stringify(confirmdata), [], function (data) {
                            if (data.status != 'ok')
                                self.setState({message: data.error, style: "danger"}, null);
                            else
                                self.setState({
                                    message: "Thanks. Please wait for Administrator's confirmation.",
                                    style: "success",
                                    timer: true,
                                    time: 5000
                                }, null);
                        });
                    });
                } else self.setState({
                    message: "Invalid query.",
                    style: "danger"
                }, null);
            } else if (this.state.mode == "activate") {
                if (this.state.key.length) {
                    var activatedata = {"enabled": true};
                    if (MainFunctions.checkStorage(UserInfoStore.getConfig('defaultheaders')))
                        self.setState({message: "Wait for confirmation process to finish", style: "info"}, function () {
                            Requests.sendRequest(KudoApiUrl + "/admin/users/" + self.state.key, "PUT", JSON.stringify(activatedata), JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (data) {
                                if (data.status != 'ok' && data.statusCode == '401')
                                    self.setState({
                                        message: "You have to be an admin. If you are not logged in - log in and try again.",
                                        style: "danger",
                                        timer: true,
                                        time: 5000
                                    }, null);
                                else
                                    self.setState({
                                        message: "Account has been successfully activated.",
                                        style: "success",
                                        timer: true,
                                        time: 5000
                                    }, null);
                            });
                        });
                    else self.setState({
                        message: "You should be logged in with admin privileges",
                        style: "danger",
                        timer: true,
                        time: 5000
                    }, null);
                }
            } else if (this.state.mode == "reset") {
                if (this.state.key.length) {
                    self.setState({
                        message: "Enter new password",
                        style: "info",
                        type: "RESET_PASSWORD"
                    }, null);
                }
            } else if (this.state.mode == "shareEditor") {
                if (this.state.key.length && MainFunctions.QueryString('userId').length) {
                    json = {share: {editor: [MainFunctions.QueryString('userId')]}};
                    self.setState({message: "Wait for confirmation process to finish", style: "info"}, function () {
                        Requests.sendRequest(KudoApiUrl + '/files/' + self.state.key, 'PUT', JSON.stringify(json), JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (answer) {
                            if (answer.status == 'ok')
                                self.setState({
                                    message: "File has been shared",
                                    style: "success",
                                    timer: true,
                                    time: 5000
                                }, null);
                            else if (answer.statusCode == 401) self.setState({
                                message: "You should be logged in",
                                style: "danger",
                                timer: true,
                                time: 5000
                            }, null);
                            else if (answer.statusCode == 403) self.setState({
                                message: "You should be logged in as correct user",
                                style: "danger",
                                timer: true,
                                time: 5000
                            }, null);
                            else
                                self.setState({
                                    message: answer.error,
                                    style: "danger"
                                }, null);
                        });
                    });
                }
            } else if (this.state.mode == "shareViewer") {
                if (this.state.key.length && MainFunctions.QueryString('userId').length) {
                    json = {share: {editor: [MainFunctions.QueryString('userId')]}};
                    self.setState({message: "Wait for confirmation process to finish", style: "info"}, function () {
                        Requests.sendRequest(KudoApiUrl + '/files/' + self.state.key, 'PUT', JSON.stringify(json), JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (answer) {
                            if (answer.status == 'ok')
                                self.setState({
                                    message: "File has been shared",
                                    style: "success",
                                    timer: true,
                                    time: 5000
                                }, null);
                            else if (answer.statusCode == 401) self.setState({
                                message: "You should be logged in",
                                style: "danger",
                                timer: true,
                                time: 5000
                            }, null);
                            else if (answer.statusCode == 403) self.setState({
                                message: "You should be logged in as correct user",
                                style: "danger",
                                timer: true,
                                time: 5000
                            }, null);
                            else
                                self.setState({
                                    message: answer.error,
                                    style: "danger"
                                }, null);
                        });
                    });
                }
            } else if (this.state.mode == "storage") {
                switch (MainFunctions.QueryString('type')) {
                    case 'box':
                        if (MainFunctions.QueryString('state')) {
                            if (MainFunctions.QueryString('state') != UserInfoStore.getUserInfo('username') + UserInfoStore.getConfig('sessionId'))
                                self.setState({
                                    message: "Incorrect security token. Please try again.",
                                    style: "danger",
                                    timer: true,
                                    time: 5000
                                }, null);
                            else if (MainFunctions.QueryString('error'))
                                self.setState({
                                    message: "Box integration error: " + MainFunctions.urldecode(MainFunctions.QueryString('error_description')) + "(" + MainFunctions.QueryString('error') + ")",
                                    style: "danger",
                                    timer: true,
                                    time: 5000
                                }, null);
                            else if (MainFunctions.QueryString('code')) {
                                self.setState({
                                    message: "Please wait while Box is completing integration",
                                    style: "info"
                                }, function () {
                                    json = {storage: {type: "BOX", authCode: MainFunctions.QueryString('code')}};
                                    Requests.sendRequest(KudoApiUrl + '/users', 'PUT', JSON.stringify(json), JSON.parse(UserInfoStore.getConfig('defaultheaders')), function (answer) {
                                        if (answer.status != 'ok')
                                            self.setState({
                                                message: "Box integration error: " + answer.error,
                                                style: "danger",
                                                timer: true,
                                                time: 5000
                                            }, null);
                                        else
                                            self.setState({
                                                message: "Box integration successfull!",
                                                style: "success",
                                                timer: true,
                                                time: 5000
                                            }, null);
                                    });
                                });
                            }
                        }
                        break;
                    default:
                        self.setState({
                            message: "Unsupported external storage type.",
                            style: "danger"
                        }, null);
                        break;
                }
            }
        });
    },

    componentDidUpdate: function () {
        var self = this;
        if (this.state.timer) setTimeout(function () {
            self.setState({time: self.state.time - 1000}, function () {
                if (self.state.time <= 1000)
                    MainFunctions.transitToPage('index');
            });
        }, 1000);
    },

    setPassword: function (value) {
        this.setState({password: value}, null);
    },

    handleSubmit: function () {
        var resetdata = {
            userId: this.state.key,
            hash: this.state.hash,
            password: this.refs.cform.getFormJSONed().password
        };
        Requests.sendRequest(KudoApiUrl + '/users/reset', 'POST', JSON.stringify(resetdata), [], function (answer) {
            if (answer.status != 'ok')
                AlertActions.showError(answer.error, "danger");
            else {
                var _config = UserInfoStore.getConfig();
                _config['defaultheaders'] = JSON.stringify([{"name": "sessionId", "value": answer.sessionId}]);
                UserInfoActions.saveConfig(_config);
                var userInfo = UserInfoStore.getUserInfo();
                userInfo['username'] = answer.username;
                userInfo['role'] = answer.roles;
                Storage.store('sessionId', answer.sessionId);
            }
        })
    },

    render: function () {
        return (
            <div className="notify">
                <Alert />

                <div className="block_success">
                    <h2 className={this.state.style}>{this.state.message}</h2>
                    {this.state.timer ? (
                        <h2>You will be redirected to ARES Kudo in {this.state.time / 1000} seconds</h2>) : ""}
                    {this.state.type == "RESET_PASSWORD" ? (
                        <div className="login">
                            <ControlledForm ref="cform">
                                <div className="inputHint">New password</div>
                                <ValidInput type="password" checkType="Password"
                                            name="password"/>
                                <Button type="submit" bsStyle="primary" onClick={this.handleSubmit}>Change password and
                                    login
                                </Button>
                            </ControlledForm>
                        </div>
                    ) : ""}
                </div>
            </div>
        )
    }
});

module.exports = NotifyLoader;