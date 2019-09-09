;window.jpi = window.jpi || {};
window.jpi.nav = (function(jQuery, jpi) {

    "use strict";

    var global = {
        nav: jQuery(".nav"),
        items: jQuery(".nav__links-container"),
        menuButton: jQuery(".nav__mobile-toggle"),
    };

    var fn = {

        toggleMobileMenu: function() {
            global.nav.toggleClass("opened");
            global.items.slideToggle();
        },

        initDesktopNav: function() {
            if (jpi.helpers.isDesktop()) {
                global.items.show();
            }
        },

        closeMobileNav: function(e) {
            var clickedElem = jQuery(e.target);
            if (
                (clickedElem.hasClass("nav-item__link") || !clickedElem.closest(".nav").length) &&
                global.nav.hasClass("opened") &&
                global.menuButton.css("display") !== "none"
            ) {
                global.menuButton.trigger("click");
            }
        },

        initListeners: function() {
            jQuery("body").on("click", ".nav__mobile-toggle", fn.toggleMobileMenu);
            jQuery(document).on("click", fn.closeMobileNav);
            jQuery(window).on("orientationchange resize", jpi.helpers.debounce(fn.initDesktopNav, 150));
        },

    };

    jQuery(document).on("ready", fn.initListeners);

    return {
        closeMobileNav: fn.closeMobileNav,
    };

})(jQuery, jpi);
