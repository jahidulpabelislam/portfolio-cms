window.jpi = window.jpi || {};

;(function(app) {

    "use strict";

    var loadingElem = document.querySelector(".js-loading");

    var loginContainer = document.querySelector(".login");
    var loginForm = document.querySelector(".login__form");
    var loginFeedbackElem = document.querySelector(".login__feedback");

    var nav = document.querySelector(".nav");

    var projectsListing = document.querySelector(".projects-select");
    var projectsListingFeedbackElem = document.querySelector(".projects-select__feedback");
    var projectsListingPagination = document.querySelector(".pagination");

    var projectsListingRowTemplate = document.querySelector("#js-projects-table-row").innerHTML;

    var projectShowContainer = document.querySelector(".project-view");
    var projectShowFormContainer = document.querySelector(".project__form");
    var projectShowFeedbackElem = document.querySelector(".project__feedback span");
    var projectShowTagsElem = document.querySelector(".js-project-view-tags");

    var projectShowImagesContainer = document.querySelector(".project__images");
    var projectShowImageTemplate = document.querySelector("#js-project-show-image-template").innerHTML;

    var projectShowUploadsContainer = document.querySelector(".project__uploads");
    var projectShowUploadedImages = [];

    var projectShowImageUploadSuccessTemplate = document.querySelector("#js-project-show-image-upload-success-template").innerHTML;
    var projectShowImageUploadErrorTemplate = document.querySelector("#js-project-show-image-upload-error-template").innerHTML;

    var projectShowSelectedProjectID;

    var shortDateFormat = new Intl.DateTimeFormat("default", {
        month: "long",
        year: "numeric",
    });

    var longDateFormat = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    });

    var jwt;
    var jwtStorageKey = "cmsJwt";

    var getJwt = function() {
        if (typeof jwt == "undefined") {
            jwt = localStorage.getItem(jwtStorageKey);
        }

        return jwt;
    };

    var setJwt = function(newJWT) {
        localStorage.setItem(jwtStorageKey, newJWT);
        jwt = newJWT;
    };

    var getFeedbackFromAPIResponse = function(response, defaultFeedback) {
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

    var makeAPIRequest = function (request) {
        request.url = jpi.config.jpiAPIBaseURL + request.url;

        request.headers = request.headers || {};

        request.headers.Accept = "application/json";

        if (request.method === "POST" && request.data && !(request.data instanceof FormData)) {
            request.headers["Content-Type"] = "application/x-www-form-urlencoded";
        }

        if (request.url !== jpi.config.jpiAPIBaseURL + "/auth/login/") {
            request.headers["Authorization"] = "Bearer " + getJwt();
        }

        app.helpers.makeAJAXRequest(request);
    };

    var onSuccessfulLogIn = function(response) {
        setJwt(response.data);

        loginContainer.classList.remove("fixed-overlay--active");
        nav.classList.add("nav--shown");

        router.run();
    };

    var logIn = function(event) {
        event.preventDefault();

        var usernameElem = document.querySelector("#username");
        var passwordElem = document.querySelector("#password");

        var isUsernameValid = app.helpers.checkInput(usernameElem);
        var isPasswordValid = app.helpers.checkInput(passwordElem);

        if (isUsernameValid && isPasswordValid) {
            makeAPIRequest({
                method: "POST",
                url: "/auth/login/",
                data: {
                    username: usernameElem.value,
                    password: passwordElem.value,
                },
                onSuccess: onSuccessfulLogIn,
                onError: function(response) {
                    loginFeedbackElem.innerHTML = getFeedbackFromAPIResponse(response, "Error logging you in.");
                    loginFeedbackElem.classList.add("login__feedback--active");
                },
            });
            return;
        }

        if (!isUsernameValid && !isPasswordValid) {
            var message = "Username and password fields needs to be filled.";
        }
        else if (!isUsernameValid) {
            var message = "Username field needs to be filled.";
        }
        else {
            var message = "Password field needs to be filled.";
        }

        loginFeedbackElem.innerHTML = message;
        loginFeedbackElem.classList.add("login__feedback--active");
    };

    var showProjectsListingFeedback = function (feedback, isError) {
        projectsListingFeedbackElem.innerHTML = feedback;

        if (isError) {
            projectsListingFeedbackElem.classList.remove("feedback--success");
            projectsListingFeedbackElem.classList.add("feedback--error");
        } else {
            projectsListingFeedbackElem.classList.add("feedback--success");
            projectsListingFeedbackElem.classList.remove("feedback--error");
        }

        projectsListingFeedbackElem.classList.add("projects-select__feedback--active");
    };

    var onSuccessfulProjectsGet = function (response, currentPage) {
        var rows = "";
        for (var i = 0; i < response.data.length; i++) {
            var project = response.data[i];

            var row = projectsListingRowTemplate;

            for (var field in project) {
                if ({}.hasOwnProperty.call(project, field)) {
                    var regex = new RegExp("{{2} ?" + field + " ?}{2}", "g");
                    var value = project[field];
                    if (["date", "created_at", "updated_at"].includes(field)) {
                        if (value) {
                            value = shortDateFormat.format(new Date(value));
                        } else {
                            value = "-";
                        }
                    }

                    row = row.replace(regex, value);
                }
            }

            rows += row;
        }

        projectsListingPagination.innerHTML = "";

        var finalPage = Math.ceil(response._total_count / 10);
        for (var page = 1; page <= finalPage; page++) {
            projectsListingPagination.innerHTML += '<li class="pagination__item">' +
                '    <a class="pagination__item-link' + (page == currentPage ? ' active' : '') + '" href="/projects/' + page + '/" title="Link to Projects Page ' + page + '" data-page="' + page +'" tabindex="1">' + page + '</a>' +
                '</li>';
        }

        if (!response.data.length) {
            showProjectsListingFeedback(
                getFeedbackFromAPIResponse(response, "No projects found"),
                true
            );
        }

        projectsListing.querySelector(".table tbody").innerHTML = rows;
        projectsListing.classList.add("projects-select--active");
        loadingElem.classList.remove("fixed-overlay--active");
    };

    var getProjects = function(page) {
        page = page || 1;

        loadingElem.classList.add("fixed-overlay--active");

        projectsListingFeedbackElem.classList.remove("projects-select__feedback--active");

        makeAPIRequest({
            method: "GET",
            url: "/projects/",
            data: {
                page,
            },
            onSuccess: function (response) {
                onSuccessfulProjectsGet(response, page);
            },
            onError: function(response) {
                showProjectsListingFeedback(
                    getFeedbackFromAPIResponse(response, "Error getting projects."),
                    true
                );
            },
        });
    };

    var showProjectShowFeedback = function (feedback, isError) {
        projectShowFeedbackElem.innerHTML = feedback;

        if (isError) {
            projectShowFeedbackElem.parentElement.classList.remove("feedback--success");
            projectShowFeedbackElem.parentElement.classList.add("feedback--error");
        } else {
            projectShowFeedbackElem.parentElement.classList.add("feedback--success");
            projectShowFeedbackElem.parentElement.classList.remove("feedback--error");
        }

        projectShowFeedbackElem.parentElement.classList.remove("hide");
    };

    var onProjectFormSubmit = function(event) {
        event.preventDefault();

        loadingElem.classList.add("fixed-overlay--active");

        var isNameValid = jpi.helpers.checkInput(document.getElementById("project-name"));
        var isStatusValid = jpi.helpers.checkInput(document.getElementById("project-status"));
        var isTypeValid = jpi.helpers.checkInput(document.getElementById("project-type"));
        var isShortDescValid = jpi.helpers.checkInput(document.getElementById("project-short-desc"));
        var isLongDescValid = jpi.helpers.checkInput(document.getElementById("project-long-desc"));
        var isDateValid = (jpi.helpers.checkInput(document.getElementById("project-date")) && /\b[\d]{4}-[\d]{2}-[\d]{2}\b/im.test(document.getElementById("project-date").value));
        var isTagsValid = document.querySelectorAll(".js-project-view-tag").length > 0;

        if (isTagsValid) {
            document.querySelector(".project__tag-input").classList.add("valid");
            document.querySelector(".project__tag-input").classList.remove("invalid");
        }
        else {
            document.querySelector(".project__tag-input").classList.add("invalid");
            document.querySelector(".project__tag-input").classList.remove("valid");
        }

        if (
            !isNameValid ||
            !isStatusValid ||
            !isDateValid ||
            !isTypeValid ||
            !isTagsValid ||
            !isLongDescValid ||
            !isShortDescValid
        ) {
            showProjectShowFeedback("Fill in Required Inputs Fields.", true);

            var firstInvalidInput = document.querySelector(".project__form .invalid");
            var feedbackHeight = projectShowFeedbackElem.parentElement.offsetHeight;

            var label = document.querySelector("label[for=" + firstInvalidInput.getAttribute("id") + "]");

            var pos = label.getBoundingClientRect().top + window.scrollY - feedbackHeight - 16;

            window.scrollTo({top: pos, behavior: "smooth"});

            loadingElem.classList.remove("fixed-overlay--active");
            return;
        }

        var isUpdate = projectShowSelectedProjectID;

        var requestData = jpi.helpers.encodePayload({
            "name": document.getElementById("project-name").value,
            "type": document.getElementById("project-type").value,
            "status": document.getElementById("project-status").value,
            "date": document.getElementById("project-date").value,
            "url": document.getElementById("project-url").value,
            "github_url": document.getElementById("project-github-url").value,
            "download_url": document.getElementById("project-download-url").value,
            "colour": document.getElementById("project-colour").value,
            "short_description": document.getElementById("project-short-desc").value,
            "long_description": document.getElementById("project-long-desc").value,
        });

        document.querySelectorAll(".js-project-view-tag").forEach(function (elem) {
            requestData += "&" + jpi.helpers.encodePayload({"tags[]": elem.value});
        });

        document.querySelectorAll(".js-project-view-image").forEach(function (elem) {
            requestData += "&" + jpi.helpers.encodePayload({"images[]": elem.value});
        });

        makeAPIRequest({
            method: isUpdate ? "PUT" : "POST",
            url: isUpdate ? ("/projects/" + projectShowSelectedProjectID + "/") : "/projects/",
            data: requestData,
            onSuccess: function (response) {
                showProjectShowFeedback(
                    getFeedbackFromAPIResponse(response, "Successfully " + (isUpdate ? "updated" : "added") + " project"),
                );

                if (!isUpdate) {
                    history.pushState(null, null, "/project/edit/" + response.data.id + "/");
                }

                setUpProjectShow(response.data);
            },
            onError: function (response) {
                showProjectShowFeedback(
                    getFeedbackFromAPIResponse(response, "Error " + (isUpdate ? "updating" : "adding") + " project"),
                    true
                );

                loadingElem.classList.remove("fixed-overlay--active");
            },
        });
    };

    var renderProjectTag = function (project, tag) {
        projectShowTagsElem.innerHTML +=
            '<p class="project__tag project__tag--' + project.colour + '">' + tag +
            '   <input type="hidden" class="js-project-view-tag" name="project-tags" value="' + tag + '" />' +
            '   <button type="button" class="btn project__tag-delete-button" tab-index="1">x</button>' +
            '</p>';
    };

    var renderProjectImage = function (image) {
        var html = projectShowImageTemplate;

        for (var field in image) {
            if ({}.hasOwnProperty.call(image, field)) {
                var regex = new RegExp("{{2} ?" + field + " ?}{2}", "g");
                html = html.replace(regex, image[field]);
            }
        }

        projectShowImagesContainer.classList.add("project__images--active");
        projectShowImagesContainer.innerHTML += html;
    };

    var setUpProjectShow = function (project) {
        document.querySelector("#project-status").value = project ? project.status : "";
        document.querySelector("#project-colour").value = project ? project.colour : "";
        document.querySelector("#project-date").value = project ? project.date : "";
        document.querySelector(".js-project-created-at").innerHTML = project && project.created_at ? longDateFormat.format(new Date(project.created_at)) : "-";
        document.querySelector(".js-project-updated-at").innerHTML = project && project.updated_at ? longDateFormat.format(new Date(project.updated_at)) : "-";
        document.querySelector("#project-name").value = project ? project.name : "";
        document.querySelector("#project-type").value = project ? project.type : "";
        document.querySelector("#project-url").value = project ? project.url : "";
        document.querySelector("#project-github-url").value = project ? project.github_url : "";
        document.querySelector("#project-download-url").value = project ? project.download_url : "";
        document.querySelector("#project-short-desc").value = project ? project.short_description : "";
        document.querySelector("#project-long-desc").value = project ? project.long_description : "";

        tinymce.get("project-short-desc").setContent(project ? project.short_description : "");
        tinymce.get("project-long-desc").setContent(project ? project.long_description : "");

        projectShowImagesContainer.innerHTML = "";
        projectShowTagsElem.innerHTML = "";

        projectShowUploadedImages = [];
        projectShowUploadsContainer.innerHTML = "";

        if (project) {
            for (var i = 0; i < project.images.length; i++) {
                renderProjectImage(project.images[i]);
            }

            for (var j = 0; j < project.tags.length; j++) {
                renderProjectTag(project, project.tags[j]);
            }
        }

        if (projectShowImagesContainer.innerHTML === "") {
            projectShowImagesContainer.classList.remove("project__images--active");
        }

        document.querySelector(".project__save-button span").innerHTML = project ? "Update Project" : "Add Project";

        projectShowContainer.classList.add("project-view--active");
        loadingElem.classList.remove("fixed-overlay--active");
    };

    var showProject = function(projectID) {
        projectShowSelectedProjectID = projectID;

        loadingElem.classList.add("fixed-overlay--active");

        makeAPIRequest({
            method: "GET",
            url: "/projects/" + projectID + "/",
            onSuccess: function (response) {
                setUpProjectShow(response.data);
            },
            onError: function(response) {
                showProjectsListingFeedback(
                    getFeedbackFromAPIResponse(response, "Error getting project identified by '" + projectID + "'."),
                    true
                );

                history.pushState(null, null, "/projects/");
                router.run();
            },
        });
    };

    Sortable.create(projectShowTagsElem);
    Sortable.create(projectShowImagesContainer);

    var colourOptions = {
        "": "Default",
        "light-blue": "Light blue",
        "dark-blue": "Dark blue",
        "purple": "Purple",
        "pink": "Pink",
        "red": "Red",
        "orange": "Orange",
        "yellow": "Yellow",
        "light-green": "Light green",
        "lime-green": "Lime green",
        "dark-green": "Dark green",
        "grey": "Grey",
        "black": "Black",
    };

    var tinymceConfig = {
        branding: false,
        menubar: false,
        browser_spellcheck: true,
        baseURL: window.location.origin + "/assets/js/third-party/tinymce",
        plugins: "link code autoresize lists",
        width: "100%",
        max_height: 450,
        resize: true,
        toolbar: [
            "styleselect | bold italic underline strikethrough | bullist numlist | blockquote",
            "link unlink alignleft aligncenter alignright undo redo removeformat code",
        ],
        style_formats: [
            {
                title: "Headings",
                items: [
                    {title: "Heading 2", format: "h2"},
                    {title: "Heading 3", format: "h3"},
                    {title: "Heading 4", format: "h4"},
                    {title: "Heading 5", format: "h5"},
                    {title: "Heading 6", format: "h6"},
                ],
            },
            {
                title: "Paragraph", format: "p",
            },
            {
                title: "Other",
                items: [
                    {title: "Warning", inline: "span", classes: "notice"},
                ],
            },
        ],
        relative_urls: true,
        document_base_url: "https://jahidulpabelislam.com",
        convert_urls: false,
        link_title: false,
        rel_list: [
            {title: "Default", value: ""},
            {title: "Nofollow", value: "nofollow"},
        ],
        link_class_list: [
            {title: "None", value: ""},
            {title: "Project link", value: "link link--{{ colour }}"},
            {title: "Project button", value: "button button--{{ colour }}"},
        ],
    };

    for (var colour in colourOptions) {
        var colourName = colourOptions[colour];
        tinymceConfig.link_class_list.push({
            title: colourName + " link",
            value: "link link--" + colour,
        });
        tinymceConfig.link_class_list.push({
            title: colourName + " button",
            value: "button button--" + colour,
        });
    }

    ["project-short-desc", "project-long-desc"].forEach(function (tinymceId) {
        tinymce.init(Object.assign({}, tinymceConfig, {selector: "#" + tinymceId}));
    });

    var onFileAddEnd = function () {
        var feedbackHeight = projectShowFeedbackElem.parentElement.offsetHeight;

        var pos = projectShowUploadsContainer.firstElementChild.getBoundingClientRect().top + window.scrollY - feedbackHeight - 16;

        window.scrollTo({top: pos, behavior: "smooth"});

        loadingElem.classList.remove("fixed-overlay--active");
    };

    var onFileAddSuccess = function (file, image, isAllComplete) {
        var data = {
            url: image,
            name: file.name,
            file: file,
        };
        projectShowUploadedImages.push(data);

        var html = projectShowImageUploadSuccessTemplate;

        data["index"] = projectShowUploadedImages.length - 1;
        for (var field in data) {
            if ({}.hasOwnProperty.call(data, field)) {
                var regex = new RegExp("{{2} ?" + field + " ?}{2}", "g");
                html = html.replace(regex, data[field]);
            }
        }
        projectShowUploadsContainer.innerHTML += html;

        if (isAllComplete) {
            onFileAddEnd();
        }
    };

    var onFileAddError = function (error, isAllComplete) {
        projectShowUploadedImages.push({error});

        var html = projectShowImageUploadErrorTemplate;

        var regex = new RegExp("{{2} ?error ?}{2}", "g");
        html = html.replace(regex, error);

        projectShowUploadsContainer.innerHTML += html;

        if (isAllComplete) {
            onFileAddEnd();
        }
    };

    new jpi.DragNDrop(
        document.querySelector(".project__image-drop-zone"),
        {
            onDrop: function () {
                loadingElem.classList.add("fixed-overlay--active");
            },
            onFileAddSuccess,
            onFileAddError,
        }
    );

    document.querySelector(".project__image-upload").addEventListener("change", function () {
        loadingElem.classList.remove("fixed-overlay--active");

        var files = this.files;
        var count = files.length;

        var finishedCount = 0;

        for (var i = 0; i < count; i++) {
            var file = files[i];

            if (!file.type.includes("image/")) {
                onFileAddError(file.name + " isn't a image.");
                return;
            }

            var fileReader = new FileReader();
            fileReader.onload = function (event) {
                finishedCount++;
                onFileAddSuccess(file, event.target.result, finishedCount === count);
            };
            fileReader.onerror = function() {
                finishedCount++;
                onFileAddError("Error getting " + file.name, finishedCount === count);
            }
            fileReader.readAsDataURL(file);
        }
    });

    loginForm.addEventListener("submit", logIn);

    projectShowFormContainer.addEventListener("submit", onProjectFormSubmit);

    document.querySelectorAll(".js-link-projects").forEach(function (element) {
        element.addEventListener("click", function (event) {
            event.preventDefault();
            projectShowContainer.classList.remove("project-view--active");
            history.pushState(null, null, "/projects/");
            router.run();
        });
    });

    document.querySelector(".project__hide-error").addEventListener("click", function (event) {
        projectShowFeedbackElem.parentElement.classList.add("hide");
    });

    document.querySelector(".project__tag-add-button").addEventListener("click", function (event) {
        renderProjectTag({colour: document.querySelector("#project-colour").value}, document.querySelector(".project__tag-input").value)

        document.querySelector(".project__tag-input").value = ""; // Reset
    });

    document.querySelector(".js-link-new-project").addEventListener("click", function (event) {
        event.preventDefault();
        projectsListing.classList.remove("projects-select--active");
        history.pushState(null, null, "/project/edit/new/");
        router.run();
    });

    document.querySelector(".js-logout").addEventListener("click", function (event) {
        event.preventDefault();
        setJwt("");
        window.location = window.location;
    });

    window.addEventListener("click", function (event) {
        if (!event.target || !event.target.classList) {
            return;
        }

        if (event.target.classList.contains("pagination__item-link")) {
            event.preventDefault();
            var page = event.target.getAttribute("data-page");
            history.pushState(null, null, "/projects/" + (page != 1 ? page + "/" : ""));
            router.run();
            return;
        }

        if (event.target.classList.contains("projects-select__edit-button")) {
            event.preventDefault();
            projectsListing.classList.remove("projects-select--active");
            history.pushState(null, null, "/project/edit/" + event.target.getAttribute("data-id") + "/");
            router.run();
            return;
        }

        if (event.target.classList.contains("project__tag-delete-button")) {
            event.preventDefault();
            event.target.parentElement.remove();
            return;
        }

        if (event.target.classList.contains("projects-select__delete-button")) {
            loadingElem.classList.add("fixed-overlay--active");

            var projectID = event.target.getAttribute("data-id");

            makeAPIRequest({
                method: "DELETE",
                url: "/projects/" + projectID + "/",
                onSuccess: function (response) {
                    showProjectsListingFeedback(
                        getFeedbackFromAPIResponse(response, "Successfully deleted project identified by '" + projectID + "'.")
                    );

                    history.pushState(null, null, "/projects/");
                    router.run();
                },
                onError: function (response) {
                    showProjectsListingFeedback(
                        getFeedbackFromAPIResponse(response, "Error deleting project identified by '" + projectID + "'."),
                        true
                    );

                    loadingElem.classList.remove("fixed-overlay--active");
                },
            })

            return;
        }

        if (event.target.classList.contains("project__image-delete-button")) {
            loadingElem.classList.add("fixed-overlay--active");

            makeAPIRequest({
                method: "DELETE",
                url: "/projects/" + projectShowSelectedProjectID + "/images/" + event.target.getAttribute("data-id") + "/",
                data: form,
                onSuccess: function (response) {
                    event.target.parentElement.remove();

                    showProjectShowFeedback("Successfully deleted the project image");

                    loadingElem.classList.remove("fixed-overlay--active");
                },
                onError: function (response) {
                    var defaultFeedback = "Error deleting the project image";
                    showProjectShowFeedback(getFeedbackFromAPIResponse(response, defaultFeedback), true);

                    loadingElem.classList.remove("fixed-overlay--active");
                },
            })

            return;
        }

        if (event.target.classList.contains("js-project-image-upload-button")) {
            loadingElem.classList.add("fixed-overlay--active");

            var index = event.target.getAttribute("data-index");
            var form = new FormData();
            form.append("image", projectShowUploadedImages[index].file);

            makeAPIRequest({
                method: "POST",
                url: "/projects/" + projectShowSelectedProjectID + "/images/",
                data: form,
                onSuccess: function (response) {
                    event.target.closest(".project__upload").remove();

                    renderProjectImage(response.data);

                    showProjectShowFeedback("Successfully added a new project image");

                    loadingElem.classList.remove("fixed-overlay--active");
                },
                onError: function (response) {
                    var defaultFeedback = "Error uploading the project image";
                    showProjectShowFeedback(getFeedbackFromAPIResponse(response, defaultFeedback), true);

                    loadingElem.classList.remove("fixed-overlay--active");
                },
            });
            return;
        }
    });

    var router = jpi.Router({
        "/": getProjects,
        "/projects/": getProjects,
        "/projects/(.+)/": getProjects,
        "/project/edit/new/": function () {
            projectShowSelectedProjectID = undefined;

            loadingElem.classList.add("fixed-overlay--active");

            setUpProjectShow();
        },
        "/project/edit/(.+)/": showProject,
        "(.*)": function() {
            // Fallback - redirect to projects listing
            history.pushState(null, null, "/projects/");
            router.run();
        },
    });

    makeAPIRequest({
        method: "GET",
        url: "/auth/status/",
        onSuccess: function(response) {
            if (response.data) {
                nav.classList.add("nav--shown");
                router.run();
                return;
            }

            loginContainer.classList.add("fixed-overlay--active");
            loadingElem.classList.remove("fixed-overlay--active");
        },
        onError: function(response) {
            loginContainer.classList.add("fixed-overlay--active");
            loadingElem.classList.remove("fixed-overlay--active");
        },
    });
})(jpi);
