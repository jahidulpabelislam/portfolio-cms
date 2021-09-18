;/**
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

        getJwtFromStorage: function() {
            var jwt = localStorage.getItem(global.jwtStorageKey);
            global.jwt = jwt;
            return jwt;
        },

        getJwt: function() {
            var jwt = global.jwt;

            if (!jwt || jwt.trim() === "") {
                jwt = fn.getJwtFromStorage();
            }

            return jwt;
        },

        setJwt: function(jwt) {
            localStorage.setItem(global.jwtStorageKey, jwt);
            global.jwt = jwt;
        },

        getAPIFeedback: function(response, defaultFeedback) {
            if (response) {
                if (response.error) {
                    return response.error;
                }

                if (response.message) {
                    return response.message;
                }
            }

            return defaultFeedback || "";
        },

        getAPIResponse: function(response) {
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

        isDesktop: function() {
            return window.innerWidth > 1200;
        },

        /**
         * Used to check if input field is empty
         * add invalid class if empty and return false
         * or remove invalid class if  not empty and return true
         */
        checkInput: function(elem) {
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

        /**
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

        slashURL: function(url, isRelative) {
            if (url === "" || url === "/") {
                return "/";
            }

            // Add leading slash if none
            if (isRelative && url[0] !== "/") {
                url = "/" + url;
            }

            // Add trailing slash if none
            if (url[url.length - 1] !== "/") {
                url += "/";
            }

            return url;
        },

        genURL: function(domain, relativeURL) {
            relativeURL = fn.slashURL(relativeURL, true);
            // Remove leading slash as its added below
            if (relativeURL[0] === "/") {
                relativeURL = relativeURL.substring(1);
            }

            // Remove trailing slash as its added below
            if (domain[domain.length - 1] === "/") {
                domain = domain.substring(0, domain.length - 1);
            }

            var fullURL = domain + "/" + relativeURL;

            return fullURL;
        },

    };

    return {
        getJwt: fn.getJwt,
        setJwt: fn.setJwt,
        getAPIFeedback: fn.getAPIFeedback,
        getAPIResponse: fn.getAPIResponse,
        isDesktop: fn.isDesktop,
        getInt: fn.getInt,
        checkInput: fn.checkInput,
        slashURL: fn.slashURL,
        genURL: fn.genURL,
        debounce: fn.debounce,
    };

})();
