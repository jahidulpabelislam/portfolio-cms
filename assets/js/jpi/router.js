window.jpi = window.jpi || {};
;window.jpi.Router = function(routes) {

    "use strict";

    var run = function () {
        var path = (new URL(window.location)).pathname;

        for (var route in routes) {
            if ({}.hasOwnProperty.call(routes, route)) {
                var regex = new RegExp("^" + route + "$", "g");
                if (regex.test(path)) {
                    var matches = path.match(route.replace("/", "\/"));
                    var params = [];

                    for (var i = 1; i < matches.length; i++) {
                        params.push(matches[i]);
                    }

                    routes[route](...params);
                    return;
                }
            }
        }
    }

    window.addEventListener("popstate", function() {
        run();
    });

    return {
        run,
    };
};
