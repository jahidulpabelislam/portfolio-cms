window.jpi = window.jpi || {};
window.jpi.Router = function(routes) {

    "use strict";

    let currentRoute;

    const run = function () {
        const path = (new URL(window.location)).pathname;

        for (const route in routes) {
            if ({}.hasOwnProperty.call(routes, route)) {
                const regex = new RegExp("^" + route + "$", "g");
                if (regex.test(path)) {
                    const matches = path.match(route.replace("/", "\/"));
                    const params = [];

                    for (let i = 1; i < matches.length; i++) {
                        params.push(matches[i]);
                    }

                    if (currentRoute && currentRoute.beforeLeave) {
                        currentRoute.beforeLeave(...params);
                    }

                    currentRoute = routes[route];

                    currentRoute.callback(...params);
                    return;
                }
            }
        }
    };

    const changeTo = function (path) {
        history.pushState(null, null, path);
        run();
    };

    window.addEventListener("popstate", function() {
        run();
    });

    return {
        run,
        changeTo,
    };
};
