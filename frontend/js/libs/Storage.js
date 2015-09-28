/**
 * Created by developer123 on 03.07.15.
 */
var MainFunctions = require('../libs/MainFunctions');

var Storage = ({
    getStorageSupport: function () {
        var lsSupport = false;
        try {
            localStorage.setItem("test", "test");
            localStorage.removeItem("test");
            lsSupport = true;
        } catch (e) {
            lsSupport = false;
        }
        return lsSupport ? "localStorage" : "cookie";
    },

    deleteValue: function (key) {
        switch (this.getStorageSupport()) {
            case "localStorage":
                localStorage.removeItem(key);
                break;
            default:
            case "cookie":
                break;
        }
    },

    store: function (key, value) {
        switch (this.getStorageSupport()) {
            case "localStorage":
                var currentValue = localStorage.getItem(key);
                if (typeof value !== "undefined" && currentValue !== value) {
                    localStorage.setItem(key, value);
                    if (!(window.eval && eval("/*@cc_on 1;@*/") )) {
                        var e = document.createEvent('StorageEvent');
                        e.initStorageEvent('storage', false, false, key,
                            currentValue, value, location.href, window.sessionStorage);
                        window.dispatchEvent(e);
                    }
                    currentValue = value;
                }
                return currentValue;
                break;
            default:
            case "cookie":
                break;
        }
    },

    foreachStorage: function (fn) {
        switch (this.getStorageSupport()) {
            case 'localStorage':
                for (var key in localStorage)
                    if (localStorage.hasOwnProperty(key)) fn(key);
                break;
            default:
                return false;
                break;
        }
    },

    clearStorage: function () {
        switch (this.getStorageSupport()) {
            case "localStorage":
                localStorage.clear();
                break;
            default:
            case "cookie":
                document.cookie = "";
                break;
        }
    },

    storageEventHandler: function (e) {
        if (e.key === "sessionId") {
            Storage.deleteValue('error');
            if (e.newValue == "logout")
                MainFunctions.transitToPage('index');
            else if (e.newValue.length == 0) {
                Storage.store('error', 'loginfirst');
                MainFunctions.transitToPage('index');
            }
            else if (e.newValue.length > 0)
                MainFunctions.transitToPage('files');
            else
                MainFunctions.transitToPage('index');
        }
    },

    onLoad: function () {
        if ("addEventListener" in window)
            window.addEventListener('storage', this.storageEventHandler, false);
        else
            document.attachEvent('onstorage', this.storageEventHandler);
    }
});

module.exports = Storage;

