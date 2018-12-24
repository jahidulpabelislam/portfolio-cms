window.jpi = window.jpi || {};
window.jpi.nav = (function(jQuery) {

	"use strict";

	var fn = {

		toggleMobileMenu: function() {
			var container = jQuery(".nav__links-container, .nav__social-links-container");
			jQuery(".nav").toggleClass("opened");
			container.slideToggle();
		},

		initDesktopNav: function() {
			if (jQuery(window).width() > 768) {
				var container = jQuery(".nav__links-container, .nav__social-links-container");
				container.show();
			}
		},

		// Custom code to collapse mobile menu when user clicks off it.
		closeMobileNav: function(event) {
			if (!jQuery(event.target).closest(".nav").length && jQuery(".nav").hasClass("opened") && jQuery(".nav__mobile-toggle").css("display") !== "none") {
				jQuery(".nav__mobile-toggle").trigger("click");
			}
		},

		initListeners: function() {
			jQuery(".nav__mobile-toggle").on("click", fn.toggleMobileMenu);
			jQuery(document).on("click", fn.closeMobileNav);
			jQuery(window).on("orientationchange resize", fn.initDesktopNav);
		},

	};

	jQuery(document).on("ready", fn.initListeners);

}(jQuery));