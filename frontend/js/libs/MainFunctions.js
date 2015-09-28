/**
 * Created by developer123 on 03.07.15.
 */
var GenericActions = require('../actions/GenericActions');

var MainFunctions = {
    transitToPage: function (pageType) {

        if (window.history && history.pushState) {
            history.pushState({}, "ARES Kudo - " + pageType, "?page=" + pageType);
            GenericActions.changePage(pageType);
        }
        else location.href = pageType + ".html";
    },
    QueryString: function (name) {
        // This function is anonymous, is executed immediately and
        // the return value is assigned to QueryString!
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                query_string[pair[0]] = [query_string[pair[0]], decodeURIComponent(pair[1])];
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }
        return query_string[name];
    },

    detectPageType: function () {
        if (window.history && history.pushState) {
            if (this.QueryString('page') == 'index' || !this.QueryString('page')) return 'index';
            else if (this.QueryString('page') == 'files') return 'files';
            else if (this.QueryString('page') == 'templates') return 'templates';
            else if (this.QueryString('page') == 'users') return 'users';
            else if (this.QueryString('page') == 'notify') return 'notify';
        }
        else {
            var historyName = "index";
            if (location.href.indexOf('html') == -1 || location.href.indexOf('index.html') !== -1) historyName = "login";
            else if (location.href.indexOf('files.html') !== -1) historyName = "files";
            else if (location.href.indexOf('notify.html') !== -1) historyName = "notify";
            else if (location.href.indexOf('templates.html') !== -1) historyName = "templates";
            else if (location.href.indexOf('users.html') !== -1) historyName = "users";
            return historyName;
        }
    },

    shrinkString: function (stringToShrink) {
        if (stringToShrink && stringToShrink.length > 40) {
            var str = stringToShrink.slice(0, stringToShrink.indexOf('('));
            return str.slice(0, 40) + stringToShrink.slice(stringToShrink.indexOf('('), stringToShrink.lastIndexOf(')') + 1) + "...";
        }
        else return stringToShrink;
    },

    findinner: function (a, b) {
        var flag = 0;
        $.each(b, function (i, elem) {
            try {
                if (a.toString() == elem.name.toString()) flag = 1;
            }
            catch (ex) {
                flag = 1;
            }
        });
        return flag;
    },

    intersect: function (a, b) {
        var t,self=this;
        if (b.length > a.length) { //noinspection CommaExpressionJS
            t = b, b = a, a = t;
        } // indexOf to loop over shorter
        return a.filter(function (e) {
            if (self.findinner(e.name, b)) return true;
            //if (b.indexOf(e) !== -1) return true;
        });
    },

    checkStorage: function (headers) {
        if (!headers || !headers.length) return false;
        try {
            var json = JSON.parse(headers);
            json = !(!json[0]['value'] || !json[0]['value'].length);
        }
        catch (e) {
            return false;
        }
        return true;
    },

    ableToString: function (variable) {
        try {
            if (typeof variable == "undefined") return false;
            else if (typeof variable.toString !== "function") return false;
        }
        catch (e) {
            return false;
        }
        return true;
    },

    searchOverlay: function (haystack, needle) {
        if (typeof needle == "string")
            return haystack.indexOf(needle) != -1;
        else try {
            return haystack.search(needle) != -1;
        }
        catch (e) {
            return false;
        }
    },

    dateFormat: function (javadate) {
        if (javadate) {
            var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            var date = new Date(javadate);
            var today = new Date();
            var timeDiff = Math.abs(today.getTime() - date.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if (date.toDateString() == today.toDateString()) return ('today at ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2));
            else if (diffDays < 2) return ('yesterday at ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2));
            else if (diffDays < 8) return (diffDays + ' days ago at ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2));
            else {
                var ending = "st";
                try {
                    if (date.getDate().toString().slice(-1) == '2') ending = 'nd';
                    else if (date.getDate().toString().slice(-1) == '3') ending = 'rd';
                    else if (date.getDate().toString().slice(-1) != '1') ending = 'th';
                }
                catch (ex) {
                    ending = '';
                }
                if (today.getFullYear() == date.getFullYear()) return (date.getDate() + ending + ' ' + months[date.getMonth()] + ' at ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2));
                else if (today.getFullYear() != date.getFullYear()) return (date.getDate() + ending + ' ' + months[date.getMonth()] + ' ' + date.getFullYear() + ' at ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2));
            }
            return ('0' + date.getDate()).slice(-2) + '.' + ('0' + (date.getMonth() + 1)).slice(-2) + '.' + date.getFullYear() + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
        }
        return null;
    },

    mergeObjects: function (obj1, obj2) {
        var obj3 = {};
        for (var attr in obj1) {
            if (obj1.hasOwnProperty(attr)) obj3[attr] = obj1[attr];
        }
        for (var attr in obj2) {
            if (obj2.hasOwnProperty(attr)) obj3[attr] = obj2[attr];
        }
        return obj3;
    },

    mergeLists: function (list1, list2) {
        var obj3 = {files: [], folders: []}, element = null, prop = null;
        for (prop in list1) {
            if (list1.hasOwnProperty(prop))
                for (element in list1[prop])
                    obj3[prop].push(list1[prop][element]);
        }
        for (prop in list2) {
            if (list2.hasOwnProperty(prop))
                for (element in list2[prop])
                    obj3[prop].push(list2[prop][element]);
        }
        return obj3;
    },
    urldecode: function (str) {
        return decodeURIComponent((str + '').replace(/\+/g, '%20'));
    },
    getIconClassName: function (ext, objType, fileName) {
        if (fileName && fileName.length)
            ext = /(?:\.([^.]+))?$/.exec(fileName)[1];
        var iconsArray = ["aac", "aiff", "ai", "asp", "avi", "bmp", "c", "cpp", "css", "dat", "dmg", "doc", "docx", "dot", "dotx", "dwg", "dxf", "eps", "exe", "file", "flv", "folderHover", "folder", "gif", "h", "html", "ics", "iso", "java", "jpg", "key", "m4v", "mid", "mov", "mp3", "mp4", "mpg", "odp", "ods", "odt", "otp", "ots", "ott", "pdf", "php", "png", "pps", "ppt", "psd", "py", "qt", "rar", "rb", "rtf", "script.sh", "sql", "tga", "tgz", "tiff", "txt", "wav", "xls", "xlsx", "xml", "yml", "zip"];
        if (ext && iconsArray.indexOf(ext.toLowerCase()) !== -1 && objType == "file") return ext.toLowerCase(); else return objType;
    },
    objectDiff: function (obj1, obj2, ignoreProps) {
        if (!ignoreProps) ignoreProps = [];
        var anyDiff = false;
        for (var prop in obj1) {
            if (obj1.hasOwnProperty(prop) && ignoreProps.indexOf(prop) == -1)
                if (!obj2.hasOwnProperty(prop) || obj1[prop] != obj2[prop]) anyDiff = true;
        }
        return anyDiff;
    }
};
module.exports = MainFunctions;
var logData = [];
(function () {
    var log = console.log,
        error = console.error,
        warn = console.warn,
        info = console.info;

    console.log = function () {
        var args = Array.prototype.slice.call(arguments);
        log.apply(this, args);
        logData.push({level: "log", arguments: args});
    };
    console.error = function () {
        var args = Array.prototype.slice.call(arguments);
        error.apply(this, args);
        logData.push({level: "error", arguments: args});
    };
    console.warn = function () {
        var args = Array.prototype.slice.call(arguments);
        warn.apply(this, args);
        logData.push({level: "warn", arguments: args});
    };
    console.info = function () {
        var args = Array.prototype.slice.call(arguments);
        info.apply(this, args);
        logData.push({level: "info", arguments: args});
    };
}());
(function (console) {

    console.save = function (filename) {

        if (!logData) {
            console.error('Console.save: No data');
            return;
        }

        if (!filename) filename = 'console.json';

        if (typeof logData === "object") {
            var saveDate = JSON.stringify(logData, undefined, 4)
        }

        var blob = new Blob([saveDate], {type: 'text/json'}),
            e = document.createEvent('MouseEvents'),
            a = document.createElement('a');

        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
    }
})(console);
