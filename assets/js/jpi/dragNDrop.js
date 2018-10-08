window.jpi = window.jpi || {};
window.jpi.dnd = (function (jQuery) {

	"use strict";

	var global = {
		dropZone: jQuery(".js-drop-zone")[0]
	};

	var fn = {

		//read item dropped
		readItem: function (item) {
			//creates variable for later
			var directoryReader, i;

			//checks if item is file
			if (item.isFile) {

				//gets file
				item.file(function (file) {
					jpi.admin.checkFile(file);
				});
			}
			//checks if its a directory
			else if (item.isDirectory) {

				//Get folder content
				directoryReader = item.createReader();
				directoryReader.readEntries(function (entries) {
					//loop through each directory item
					for (i = 0; i < entries.length; i++) {
						fn.readItem(entries[i]);
					}
				});

			}
			//else drop of item has failed therefore show its failed
			else {
				jpi.admin.renderFailedUpload("Error processing upload - " + item.name);
			}
		},

		//when a drag over starts
		dragOver: function (e) {

			//stop default events
			e.preventDefault();
			e.stopPropagation();

			//make drop zone visible
			global.dropZone.style.zIndex = 10;
			global.dropZone.style.opacity = 1;
		},

		removeDropZone: function (e) {
			//stop default events
			e.preventDefault();
			e.stopPropagation();

			//make drop zone invisible
			global.dropZone.style.opacity = 0;
			setTimeout(function () {
				global.dropZone.style.zIndex = -10;
			}, 1000);
		},

		//when drop of item (file/directory) has occurred
		drop: function (e) {

			var items, i;

			fn.removeDropZone(e);

			//gets the items (files/directories) dropped
			items = e.dataTransfer.items;

			//loop through each item (file/directory) dropped
			for (i = 0; i < items.length; i++) {
				//send a item (file/directory) to be read
				fn.readItem(items[i].webkitGetAsEntry());
			}

			// As the reading of files are async, the upload may not be in DOM yet
			// So We go to uploads container instead as default
			// But if there was already items in uploads, we scroll to the bottom of last item
			var pos = jQuery(".project__uploads").offset().top;
			if (jQuery(".project__upload").length > 0) {
				var lastItem = jQuery(".project__upload").last();
				var topOfLastItem = lastItem.offset().top;
				pos = topOfLastItem + lastItem.outerHeight();
			}

			var navHeight = jQuery(".nav").outerHeight();
			var feedbackHeight = jQuery(".project__feedback").outerHeight();
			jQuery('html, body').animate({
				scrollTop: pos - navHeight - feedbackHeight - 16
			}, 1000);
		},

		//stop drag and drop to work
		stop: function () {
			window.removeEventListener("dragover", fn.dragOver);
			window.removeEventListener("drop", fn.drop);
		},

		//this allows drag and drop to work, sets up all listeners needed
		setUp: function () {

			//sets up listener for when a drag occurs
			window.addEventListener("dragover", fn.dragOver);

			//sets up listener for when a drop happens
			window.addEventListener("drop", fn.drop);

			//when user leaves the area, make drop zone invisible
			global.dropZone.addEventListener("dragleave", fn.removeDropZone);
		}
	};

	return {
		"setUp": fn.setUp,
		"stop": fn.stop
	};

}(jQuery));