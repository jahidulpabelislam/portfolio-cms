window.jpi = window.jpi || {};
;window.jpi.Router = function(routes) {

    "use strict";

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
