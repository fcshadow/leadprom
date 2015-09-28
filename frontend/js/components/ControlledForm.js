/**
 * Created by developer123 on 10.08.15.
 */
var React = require('react/addons');
var Button = require('react-bootstrap').Button;
var Input = require('react-bootstrap').Input;
var ValidInput = require('./ValidInput');
var _ = require('underscore');

var ControlledForm = React.createClass({
    getInitialState: function () {
        return {
            allValid: false,
            formJSON: {},
            submitFunction: null
        }
    },

    componentDidMount: function () {
        var fj = this.state.formJSON, submitFunction = null, cnt = 0, children = this.props.children;
        if (!Array.isArray(this.props.children)) {
            children = [];
            children.push(this.props.children);
        }
        children.map(function (child) {
            if (child.type == ValidInput) {
                fj[child.props.name] = {
                    value: child.props.defValue || "",
                    valid: true,
                    required: child.props.required || false
                };
                cnt++;
            }
            else if (child.type == Input)
                fj[child.props.name] = {value: child.props.value || "", valid: true, required: true};
            else if (child.type == Button && child.props.type == "submit") submitFunction = child.props.onClick;
        });
        this.setState({formJSON: fj, submitFunction: submitFunction}, null);
    },


    generateJSON: function (id, name, value, validity) {
        var fj = this.state.formJSON, validFlag = true;
        fj[name].value = value || "";
        fj[name].valid = validity;
        _.each(fj, function (elem) {
            if (elem.valid === false || (elem.required && !elem.value.length)) validFlag = false;
        });
        this.setState({formJSON: fj, allValid: validFlag}, function () {
            if (typeof this.props.buttonEnabled == "function") this.props.buttonEnabled(validFlag);
        });
    },

    getFormJSONed: function () {
        var formObject = {};
        for (var prop in this.state.formJSON)
            if (this.state.formJSON.hasOwnProperty(prop))
                if (typeof this.state.formJSON[prop].value !== 'undefined' && this.state.formJSON[prop].value.trim() != "")
                    formObject[prop] = this.state.formJSON[prop].value;
        return formObject;
    },

    getFormValidity: function () {
        return this.state.allValid;
    },

    selectChange: function (event) {
        var fj = this.state.formJSON, validFlag = true;
        fj[event.target.name].value = event.target.value || "";
        _.each(fj, function (elem) {
            if (elem.valid === false || (elem.required && !elem.value.length)) validFlag = false;
        });
        this.setState({formJSON: fj, allValid: validFlag}, function () {
            if (typeof this.props.buttonEnabled == "function") this.props.buttonEnabled(validFlag);
        });
    },

    retype: function (field, value) {
        return (this.refs[field].state.value == value);
    },

    submitForm: function (submitFunction, e) {
        if (typeof submitFunction == "function") submitFunction(e);
        else if (typeof this.state.submitFunction == "function") this.state.submitFunction(e);
        if (!(this.props.overSubmit == false)) {
            _.each(this.refs, function (child) {
                if (typeof child.clearInput == "function")
                    child.clearInput();
            });
            var fj = this.state.formJSON;
            this.props.children.map(function (child) {
                if (child.type == ValidInput) {
                    fj[child.props.name] = {
                        value: child.props.defValue || "",
                        valid: true,
                        required: child.props.required || false
                    };
                }
                else if (child.type == Input)
                    fj[child.props.name] = {value: child.props.value || "", valid: true, required: true};
                else if (child.type == Button && child.props.type == "submit") submitFunction = child.props.onClick;
            });
            this.setState({formJSON: fj, allValid: false}, null);
        }
    },

    render: function () {
        var genFunction = this.generateJSON, retypeFunction = this.retype, validity = this.state.allValid, selectChange = this.selectChange, values = this.state.formJSON,
            submitFunction = this.submitForm;
        return (
            <form onSubmit={submitFunction} className={this.getFormValidity()?"validForm":"invalidForm"}>
                {!Array.isArray(this.props.children)?(
                    this.props.children
                    ):this.props.children.map(function (child,i) {
                    if (child.type==ValidInput)
                        return React.cloneElement(child, {
                            changeFormed: genFunction.bind(null,i),
                            key:i,
                            ref:child.props.name,
                            retype:retypeFunction
                            });
                        else if (child.type==Button)
                        return React.cloneElement(child, {
                            disabled: !validity,
                            onClick: submitFunction.bind(null,child.props.onClick),
                            key:i
                            });
                        else if (child.type==Input)
                        return React.cloneElement(child,{
                            onChange:selectChange,
                            value:values[child.name],
                            key:i
                            });
                        else return child
                    })}
            </form>
        )
    }
});
module.exports = ControlledForm;