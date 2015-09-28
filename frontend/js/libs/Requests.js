/**
 * Created by developer123 on 31.05.15.
 */
var Storage = require('../libs/Storage');
var MainFunctions = require('../libs/MainFunctions');
var UserInfoStore = require('../stores/UserInfoStore');
var $ = require('jquery');

var Requests = {

    getXmlHttp: function () {
        var xmlhttp;
        try {
            xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (E) {
                xmlhttp = false;
            }
        }
        if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
            xmlhttp = new XMLHttpRequest();
        }
        return xmlhttp;
    },

    parseAnswer: function (response, statusCode) {
        var actualResponse = null;
        try {
            if (response.status == "ok") return response;
            actualResponse = JSON.parse(response);
            actualResponse.status = "ok";
            actualResponse.statusCode = statusCode;
        }
        catch (E) {
            actualResponse = {};
            if (!response.responseText) actualResponse=response;
            actualResponse.status = false;
            actualResponse.error = response.responseText;
            actualResponse.statusCode = statusCode || response.status;
        }
        if (actualResponse.statusCode == 401) {
            actualResponse.digestHeader = response.getResponseHeader('Authenticate');
            Storage.clearStorage();
            if (MainFunctions.detectPageType() !== "index") {
                Storage.store('error', 'loginfirst');
                MainFunctions.transitToPage('index');
            }
        }
        return actualResponse;
    },

    sendRequest: function (url, type, data, headers, callback, async, xhrfun, processData, contentType) {
        var parseAnswer = this.parseAnswer;
        async = async || true;
        contentType = (contentType == "!true" ? false : "application/json;");
        var requests = 'ajax';
        if (UserInfoStore.getConfig('requests') && UserInfoStore.getConfig('requests').length) requests = UserInfoStore.getConfig('requests');
        switch (requests) {
            default:
            case 'ajax':
                $.ajax({
                    async: async,
                    url: url,
                    data: data,
                    type: type,
                    beforeSend: function (request) {
                        if (headers.length)
                            $.each(headers, function (i, elem) {
                                request.setRequestHeader(elem.name, elem.value);
                            });
                        if (request.overrideMimeType)
                            request.overrideMimeType("application/json");
                    },
                    xhr: xhrfun,
                    processData: processData,
                    contentType: contentType
                }).always(function (answer, status, statusCode) {
                    if (typeof callback == "function")
                        callback(parseAnswer(answer, statusCode.status));
                });
                break;
            case 'xhr':
                var xmlhttp = this.getXmlHttp();
                xmlhttp.open(type, url, async);
                if (contentType) xmlhttp.setRequestHeader('Content-Type', 'application/json;');
                for (var i = 0; i < headers.length; i++)
                    xmlhttp.setRequestHeader(headers[i].name, headers[i].value);
                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState == 4) {
                        callback(parseAnswer(xmlhttp.responseText), xmlhttp.status);
                    }
                };
                xmlhttp.send(data);
                break;
            case 'websockets':
                var ws = new WebSocket(url);
                ws.onopen = function (event) {
                    console.log('onopen');
                    ws.send("Hello Web Socket!");
                };
                ws.onmessage = function (event) {
                    console.log(event);
                };
                ws.send(json);
                break;
        }
    }
};
module.exports = Requests;