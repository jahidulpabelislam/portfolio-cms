// Holds any helpers functions for whole project
window.jpi = window.jpi || {};
window.jpi.helpers = (function(jQuery) {

    "use strict";

    var global = {
        contentSelector: ".main-content",
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

            return defaultFeedback ? defaultFeedback : "";
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

        // Expands height of content to make it full length
        expandSection: function() {
            var contentElem = jQuery(global.contentSelector);

            // Makes content default height to work out if content is too small or big
            contentElem.height("auto");

            // Calculates the default height of the content
            var height = contentElem.outerHeight(true);

            // Checks if default height of content is shorter than screen height
            if (height < jQuery(window).height()) {
                // Section is extended to fill the difference
                contentElem.height(jQuery(window).height() - height + contentElem.height());
            }
        },

        /*
         * Used to expand height of section every 10 milliseconds
         * created to combat against the css transition delays
         */
        delayExpandingSection: function() {
            var timer = setInterval(fn.expandSection, 100);
            setTimeout(function() {
                clearInterval(timer);
            }, 2500);
        },

        initListeners: function() {
            jQuery(window).on("load orientationchange resize", fn.expandSection);
        },
    };

    jQuery(document).on("ready", fn.initListeners);

    return {
        getJwt: fn.getJwt,
        setJwt: fn.setJwt,
        getFeedback: fn.getFeedback,
        getAJAXResponse: fn.getAJAXResponse,
        getInt: fn.getInt,
        checkInputField: fn.checkInputField,
        delayExpandingSection: fn.delayExpandingSection,
    };

})(jQuery);