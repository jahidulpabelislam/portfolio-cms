;/*
 * Holds any helpers functions for whole project
 */
window.jpi = window.jpi || {};
window.jpi.helpers = (function() {

    "use strict";

    var global = {
        jwtStorageKey: "cmsJwt",
        jwt: "",
    };

    var fn = {

        getJwt: function() {
            var jwt = global.jwt;

            if (!jwt || jwt.trim() === "") {
                jwt = fn.getJwtFromStorage();
            }

            return jwt;
        },

        getJwtFromStorage: function() {
            var jwt = localStorage.getItem(global.jwtStorageKey);
            global.jwt = jwt;
            return jwt;
        },

        setJwt: function(jwt) {
            localStorage.setItem(global.jwtStorageKey, jwt);
            global.jwt = jwt;
        },

        getFeedback: function(response, defaultFeedback) {
            if (response && response.meta && response.meta.feedback) {
                return response.meta.feedback;
            }

            return defaultFeedback || "";
        },

        getAJAXResponse: function(response) {
            response = response && response.data ? response.data : {};

            return response;
        },

        getInt: function(value, defaultInt) {
            if (value && !isNaN(value)) {
                var int = parseInt(value, 10);
                return int;
            }

            return defaultInt;
        },

        /*
         * Used to check if input field is empty
         * add invalid class if empty and return false
         * or remove invalid class if  not empty and return true
         */
        checkInputField: function(elem) {
            if (elem.value.trim() === "") {
                elem.classList.add("invalid");
                elem.classList.remove("valid");
                return false;
            }
            else {
                elem.classList.remove("invalid");
                elem.classList.add("valid");
                return true;
            }
        },

        /*
         * http://davidwalsh.name/javascript-debounce-function
         */
        debounce: function(func, wait, immediate) {
            var timeout;
            return function() {
                var context = this,
                    args = arguments;

                var later = function() {
                    timeout = null;
                    if (!immediate) {
                        func.apply(context, args);
                    }
                };

                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) {
                    func.apply(context, args);
                }
            };
        },

        slashURL: function(url) {
            if (url[0] !== "/") {
                url = "/" + url;
            }

            if (url[url.length - 1] !== "/") {
                url += "/";
            }

            return url;
        },

        genURL: function(domain, relativeURL) {
            if (domain[domain.length - 1] === "/") {
                domain = domain.substring(0, domain.length - 1);
            }

            relativeURL = fn.slashURL(relativeURL);

            return domain + relativeURL;
        },

    };

    return {
        getJwt: fn.getJwt,
        setJwt: fn.setJwt,
        getFeedback: fn.getFeedback,
        getAJAXResponse: fn.getAJAXResponse,
        getInt: fn.getInt,
        checkInputField: fn.checkInputField,
        slashURL: fn.slashURL,
        genURL: fn.genURL,
        debounce: fn.debounce,
    };

})();
