window.jpi = window.jpi || {};
window.jpi.nav = (function(jQuery) {

	"use strict";

	var global = {
		mainSelector: ".nav",
		itemsSelector: ".nav__links-container",
		mobileToggleSelector: ".nav__links-container"
	};

	var fn = {

		toggleMobileMenu: function() {
			var container = jQuery(global.itemsSelector);
			jQuery(".nav").toggleClass("opened");
			container.slideToggle();
		},

		initDesktopNav: function() {
			if (jQuery(window).width() > 768) {
				var container = jQuery(global.itemsSelector);
				container.show();
			}
		},

		closeMobileNav: function(event) {
			if (!jQuery(event.target).closest(global.mainSelector).length && jQuery(global.mainSelector).hasClass("opened") && jQuery(global.mobileToggleSelector).css("display") !== "none") {
				jQuery(".nav__mobile-toggle").trigger("click");
			}
		},

		initListeners: function() {
			jQuery(global.mobileToggleSelector).on("click", fn.toggleMobileMenu);
			jQuery(document).on("click", fn.closeMobileNav);
			jQuery(window).on("orientationchange resize", fn.initDesktopNav);
		},

	};

	jQuery(document).on("ready", fn.initListeners);

}(jQuery));