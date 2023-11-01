window.jpi = window.jpi || {};

window.jpi.shortDateFormat = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
});

window.jpi.longDateFormat = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
});

;(function(app) {

    "use strict";

    const jwtStorageKey = "cmsJwt";
    let jwt;

    const loadingElem = document.querySelector(".js-loading");

    const loginContainer = document.querySelector(".login");
    const loginUsernameInput = loginContainer.querySelector("#username");
    const loginPasswordInput = loginContainer.querySelector("#password");
    const loginFeedbackElem = document.querySelector(".login__feedback");

    const projectListingContainer = document.querySelector(".projects-listing");

    const getJwt = function() {
        if (typeof jwt == "undefined") {
            jwt = localStorage.getItem(jwtStorageKey);
        }

        return jwt;
    };

    const setJwt = function(newJWT) {
        localStorage.setItem(jwtStorageKey, newJWT);
        jwt = newJWT;
    };

    const getFeedbackFromAPIResponse = function(response, defaultFeedback) {
        if (response) {
            if (response.error) {
                return response.error;
            }

            if (response.message) {
                return response.message;
            }
        }

        return defaultFeedback || "";
    };

    const makeAPIRequest = function (request) {
        request.url = jpi.config.jpiAPIBaseURL + request.url;

        request.headers = request.headers || {};

        request.headers.Accept = "application/json";
        request.headers["Cache-Control"] = "no-cache";

        if (request.data && request.method === "GET") {
            request.url = request.url + "?" + new URLSearchParams(request.data).toString();
        } else if (request.data && !(request.data instanceof FormData)) {
            request.headers["Content-Type"] = "application/json";
            request.data = JSON.stringify(request.data);
        }

        if (request.url !== jpi.config.jpiAPIBaseURL + "/auth/login/") {
            request.headers["Authorization"] = "Bearer " + getJwt();
        }

        app.helpers.makeAJAXRequest(request);
    };

    const logIn = function(event) {
        event.preventDefault();

        const usernameElem = loginUsernameInput;
        const passwordElem = loginPasswordInput;

        const isUsernameValid = app.helpers.checkInput(usernameElem);
        const isPasswordValid = app.helpers.checkInput(passwordElem);

        if (isUsernameValid && isPasswordValid) {
            makeAPIRequest({
                method: "POST",
                url: "/auth/login/",
                data: {
                    username: usernameElem.value,
                    password: passwordElem.value,
                },
                onSuccess: function(response) {
                    setJwt(response.data);

                    loginContainer.classList.remove("fixed-overlay--active");
                    app.showNav();
                    router.run();
                },
                onError: function(response) {
                    loginFeedbackElem.innerHTML = getFeedbackFromAPIResponse(response, "Error logging you in.");
                    loginFeedbackElem.classList.add("login__feedback--active");
                },
            });
            return;
        }

        let message;
        if (!isUsernameValid && !isPasswordValid) {
            message = "Username and password fields needs to be filled.";
        }
        else if (!isUsernameValid) {
            message = "Username field needs to be filled.";
        }
        else {
            message = "Password field needs to be filled.";
        }

        loginFeedbackElem.innerHTML = message;
        loginFeedbackElem.classList.add("login__feedback--active");
    };

    document.querySelector(".login__form").addEventListener("submit", logIn);

    document.querySelector(".js-link-new-project").addEventListener("click", function (event) {
        event.preventDefault();
        router.changeTo("/project/edit/new/");
    });

    document.querySelector(".js-logout").addEventListener("click", function (event) {
        event.preventDefault();
        setJwt("");
        window.location = window.location;
    });

    app.showLoading = function () {
        loadingElem.classList.add("fixed-overlay--active");
    };

    app.hideLoading = function () {
        loadingElem.classList.remove("fixed-overlay--active");
    };

    app.getFeedbackFromAPIResponse = getFeedbackFromAPIResponse;
    app.makeAPIRequest = makeAPIRequest;

    const projectsListing = new app.ProjectsListing();
    const projectEdit = new app.ProjectEdit();

    const projectsRoute = {
        callback: projectsListing.load,
        beforeLeave: function () {
            projectListingContainer.classList.remove("projects-listing--active");
        },
    };

    const router = app.Router({
        "/": projectsRoute,
        "/projects/": projectsRoute,
        "/projects/(.+)/": projectsRoute,
        "/project/edit/new/": {
            callback: function () {
                app.showLoading();
                app.activateLink("/project/new/");
                projectEdit.show();
            },
        },
        "/project/edit/(.+)/": {callback: projectEdit.load},
        "(.*)": {
            callback: function() {
                // Fallback - redirect to projects listing
                router.changeTo("/projects/");
            }
        },
    });

    app.router = router;
    app.projectsListing = projectsListing;

    makeAPIRequest({
        method: "GET",
        url: "/auth/status/",
        onSuccess: function(response) {
            if (response.data) {
                app.showNav();
                router.run();
                return;
            }

            loginContainer.classList.add("fixed-overlay--active");
            app.hideLoading();
        },
        onError: function(response) {
            loginContainer.classList.add("fixed-overlay--active");
            app.hideLoading();
        },
    });
})(jpi);
