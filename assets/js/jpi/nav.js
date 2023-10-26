;(function() {

    "use strict";

    const nav = document.querySelector(".nav");

    document.addEventListener("click", function (event) {
        if (!nav.classList.contains("nav--opened")) {
            return;
        }

        if (!nav.contains(event.target)) {
            nav.classList.remove("nav--opened");
        }
    });

    document.querySelector(".nav__toggle").addEventListener("click", function() {
        nav.classList.toggle("nav--opened");
    });

    document.querySelectorAll(".nav__link").forEach(function (link) {
        link.addEventListener("click", function () {
            if (nav.classList.contains("nav--opened")) {
                nav.classList.remove("nav--opened");
            }
        });
    });
})();
