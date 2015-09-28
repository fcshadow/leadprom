/**
 * Created by developer123 on 17.02.15.
 */
var React = require('react');
var Input = require('react-bootstrap').Input;
var TableActions = require('../actions/TableActions');
var TableStore = require('../stores/TableStore');

var SearchField = React.createClass({

    getInitialState: function () {
        return {value: ''};
    },

    componentDidMount: function () {
        TableStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {
        TableStore.removeChangeListener(this._onChange);
    },

    searchRequest: function (e) {
        if (e.keyCode == 13)
            TableActions.search(this.state.value);
    },

    handleChange: function (event) {
        this.setState({value: event.target.value}, function () {
            if (this.state.value == "")
                TableActions.search(this.state.value);
        });
    },

    render: function () {
        return (
            <input type="text" className="searchfield" value={this.state.value} placeholder="Search"
                   onKeyDown={this.searchRequest} onChange={this.handleChange}/>
        );
    },

    _onChange: function () {
        if (this.props.type == "files" && TableStore.getSearch() == "/(?:)/gi")
            this.setState({value: ""}, null);
    }
});
module.exports = SearchField;