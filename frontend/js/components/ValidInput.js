/**
 * Created by developer123 on 11.02.15.
 */
var React = require('react');
var _ = require('underscore');
var StrengthChecker = require('./StrengthChecker');
var MainFunctions = require('../libs/MainFunctions');

var validationRules = {
    'isValue': function (value) {
        return value !== '';
    },
    'isEmail': function (value) {
        return value.match(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i);
    },
    'isTrue': function (value) {
        return value === true;
    },
    'isNumeric': function (value) {
        return value.match(/^-?[0-9]+$/);
    },
    'isAlpha': function (value) {
        return value.match(/^[a-zA-Z]+$/);
    },
    'isLogin': function (value) {
        return value.match(/^[a-zA-Z0-9]{6,50}$/);
    },
    'Login': function (value) {
        return value.match(/^[a-zA-Z0-9@.]+$/);
    },
    'Password': function (value) {
        return value.match(/^[a-zA-Z0-9.,:! ]+$/);
    },
    isLength: function (value, min, max) {
        if (max !== undefined) {
            return value.length >= min && value.length <= max;
        }
        return value.length >= min;
    },
    equals: function (value, eq) {
        return value == eq;
    }
};

var ValidInput = React.createClass({
    getInitialState: function () {
        var value = this.props.defValue || "";
        return {
            value: value,
            valid: this.props.defaultInvalidity ? false : (value.length ? (validationRules.hasOwnProperty(this.props.checkType) ? validationRules[this.props.checkType](value) : "") : "")
        }
    },

    clearInput: function () {
        var value = this.props.defValue || "";
        this.setState({
            value: value,
            valid: this.props.defaultInvalidity ? false : (value.length ? (validationRules.hasOwnProperty(this.props.checkType) ? validationRules[this.props.checkType](value) : "") : "")
        }, function () {
            if (this.props.checkStrength) this.refs.SCheck.ReCalculateAndReturn(value)
        });
    },

    componentWillReceiveProps: function (newProps) {
        if (this.props.defValue != newProps.defValue) {
            var value = newProps.defValue || "";
            this.setState({
                value: value,
                valid: newProps.defaultInvalidity ? false : (value.length ? (validationRules.hasOwnProperty(newProps.checkType) ? validationRules[newProps.checkType](value) : "") : "")
            }, null);
        }
    },

    render: function () {
        var classed = "";
        if (this.props.required) classed += "required ";
        if (this.state.value && (MainFunctions.ableToString(this.state.valid) && this.state.valid.toString().length)) {
            if (this.state.valid == true) classed += "success";
            else if (this.state.valid == false) classed += "error";
        }
        if (this.props.checkStrength) return (
            <div className="withSrength">
                <input ref={this.props.ref} type={this.props.type}
                       className={classed}
                       value={this.state.value} onChange={this.handleChange} name={this.props.name}
                       placeholder={this.props.placeholder || this.props.name} defaultValue={this.props.defValue}
                       autoComplete={this.props.autocomplete} autoFocus={this.props.autofocus}
                       maxLength={this.props.maxLength}/>
                <StrengthChecker ref="SCheck"/>
            </div>
        );
        else
            return (
                <input ref={this.props.ref} type={this.props.type}
                       className={classed}
                       value={this.state.value} onChange={this.handleChange} name={this.props.name}
                       placeholder={this.props.placeholder || this.props.name} defaultValue={this.props.defValue}
                       autoComplete={this.props.autocomplete} autoFocus={this.props.autofocus}
                       maxLength={this.props.maxLength}/>
            )
    },

    handleChange: function (event) {
        var value = event.target.value;
        var valid = value.length ? false : "";
        if (this.props.checkType == 'RePass') {
            if (typeof this.props.retype == "function")
                valid = this.props.retype("password", value);
        }
        else if (this.props.checkType == 'ReNewPass') {
            if (typeof this.props.retype == "function")
                valid = this.props.retype("newPass", value);
        }
        else if (this.props.checkType == "notList") {
            if (typeof this.props.list == "object") {
                _.each(this.props.list, function (elem) {
                    if (elem.username == value || elem.email == value) valid = true;
                })
            }
        }
        else if (this.props.checkType == 'noCheck') {
            valid = "";
        }
        else valid = value.length ? (validationRules[this.props.checkType](value) ? true : false) : "";
        if (this.props.checkStrength) valid = ((valid == true || valid == "") ? this.refs.SCheck.ReCalculateAndReturn(value) : valid);
        this.setState({value: value, valid: valid}, function () {
            if (typeof this.props.change == "function")
                this.props.change(this.props.name, this.state.value, this.state.valid);
            if (typeof this.props.changeFormed == "function")
                this.props.changeFormed(this.props.name, this.state.value, this.state.valid);
        });
    }
});

module.exports = ValidInput;