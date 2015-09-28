/**
 * Created by khizh on 9/21/2015.
 */
var url = location.href.split('/');
var folder = '/' + url[3];
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
    var s = document.createElement('script');
    s.async = true;
    s.type = 'text/javascript';
    document.body.appendChild(s);
    if (data.debug.toString() != "true") {
        s.src = data.revision + '/js/dist/genericBundle.js';
    } else s.src = 'js/dist/genericBundle.js';
});