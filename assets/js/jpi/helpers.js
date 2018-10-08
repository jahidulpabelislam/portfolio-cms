//Holds any helpers functions for whole project
window.jpi = window.jpi || {};
window.jpi.helpers = (function (jQuery) {

	"use strict";

	var fn = {

		/*
		 * used to check if input field is empty
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

		//creates a element with attributes appended to parent
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
		}
	};

	return {
		"checkInputField": fn.checkInputField,
		"createElement": fn.createElement
	};

}(jQuery));