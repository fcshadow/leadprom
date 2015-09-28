/**
 * Created by khizh on 9/16/2015.
 */
var React = require('react');
var GenericLoader = require('../components/GenericLoader');
var MainFunctions = require('../libs/MainFunctions');
var PageLoad = require('../libs/PageLoad');
PageLoad.initPage();
React.render(
    <GenericLoader />,
    document.getElementById('react')
);