window.jpi = window.jpi || {};
window.jpi.dnd = (function(jQuery) {

    "use strict";

    var global = {
        dropZone: jQuery(".js-drop-zone")[0]
    };

    var fn = {

        readItem: function(item) {
            var directoryReader, i;

            if (item.isFile) {

                item.file(function(file) {
                    jpi.cms.checkFile(file);
                });
            }
            else if (item.isDirectory) {

                // Get folder content
                directoryReader = item.createReader();
                directoryReader.readEntries(function(entries) {
                    // Loop through each item in directory and read each item
                    for (i = 0; i < entries.length; i++) {
                        fn.readItem(entries[i]);
                    }
                });

            }
            // Else drop of item has failed therefore show its failed
            else {
                jpi.cms.renderFailedUpload("Error processing upload - " + item.name);
            }
        },

        dragOver: function(e) {
            e.preventDefault();
            e.stopPropagation();

            global.dropZone.style.zIndex = 10;
            global.dropZone.style.opacity = 1;
        },

        removeDropZone: function(e) {
            e.preventDefault();
            e.stopPropagation();

            global.dropZone.style.opacity = 0;
            setTimeout(function() {
                global.dropZone.style.zIndex = -10;
            }, 1000);
        },

        drop: function(e) {
            var items, i;

            fn.removeDropZone(e);

            items = e.dataTransfer.items;

            // Loop through each item (file/directory) dropped & read each one
            for (i = 0; i < items.length; i++) {
                fn.readItem(items[i].webkitGetAsEntry());
            }

            jpi.cms.scrollToUploads();
        },

        stop: function() {
            window.removeEventListener("dragover", fn.dragOver);
            window.removeEventListener("drop", fn.drop);
        },

        setUp: function() {
            window.addEventListener("dragover", fn.dragOver);
            window.addEventListener("drop", fn.drop);
            global.dropZone.addEventListener("dragleave", fn.removeDropZone);
        }
    };

    return {
        "setUp": fn.setUp,
        "stop": fn.stop
    };

}(jQuery));