// Holds any helpers functions for whole project
window.jpi = window.jpi || {};
window.jpi.helpers = (function (jQuery) {

	"use strict";
	
	var global = {
		navSelector: ".nav",
		contentSelector: ".main-content",
	};

	var fn = {

		/*
		 * Used to check if input field is empty
		 * add invalid class if empty and return false
		 * or remove invalid class if  not empty and return true
		 */
		checkInputField: function (input) {
			if (input.value.trim() === "") {
				input.classList.add("invalid");
				input.classList.remove("valid");
				return false;
			}
			else {
				input.classList.remove("invalid");
				input.classList.add("valid");
				return true;
			}
		},

		// Creates a element with attributes appended to parent
		createElement: function (parent, element, attributes) {
			var elem = document.createElement(element);

			for (var attribute in attributes) {
				if (attributes.hasOwnProperty(attribute)) {
					if (attribute === "innerHTML") {
						elem[attribute] = attributes[attribute];
					}
					else {
						elem.setAttribute(attribute, attributes[attribute]);
					}
				}
			}

			parent.appendChild(elem);

			return elem;
		},

		// Expands height of content to make it full length
		expandSection: function () {

			var contentElem = jQuery(global.contentSelector);

			// Makes content default height to work out if content is too small or big
			contentElem.height("auto");

			// Calculates the default height of the content
			var height = contentElem.outerHeight(true);

			// Checks if default height of content is shorter than screen height
			if (height < jQuery(window).height()) {

				// Section is extended to fill the difference
				contentElem.height((jQuery(window).height() - height) + contentElem.height());
			}
		},

		/*
		 * Used to expand height of section every 10 milliseconds
		 * created to combat against the css transition delays
		 */
		delayExpandingSection: function () {
			var timer = setInterval(fn.expandSection, 100);
			setTimeout(function () {
				clearInterval(timer);
			}, 2500);
		},

		initListeners: function () {
			jQuery(window).on("load orientationchange resize", fn.expandSection);
		}
	};

	jQuery(document).on("ready", fn.initListeners);

	return {
		"checkInputField": fn.checkInputField,
		"createElement": fn.createElement,
		"delayExpandingSection": fn.delayExpandingSection
	};

}(jQuery));