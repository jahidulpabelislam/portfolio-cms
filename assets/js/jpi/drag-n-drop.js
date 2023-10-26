;window.jpi = window.jpi || {};
window.jpi.DragNDrop = function(dropZone, options) {

    "use strict";

    let totalDropped = 0;
    let totalDroppedComplete = 0;

    const readItem = function(item) {
        if (item.isFile) {
            item.file(function(file) {
                if (!file.type.includes("image/")) {
                    totalDroppedComplete++;
                    options.onFileAddError(file.name + " isn't a image.", totalDropped === totalDroppedComplete);
                    return;
                }

                const fileReader = new FileReader();
                fileReader.onload = function (event) {
                    totalDroppedComplete++;
                    options.onFileAddSuccess(file, event.target.result, totalDropped === totalDroppedComplete);
                };
                fileReader.onerror = function() {
                    totalDroppedComplete++;
                    options.onFileAddError("Error getting " + file.name, totalDropped === totalDroppedComplete);
                }
                fileReader.readAsDataURL(file);
            });
        }
        else if (item.isDirectory) {
            const directoryReader = item.createReader();
            directoryReader.readEntries(function(entries) {
                const length = entries.length;
                totalDropped += length;
                for (let i = 0; i < length; i++) {
                    readItem(entries[i]);
                }
            });
        }
        else {
            totalDroppedComplete++;
            options.onFileAddError("Error processing upload - " + item.name, totalDropped === totalDroppedComplete);
        }
    };

    const onDragOver = function(event) {
        event.preventDefault();
        event.stopPropagation();

        dropZone.classList.add("drag-over");
    };

    const onDragOverEnd = function(event) {
        event.preventDefault();
        event.stopPropagation();

        dropZone.classList.remove("drag-over");
    };

    dropZone.addEventListener("dragover", onDragOver);
    dropZone.addEventListener("dragenter", onDragOver);

    dropZone.addEventListener("dragleave", onDragOverEnd);
    dropZone.addEventListener("dragend", onDragOverEnd);
    dropZone.addEventListener("drop", onDragOverEnd);

    dropZone.addEventListener("drop", function(event) {
        options.onDrop();

        totalDropped = event.dataTransfer.items.length;
        totalDroppedComplete = 0;

        for (let i = 0; i <= event.dataTransfer.items.length; i++) {
            readItem(event.dataTransfer.items[i].webkitGetAsEntry());
        }
    });
};
