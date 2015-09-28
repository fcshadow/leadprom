/**
 * Created by developer123 on 11.02.15.
 */
var React = require('react');
var Button = require('react-bootstrap').Button;
var ControlledForm = require('./ControlledForm');
var ValidInput = require('./ValidInput');
var Alert = require('./Alert');
var AlertActions = require('../actions/AlertActions');
var ModalActions = require('../actions/ModalActions');
var FormLoaderActions = require('../actions/FormLoaderActions');
var $ = require('jquery');
var Storage = require('../libs/Storage');
var Requests = require('../libs/Requests');
var UserInfoStore = require('../stores/UserInfoStore');
var UserInfoActions = require('../actions/UserInfoActions');
var KudoApiUrl = UserInfoStore.getConfig('api') || "";
var md5 = require('md5');


var LoginForm = React.createClass({
    getInitialState: function () {
        return {
            mode: "loaded"
        }
    },

    forgotPassword: function () {
        ModalActions.forgotPassword();
    },

    render: function () {
        if (this.state.mode == "loading") return (
            <div className="login" style={{textAlign:"center"}}>
                <img src={UserInfoStore.getConfig('path')+'images/Loader.gif'}/>
            </div>
        );
        else
            return (
                <div className="login">
                    <div className="loginCaptionContainer">
                        <span className="loginCaption">Sign in to <span className="yellowed">ARES Kudo</span></span>
                    </div>
                    <ControlledForm ref="cForm" overSubmit={false}>
                        <ValidInput name="username" type="text" checkType="Login" required={true}
                                    placeholder="ARES Kudo ID"/>
                        <ValidInput name="password" type="password" checkType="Password" required={true}
                                    placeholder="Password"/>
                        <Button type="submit" bsStyle="primary" onClick={this.handleSubmit}>Sign in</Button>
                    </ControlledForm>

                    <div className="login-help">
                        <div className="row">
                            <a onClick={this.forgotPassword}>Forgot your ID or Password?</a>
                        </div>
                        <div className="row">
                            <span className="question"> Don't have an ARES Kudo ID? </span>
                            <a onClick={this.changeFormType}>Create one now.</a>
                        </div>
                    </div>
                </div>
            );
    },

    changeFormType: function () {
        FormLoaderActions.showSignUp();
    },

    handleSubmit: function (event) {
        event.preventDefault();
        var json = this.refs.cForm.getFormJSONed();
        this.setState({mode: "loading"});
        Requests.sendRequest(KudoApiUrl + '/auth', "GET", null, [], function (answer) {
            var regExp = /\"([a-zA-Z0-9./]+)\"/g, str = answer.digestHeader;
            var m, parsed = [];
            do {
                m = regExp.exec(str);
                if (m) parsed.push(m[1]);
            } while (m);
            var genresponse = [];
            genresponse.push(md5(json.username + ':' + parsed[0] + ':' + json.password));
            genresponse.push(md5("POST:files.html"));
            genresponse.push(md5(genresponse[0] + ":" + parsed[1] + ":" + genresponse[1]));
            var headers = 'Digest username="' + json.username + '",' +
                'realm="' + parsed[0] + '",' +
                'nonce="' + parsed[1] + '",' +
                'uri="files.html",' +
                'response="' + genresponse[2] + '",' +
                'opaque="' + parsed[2] + '"';
            headers = [{name: "Authorization", value: headers}];
            Requests.sendRequest(KudoApiUrl + '/authentication', "POST", null, headers, function (answer) {
                if (answer.status != 'ok')
                    if (answer.statusCode == 403)
                        AlertActions.showError("Please wait for account confirmation", "warning");
                    else if (answer.statusCode == 401)
                        AlertActions.showError("Login/password is wrong", "danger");
                    else
                        AlertActions.showError(answer.error, "danger");
                else {
                    var _config = UserInfoStore.getConfig();
                    _config['defaultheaders'] = JSON.stringify([{"name": "sessionId", "value": answer.sessionId}]);
                    UserInfoActions.saveConfig(_config);
                    Storage.store('sessionId', answer.sessionId);
                }
            });
        });
        /*Requests.sendRequest(KudoApiUrl + '/login', "POST", JSON.stringify(json), [], function (answer) {
         if (answer.status != 'ok')
         AlertActions.showError(answer.error, "danger");
         else {
         UserInfoStore.getConfig('defaultheaders'), JSON.stringify([{"name": "sessionId", "value": answer.sessionId}]));
         UserInfoStore.getConfig('username'), answer.username);
         UserInfoStore.getConfig('role'), answer.roles);
         UserInfoStore.getConfig('session')Id', answer.sessionId);
         }
         });*/
    }
});

module.exports = LoginForm;