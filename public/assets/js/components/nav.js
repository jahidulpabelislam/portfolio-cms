(function(app) {

    "use strict";

    const nav = document.querySelector(".nav");

    const links = document.querySelectorAll(".nav__link");

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

    links.forEach(function (link) {
        link.addEventListener("click", function () {
            if (nav.classList.contains("nav--opened")) {
                nav.classList.remove("nav--opened");
            }
        });
    });

    app.showNav = function () {
        nav.classList.add("nav--shown");
    };

    app.activateLink = function (path) {
        links.forEach(function (link) {
            nav.classList.toggle("nav__link--active", link.getAttribute("href") === path);
        });
    };
})(jpi);
