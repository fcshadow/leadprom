/**
 * Created by developer123 on 16.03.15.
 */
//    TODO: make page load working in release mode
var Storage = require('./Storage');
var UserInfoActions = require('../actions/UserInfoActions');
var UserInfoStore = require('../stores/UserInfoStore');
var MainFunctions = require('./MainFunctions');
var $ = require('jquery');

var checker = {};
var url = location.href.split('/');
var folder = '/' + url[3];
var PageLoad = {
    initPage: function () {
        $.ajax({
            url: folder + '/fluorine.json',
            method: "GET",
            dataType: "json",
            contentType: "application/json;",
            beforeSend: function (request) {
                if (request.overrideMimeType)
                    request.overrideMimeType("application/json");
            }
        }).always(function (data) {
            for (var key in data)
                if (data.hasOwnProperty(key))
                    if (typeof data[key].toString == "function")
                        checker[key] = data[key].toString();

            var storageList = UserInfoStore.getConfig();
            if (MainFunctions.objectDiff(checker, storageList, ['editor'])) {
                for (var key in checker)
                    if (checker.hasOwnProperty(key)) storageList[key] = checker[key];
                storageList['path']=(storageList['debug'] == 'true') ? "" : storageList['revision'] + '/';
            }
            var KudoApiUrl = storageList['path'] || "/api";
            var session = Storage.store('sessionId');
            var pageType = MainFunctions.detectPageType();
            storageList['defaultheaders']=JSON.stringify([{"name": "sessionId", "value": session}]);
            UserInfoActions.saveConfig(storageList);
            if (pageType !== "notify") {
                if (session && session != 'logout') {
                    if (pageType == "index") {
                        //index page w\session
                        $.ajax({
                            url: KudoApiUrl + '/auth',
                            beforeSend: function (request) {
                                request.setRequestHeader("sessionId", session);
                                if (request.overrideMimeType)
                                    request.overrideMimeType("application/json");
                            },
                            type: "GET",
                            dataType: "JSON",
                            contentType: "application/json;"
                        }).always(function (data) {
                            if (data.status !== 401) {
                                MainFunctions.transitToPage('files');
                            } else {
                                Storage.clearStorage();
                            }
                        });
                    } else {
                        //not index page w\session
                        $.ajax({
                            url: KudoApiUrl + '/auth',
                            beforeSend: function (request) {
                                request.setRequestHeader("sessionId", session);
                                if (request.overrideMimeType)
                                    request.overrideMimeType("application/json");
                            },
                            type: "GET",
                            dataType: "JSON",
                            contentType: "application/json;"
                        }).always(function (data) {
                            if (data.status == 401) {
                                document.write('<script type="text/undefined">');
                                MainFunctions.transitToPage('index');
                                Storage.store('error', 'loginfirst');
                            }
                        });
                    }
                } else {
                    if (pageType !== "index") {
                        //not index page w\o session
                        document.write('<script type="text/undefined">');
                        MainFunctions.transitToPage('index');
                        Storage.store('error', 'loginfirst');
                    }
                }
            }
            $(document).ready(function () {
                if (storageList['debug'] != 'true') {
                    var s2 = document.createElement('script');
                    s2.async = true;
                    s2.type = 'text/javascript';
                    document.body.appendChild(s2);
                    s2.src = 'js/libs/tracker.js';
                    var s3 = document.createElement("script");
                    s3.type = "text/javascript";
                    s3.async = true;
                    s3.src = '//api.usersnap.com/load/' +
                        '4f0889b8-1ff9-4386-9da9-46135ee801f3.js';
                    var x = document.getElementsByTagName('script')[0];
                    x.parentNode.insertBefore(s3, x);
                }
                var l1 = document.createElement('link');
                l1.rel = 'stylesheet';
                document.head.appendChild(l1);
                l1.href = storageList['path'] + 'css/style.css';
                if (pageType == "index" || pageType == "notify")
                    $('body').addClass('init');
                else $('body.init').removeClass('init');
                var l2 = document.createElement('link');
                l2.rel = 'stylesheet';
                document.head.appendChild(l2);
                l2.href = storageList['path'] + 'css/bootstrap-theme.css';
                var l3 = document.createElement('link');
                l3.rel = 'stylesheet';
                document.head.appendChild(l3);
                l3.href = storageList['path'] + 'css/bootstrap.min.css';
            });
        });
    }
};
module.exports = PageLoad;