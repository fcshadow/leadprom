/**
 * Created by khizh on 9/16/2015.
 */
var React = require('react');
var $ = require('jquery');
var GenericStore = require('../stores/GenericStore');
var AlertActions = require('../actions/AlertActions');
var MainFunctions = require('../libs/MainFunctions');
var Storage = require('../libs/Storage');

//TODO: add backward capability

var GenericLoader = React.createClass({
    getInitialState: function () {
        Storage.onLoad();
        return {
            currentPage: "",
            mode: "loading",
            loadPercentage: 0
        };
    },

    pageElementLoad: function () {
        var pageElement,self=this;
        if (MainFunctions.detectPageType() == "index") {
            var FormLoader = require('../components/FormLoader');
            pageElement = <FormLoader />;
            if (Storage.store('error') == 'loginfirst') {
                AlertActions.showError("You're not logged in or your session has expired", "danger");
                Storage.deleteValue('error');
            }
        } else if (MainFunctions.detectPageType() == "files") {
            var FileLoader = require('../components/FileLoader');
            pageElement = <FileLoader />
        } else if (MainFunctions.detectPageType() == "notify") {
            var NotifyLoader = require('../components/NotifyLoader');
            pageElement = <NotifyLoader />
        } else if (MainFunctions.detectPageType() == "templates") {
            var TemplatesLoader = require('../components/TemplatesLoader');
            pageElement = <TemplatesLoader />
        } else if (MainFunctions.detectPageType() == "users") {
            var UsersLoader = require('../components/UsersLoader');
            pageElement = <UsersLoader />
        }
        this.setState({currentPage: pageElement},function() {
            if (self.state.mode=="loaded") {
                if (MainFunctions.detectPageType() !== "index" && MainFunctions.detectPageType() !== "notify")
                    $('body.init').removeClass('init');
                else
                    $('body').addClass('init');
            }
        });
    },

    componentDidMount: function () {
        var self = this;
        //this.pageElementLoad();
        window.loadTimer = setInterval(function () {
            if (self.state.loadPercentage < 100)
                self.setState({loadPercentage: self.state.loadPercentage + 1}, function () {
                    $('body').addClass('init')
                });
            else {
                self.setState({loadPercentage: 0, mode: "loaded"}, function () {
                    if (MainFunctions.detectPageType() !== "index" && MainFunctions.detectPageType() !== "notify")
                        $('body.init').removeClass('init');
                });
                clearInterval(window.loadTimer);
                self.pageElementLoad();
            }
        }, 20);
        GenericStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {
        GenericStore.removeChangeListener(this._onChange);
    },

    render: function () {
        var self = this;
        //TODO: fix loading
        return (
            <div className="page">
                {this.state.mode == "loading" ? (
                    <div className="loadBar">
                        <div className="bar" style={{width:this.state.loadPercentage+'%'}} role="bar">
                            <div className="peg"></div>
                        </div>
                    </div>
                ) : (self.state.currentPage)}
            </div>
        );
    },

    _onChange: function () {
        this.pageElementLoad();
    }

});

module.exports = GenericLoader;