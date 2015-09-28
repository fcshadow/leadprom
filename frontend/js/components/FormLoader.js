/**
 * Created by developer123 on 11.02.15.
 */
var React = require('react');
var $ = require('jquery');
var LoginForm = require('./LoginForm');
var SignUpForm = require('./SignUpForm');
var Header = require('./Header');
var FormLoaderStore = require('../stores/FormLoaderStore');
var AlertActions = require('../actions/AlertActions');
var Storage = require('../libs/Storage');
var Requests = require('../libs/Requests');
var UserInfoStore = require('../stores/UserInfoStore');

var FormLoader = React.createClass({
    getInitialState: function () {
        return {
            currentForm: <LoginForm />,
            revision: UserInfoStore.getConfig('revision') || ""
        };
    },

    componentDidMount: function () {
        FormLoaderStore.addChangeListener(this._onChange);
        UserInfoStore.addChangeListener(this._onConfig);
    },

    componentWillUnmount: function () {
        FormLoaderStore.removeChangeListener(this._onChange);
        UserInfoStore.removeChangeListener(this._onConfig);
    },

    render: function () {
        return (
            <div className="page">
                <Header type="minified"/>
                {this.state.currentForm}
                <footer>
                    <span className="revision">Actual revision:
                        <strong> {this.state.revision}</strong>
                    </span>
                    <br />
                    Xenon is not released and is confidential. Unless you have been invited by an approved Xenon user to
                    access this pre-released version and signed a non-disclosure agreement with Graebert, you should not
                    proceed further. If you are an approved user, you should not show Xenon to anyone who has not met
                    these requirements. By signing in, you also certify that you are not a competitor, will not use this
                    for competitive purposes, and will not provide screenshots, descriptions or demonstrations to
                    anyone.
                </footer>
            </div>
        );
    },

    _onConfig: function () {
        this.setState({
            revision: UserInfoStore.getConfig('revision') || ""
        },null);
    },

    _onChange: function () {
        this.setState({
            currentForm: FormLoaderStore.getCurrentType()
        }, null);
    }

});

module.exports = FormLoader;