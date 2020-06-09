;(function(jQuery, jpi) {

    "use strict";

    var global = {
        nav: jQuery(".nav"),
        menuButton: jQuery(".nav__toggle"),
    };

    var fn = {

        toggleMobileMenu: function() {
            global.nav.toggleClass("nav--opened");
        },

        closeMobileNav: function(e) {
            var clickedElem = jQuery(e.target);
            if (
                (clickedElem.hasClass("nav__link") || !clickedElem.closest(".nav").length) &&
                global.nav.hasClass("nav--opened") &&
                global.menuButton.css("display") !== "none"
            ) {
                global.menuButton.trigger("click");
            }
        },

        initListeners: function() {
            global.menuButton.on("click", fn.toggleMobileMenu);
            jQuery(document).on("click", fn.closeMobileNav);
            jQuery(".nav__link").on("click", fn.closeMobileNav);
        },

    };

    jQuery(document).on("ready", fn.initListeners);

})(jQuery, jpi);
