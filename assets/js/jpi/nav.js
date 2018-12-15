window.jpi = window.jpi || {};
window.jpi.nav = (function (jQuery) {

	"use strict";

	var fn = {
		toggleMobileMenu: function () {
			var container = jQuery(".nav__links-container, .nav__social-links-container");
			jQuery(".nav").toggleClass("opened");
			container.slideToggle();
		},

		initDesktopNav: function () {
			if (jQuery(window).width() > 768) {
				var container = jQuery(".nav__links-container, .nav__social-links-container");
				container.show();
			}
		},

		//Custom code to collapse mobile menu when user clicks off it.
		closeMobileNav: function (event) {
			if (!jQuery(event.target).closest(".nav").length && jQuery(".nav").hasClass("opened") && jQuery(".nav__mobile-toggle").css("display") !== "none") {
				jQuery(".nav__mobile-toggle").trigger("click");
			}
		},

		toggleNavBarColour: function () {
			var navHeight = jQuery(".nav").height();
			var scrollPos = jQuery(window).scrollTop() + navHeight;
			var headerHeight = jQuery(".jumbotron").height();

			if (scrollPos >= headerHeight) {
				jQuery(".nav").addClass("scrolled");
			}
			else {
				jQuery(".nav").removeClass("scrolled");
			}
		},

		initListeners: function () {
			jQuery(document).on("click", fn.closeMobileNav);

			jQuery(".nav__mobile-toggle").on("click", fn.toggleMobileMenu);

			jQuery(window).on("orientationchange resize", fn.initDesktopNav);

			jQuery(window).on("scroll", fn.toggleNavBarColour);
			fn.toggleNavBarColour();
		}
	};

	jQuery(document).on("ready", fn.initListeners);

}(jQuery));