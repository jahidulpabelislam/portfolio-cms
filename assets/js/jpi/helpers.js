;window.jpi = window.jpi || {};
window.jpi.helpers = (function() {

    "use strict";

    /**
     * Used to check if input field is empty
     * add invalid class if empty and return false
     * or remove invalid class if  not empty and return true
     */
    const checkInput = function (elem) {
        if (elem.value.trim() === "") {
            elem.classList.add("invalid");
            return false;
        }

        return true;
    };

    /**
     * http://davidwalsh.name/javascript-debounce-function
     */
    const debounce = function (func, wait, immediate) {
        let timeout;
        return function () {
            const context = this,
                args = arguments;

            const later = function () {
                timeout = null;
                if (!immediate) {
                    func.apply(context, args);
                }
            };

            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
                func.apply(context, args);
            }
        };
    };

    const makeAJAXRequest = function (request) {
        request.method = request.method.toUpperCase();

        const xhr = new XMLHttpRequest();
        xhr.open(request.method, request.url, true);

        for (const header in request.headers) {
            if (request.headers.hasOwnProperty(header)) {
                xhr.setRequestHeader(header, request.headers[header]);
            }
        }

        xhr.addEventListener("load", function () {
            let response = xhr.responseText;

            if (xhr.responseText !== "" && request.headers.Accept === "application/json") {
                try {
                    response = JSON.parse(response);
                } catch (e) {
                    response = {};
                    console.log(e);
                }
            }

            if (xhr.status < 300) {
                request.onSuccess(response);
                return;
            }

            request.onError(response);
        });

        xhr.addEventListener("error", function () {
            request.onError();
        });

        xhr.send(request.data || null);
    };

    return {
        isDesktop: function() {
            return window.innerWidth > 1200;
        },
        checkInput,
        debounce,
        makeAJAXRequest,
    };
})();
