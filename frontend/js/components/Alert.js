/**
 * Created by developer123 on 13.02.15.
 */
var React = require('react');
var Alert = require('react-bootstrap').Alert;
var AlertStore = require('../stores/AlertStore');
var ModalStore = require('../stores/ModalStore');

function getAlertState() {
    var currentInfo = AlertStore.getCurrentInfo();
    if (typeof currentInfo.message == "string") currentInfo.message = currentInfo.message.split('\n');
    return {
        currentInfo: currentInfo
    };
}

var AlertAutoDismissable = React.createClass({
    getInitialState: function () {
        return getAlertState();
    },

    componentDidMount: function () {
        AlertStore.addChangeListener(this._onChange);
        ModalStore.addChangeListener(this._onModal);
    },

    componentWillUnmount: function () {
        AlertStore.removeChangeListener(this._onChange);
        ModalStore.removeChangeListener(this._onModal);
    },

    render: function () {
        if (this.state.currentInfo.alertVisible) {
            return (
                <Alert bsStyle={this.state.currentInfo.type} onDismiss={this.handleAlertDismiss} dismissAfter={5000}>
                    {this.state.currentInfo.message.map(function (elem, i) {
                        return (<p key={i}>{elem}</p>)
                    })}
                </Alert>
            );
        }

        return (
            <span></span>
        );
    },

    _onModal: function () {
        this.handleAlertDismiss();
    },

    _onChange: function () {
        if (this.isMounted()) this.setState(getAlertState(), null);
        //this.handleAlertShow();
    },

    handleAlertDismiss: function () {
        var currentinfo = this.state.currentInfo;
        currentinfo.alertVisible = false;
        this.setState({currentInfo: currentinfo}, null);
    },

    handleAlertShow: function () {
        var currentinfo = this.state.currentInfo;
        currentinfo.alertVisible = true;
        this.setState({currentInfo: currentinfo}, null);
    }
});

module.exports = AlertAutoDismissable;
