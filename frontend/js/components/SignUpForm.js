/**
 * Created by developer123 on 11.02.15.
 */
var React = require('react');
var Button = require('react-bootstrap').Button;
var Navbar = require('react-bootstrap').Navbar;
var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;
var ValidInput = require('./ValidInput');
var Alert = require('./Alert');
var ControlledForm = require('./ControlledForm');
var FormLoaderActions = require('../actions/FormLoaderActions');
var AlertActions = require('../actions/AlertActions');
var $ = require('jquery');
var Storage = require('../libs/Storage');
var Requests = require('../libs/Requests');
var UserInfoStore = require('../stores/UserInfoStore');
var KudoApiUrl = UserInfoStore.getConfig('api') || "";

var SignUpForm = React.createClass({
    getInitialState: function () {
        return {};
    },

    render: function () {
        return (
            <div className="login">
                <div className="loginCaptionContainer">
                    <span className="loginCaption">Sign up to <span className="yellowed">ARES Kudo</span></span>
                </div>
                <ControlledForm ref="cform">
                    <ValidInput name="email" type="email" checkType="isEmail" required={true}/>
                    <ValidInput name="login" type="text" checkType="Login" required={true}/>
                    <ValidInput name="password" type="password" checkType="Password" required={true} checkStrength/>
                    <ValidInput name="passconfirm" type="password" checkType="RePass" required={true}/>
                    <Button bsStyle="primary" onClick={this.handleSubmit}>Register</Button>
                </ControlledForm>
                <div className="login-help">
                    <a onClick={this.changeFormType}>Login</a>
                </div>
            </div>
        );
    },

    changeFormType: function () {
        FormLoaderActions.showLogin();
    },

    handleSubmit: function (event) {
        event.preventDefault();
        var json = this.refs.cform.getFormJSONed();
        Requests.sendRequest(KudoApiUrl + '/users', "POST", JSON.stringify(json), [], function (answer) {
            if (answer.status != 'ok')
                AlertActions.showError(answer.error, "danger");
            else {
                AlertActions.showError("Thanks. Please see the email and do the next registration step.", "info");
                FormLoaderActions.showLogin();
            }
        });
    }
});

module.exports = SignUpForm;