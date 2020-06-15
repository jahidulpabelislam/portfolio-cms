;window.jpi = window.jpi || {};
window.jpi.dnd = (function(jQuery, jpi) {

    "use strict";

    var global = {};

    var fn = {

        initDropZone: function() {
            if (!global.dropZone) {
                global.dropZone = jQuery(".project__image-drop-zone");
            }
        },

        readItem: function(item, isLast) {
            if (item.isFile) {
                item.file(function(file) {
                    jpi.cms.checkFile(file, isLast);
                });
            }
            else if (item.isDirectory) {
                // Get folder content
                var directoryReader = item.createReader();
                directoryReader.readEntries(function(entries) {
                    var length = entries.length;
                    // Loop through each item in directory and read each item
                    for (var i = 0; i < length; i++) {
                        fn.readItem(entries[i], (isLast && i === length - 1));
                    }
                });
            }
            // Else drop of item has failed therefore show its failed
            else {
                jpi.cms.renderFailedUpload("Error processing upload - " + item.name);
            }
        },

        dragOver: function() {
            global.dropZone.addClass("drag-over");
        },

        dragOverEnd: function() {
            global.dropZone.removeClass("drag-over");
        },

        drop: function(e) {
            jpi.cms.showLoading();
            var items = e.originalEvent.dataTransfer.items || [];

            var length = items.length;
            // Loop through each item (file/directory) dropped & read each one
            for (var i = 0; i < length; i++) {
                fn.readItem(items[i].webkitGetAsEntry(), i === length - 1);
            }
        },

        init: function() {
            if (global.dropZone) {
                return;
            }

            fn.initDropZone();

            global.dropZone.on('dragover dragenter dragleave dragend drop', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                })
                .on('dragover dragenter', fn.dragOver)
                .on('dragleave dragend drop', fn.dragOverEnd)
                .on('drop', fn.drop);
        },
    };

    return {
        setUp: fn.init,
    };

})(jQuery, jpi);
