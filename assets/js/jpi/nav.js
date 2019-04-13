;window.jpi = window.jpi || {};
window.jpi.nav = (function(jQuery) {

    "use strict";

    var global = {
        mainSelector: ".nav",
        itemsSelector: ".nav__links-container",
        mobileToggleSelector: ".nav__mobile-toggle",
    };

    var fn = {

        toggleMobileMenu: function() {
            var container = jQuery(global.itemsSelector);
            jQuery(global.mainSelector).toggleClass("opened");
            container.slideToggle();
        },

        initDesktopNav: function() {
            if (jQuery(window).width() > 768) {
                var container = jQuery(global.itemsSelector);
                container.show();
            }
        },

        closeMobileNav: function(e) {
            if (
                (jQuery(e.target).hasClass("nav-item__link") || !jQuery(e.target).closest(global.mainSelector).length) &&
                jQuery(global.mainSelector).hasClass("opened") &&
                jQuery(global.mobileToggleSelector).css("display") !== "none"
            ) {
                jQuery(global.mobileToggleSelector).trigger("click");
            }
        },

        initListeners: function() {
            jQuery("body").on("click", global.mobileToggleSelector, fn.toggleMobileMenu);
            jQuery(document).on("click", fn.closeMobileNav);
            jQuery(window).on("orientationchange resize", fn.initDesktopNav);
        },

    };

    jQuery(document).on("ready", fn.initListeners);

    return {
        closeMobileNav: fn.closeMobileNav,
    }

})(jQuery);
