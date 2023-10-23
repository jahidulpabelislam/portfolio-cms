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

    var searchInput = document.querySelector(".js-filters-search");
    var typeInput = document.querySelector(".js-filters-type");
    var publishedCheckbox = document.querySelector(".js-filters-published");
    var dateInput = document.querySelector(".js-filters-date");

    var projectsListingRowTemplate = document.querySelector("#js-projects-table-row").innerHTML;

    var projectEditContainer = document.querySelector(".project-edit");
    var projectEditFormContainer = document.querySelector(".project-edit__form");
    var projectEditFeedbackElem = document.querySelector(".project-edit__feedback span");
    var projectEditTagsElem = document.querySelector(".js-project-edit-tags");

    var projectEditImagesContainer = document.querySelector(".project-edit__images");
    var projectEditImageTemplate = document.querySelector("#js-project-edit-image-template").innerHTML;

    var projectEditUploadsContainer = document.querySelector(".project-edit__uploads");
    var projectEditUploadedImages = [];

    var projectEditImageUploadSuccessTemplate = document.querySelector("#js-project-edit-image-upload-success-template").innerHTML;
    var projectEditImageUploadErrorTemplate = document.querySelector("#js-project-edit-image-upload-error-template").innerHTML;

    var projectEditSelectedProjectID;

    var projectsNavLink = document.querySelector(".js-link-projects");
    var newProjectNavLink = document.querySelector(".js-link-new-project");

    var shortDateFormat = new Intl.DateTimeFormat("en-GB", {
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

                    if (field === "status") {
                        value = value === "published" ? "Yes" : "No";
                    }
                    else if (["date", "created_at", "updated_at"].includes(field)) {
                        if (value) {
                            value = shortDateFormat.format(new Date(value));
                        }
                    }

                    value  = value ? value : "-";

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

        projectsNavLink.classList.add("nav__link--active");
        newProjectNavLink.classList.remove("nav__link--active");

        projectsListingFeedbackElem.classList.remove("projects-select__feedback--active");

        var data = {
            page: page,
            search: searchInput.value,
        };

        if (typeInput.value !== "") {
            data["filters[type_id]"] = typeInput.value;
        }

        if (dateInput.value !== "") {
            data["filters[date]"] = dateInput.value;
        }

        if (publishedCheckbox.checked) {
            data["filters[status]"] = "published";
        }

        makeAPIRequest({
            method: "GET",
            url: "/projects/",
            data: data,
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

    var addOffsetToProjectEditSidebar = function () {
        var offset = 20;

        offset += document.querySelector(".project-edit__header").clientHeight;

        var sidebar = document.querySelector(".project-edit__sidebar");

        sidebar.style.top = offset + "px";
    }

    var showProjectEditFeedback = function (feedback, isError) {
        projectEditFeedbackElem.innerHTML = feedback;

        if (isError) {
            projectEditFeedbackElem.parentElement.classList.remove("feedback--success");
            projectEditFeedbackElem.parentElement.classList.add("feedback--error");
        } else {
            projectEditFeedbackElem.parentElement.classList.add("feedback--success");
            projectEditFeedbackElem.parentElement.classList.remove("feedback--error");
        }

        projectEditFeedbackElem.parentElement.classList.remove("hide");
    };

    var onProjectFormSubmit = function(event) {
        event.preventDefault();

        loadingElem.classList.add("fixed-overlay--active");

        var isNameValid = jpi.helpers.checkInput(document.getElementById("project-name"));
        var isTypeValid = jpi.helpers.checkInput(document.getElementById("project-type"));
        var isShortDescValid = jpi.helpers.checkInput(document.getElementById("project-short-desc"));
        var isLongDescValid = jpi.helpers.checkInput(document.getElementById("project-long-desc"));
        var isDateValid = (jpi.helpers.checkInput(document.getElementById("project-date")) && /\b[\d]{4}-[\d]{2}-[\d]{2}\b/im.test(document.getElementById("project-date").value));
        var isTagsValid = document.querySelectorAll(".js-project-edit-tag").length > 0;

        if (isTagsValid) {
            document.querySelector(".project-edit__tag-input").classList.remove("invalid");
        }
        else {
            document.querySelector(".project-edit__tag-input").classList.add("invalid");
        }

        if (
            !isNameValid ||
            !isDateValid ||
            !isTypeValid ||
            !isTagsValid ||
            !isLongDescValid ||
            !isShortDescValid
        ) {
            showProjectEditFeedback("Fill in Required Inputs Fields.", true);

            var firstInvalidInput = document.querySelector(".project-edit__form .invalid");
            var feedbackHeight = projectEditFeedbackElem.parentElement.offsetHeight;

            var label = document.querySelector("label[for=" + firstInvalidInput.getAttribute("id") + "]");

            var pos = label.getBoundingClientRect().top + window.scrollY - feedbackHeight - 16;

            window.scrollTo({top: pos, behavior: "smooth"});

            loadingElem.classList.remove("fixed-overlay--active");
            return;
        }

        var isUpdate = projectEditSelectedProjectID;

        var requestData = {
            "name": document.getElementById("project-name").value,
            "type": document.getElementById("project-type").value,
            "status": document.getElementById("project-is-published").checked ? "published" : "draft",
            "date": document.getElementById("project-date").value,
            "url": document.getElementById("project-url").value,
            "github_url": document.getElementById("project-github-url").value,
            "download_url": document.getElementById("project-download-url").value,
            "colour": document.getElementById("project-colour").value,
            "short_description": document.getElementById("project-short-desc").value,
            "long_description": document.getElementById("project-long-desc").value,
            "tags": [],
            "images": [],
        };

        document.querySelectorAll(".js-project-edit-tag").forEach(function (elem) {
            requestData.tags.push(elem.value);
        });

        document.querySelectorAll(".js-project-edit-image").forEach(function (elem) {
            requestData.images.push(elem.value);
        });

        makeAPIRequest({
            method: isUpdate ? "PUT" : "POST",
            url: isUpdate ? ("/projects/" + projectEditSelectedProjectID + "/") : "/projects/",
            data: requestData,
            onSuccess: function (response) {
                showProjectEditFeedback(
                    getFeedbackFromAPIResponse(response, "Successfully " + (isUpdate ? "updated" : "added") + " project"),
                );

                if (!isUpdate) {
                    history.pushState(null, null, "/project/edit/" + response.data.id + "/");
                }

                setUpProjectEdit(response.data);
            },
            onError: function (response) {
                showProjectEditFeedback(
                    getFeedbackFromAPIResponse(response, "Error " + (isUpdate ? "updating" : "adding") + " project"),
                    true
                );

                loadingElem.classList.remove("fixed-overlay--active");
            },
        });
    };

    var renderProjectTag = function (tag) {
        projectEditTagsElem.innerHTML +=
            '<p class="project-edit__tag"><span>' + tag +
            '</span>   <input type="hidden" class="js-project-edit-tag" name="project-tags" value="' + tag + '" />' +
            '   <button type="button" class="btn project-edit__tag-delete-button" tab-index="1">x</button>' +
            '</p>';
    };

    var renderProjectImage = function (image) {
        var html = projectEditImageTemplate;

        for (var field in image) {
            if ({}.hasOwnProperty.call(image, field)) {
                var regex = new RegExp("{{2} ?" + field + " ?}{2}", "g");
                html = html.replace(regex, image[field]);
            }
        }

        projectEditImagesContainer.innerHTML += html;
    };

    var setUpProjectEdit = function (project) {
        document.querySelector("#project-is-published").checked = project ? (project.status === "published") : false;
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

        projectEditImagesContainer.innerHTML = "";
        projectEditTagsElem.innerHTML = "";

        projectEditUploadedImages = [];
        projectEditUploadsContainer.innerHTML = "";
        if (project) {
            for (var i = 0; i < project.images.length; i++) {
                renderProjectImage(project.images[i]);
            }

            for (var j = 0; j < project.tags.length; j++) {
                renderProjectTag(project.tags[j]);
            }
        }

        document.querySelector(".project-edit__save-button span").innerHTML = project ? "Save" : "Create";

        projectEditContainer.classList.add("project-edit--active");
        loadingElem.classList.remove("fixed-overlay--active");

        addOffsetToProjectEditSidebar();
    };

    var showProjectEdit = function(projectID) {
        projectEditSelectedProjectID = projectID;

        loadingElem.classList.add("fixed-overlay--active");

        projectsNavLink.classList.remove("nav__link--active");
        newProjectNavLink.classList.remove("nav__link--active");

        makeAPIRequest({
            method: "GET",
            url: "/projects/" + projectID + "/",
            onSuccess: function (response) {
                setUpProjectEdit(response.data);
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

    Sortable.create(projectEditTagsElem);
    Sortable.create(projectEditImagesContainer);

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
        var feedbackHeight = projectEditFeedbackElem.parentElement.offsetHeight;

        var pos = projectEditUploadsContainer.firstElementChild.getBoundingClientRect().top + window.scrollY - feedbackHeight - 16;

        window.scrollTo({top: pos, behavior: "smooth"});

        loadingElem.classList.remove("fixed-overlay--active");
    };

    var onFileAddSuccess = function (file, image, isAllComplete) {
        var data = {
            url: image,
            name: file.name,
            file: file,
        };
        projectEditUploadedImages.push(data);

        var html = projectEditImageUploadSuccessTemplate;

        data["index"] = projectEditUploadedImages.length - 1;
        for (var field in data) {
            if ({}.hasOwnProperty.call(data, field)) {
                var regex = new RegExp("{{2} ?" + field + " ?}{2}", "g");
                html = html.replace(regex, data[field]);
            }
        }
        projectEditUploadsContainer.innerHTML += html;

        if (isAllComplete) {
            onFileAddEnd();
        }
    };

    var onFileAddError = function (error, isAllComplete) {
        projectEditUploadedImages.push({error});

        var html = projectEditImageUploadErrorTemplate;

        var regex = new RegExp("{{2} ?error ?}{2}", "g");
        html = html.replace(regex, error);

        projectEditUploadsContainer.innerHTML += html;

        if (isAllComplete) {
            onFileAddEnd();
        }
    };

    new jpi.DragNDrop(
        document.querySelector(".project-edit__image-drop-zone"),
        {
            onDrop: function () {
                loadingElem.classList.add("fixed-overlay--active");
            },
            onFileAddSuccess,
            onFileAddError,
        }
    );

    document.querySelector(".project-edit__image-upload").addEventListener("change", function () {
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

    projectEditFormContainer.addEventListener("submit", onProjectFormSubmit);

    document.querySelectorAll(".js-link-projects").forEach(function (element) {
        element.addEventListener("click", function (event) {
            event.preventDefault();
            projectEditContainer.classList.remove("project-edit--active");
            history.pushState(null, null, "/projects/");
            router.run();
        });
    });

    document.querySelectorAll(".project-edit__tabs-bar-item").forEach(function (element, i) {
        element.addEventListener("click", function (event) {
            document.querySelector(".project-edit__tabs-content--active").classList.remove("project-edit__tabs-content--active");
            document.querySelectorAll(".project-edit__tabs-content")[i].classList.add("project-edit__tabs-content--active");
            document.querySelector(".project-edit__tabs-bar-item--active").classList.remove("project-edit__tabs-bar-item--active");
            element.classList.add("project-edit__tabs-bar-item--active");
        });
    });

    document.querySelectorAll(".js-filters-on-change").forEach(function (element) {
        element.addEventListener("change", function (event) {
            history.pushState(null, null, "/projects/");
            router.run();
        });
    });

    searchInput.addEventListener("keyup", function (event) {
        history.pushState(null, null, "/projects/");
        router.run();
    });

    document.querySelector(".project-edit__hide-error").addEventListener("click", function (event) {
        projectEditFeedbackElem.parentElement.classList.add("hide");
    });

    document.querySelector(".project-edit__tag-add-button").addEventListener("click", function (event) {
        var tag = document.querySelector(".project-edit__tag-input").value;
        if (tag) {
            renderProjectTag(tag);
        }

        document.querySelector(".project-edit__tag-input").value = ""; // Reset
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

    window.addEventListener("mouseover", function (event) {
        if (event.target.classList.contains("project-edit__tag-delete-button")) {
            event.target.parentElement.classList.add("project-edit__tag--to-delete");
        }
    });

    window.addEventListener("mouseout", function (event) {
        if (event.target.classList.contains("project-edit__tag-delete-button")) {
            event.target.parentElement.classList.remove("project-edit__tag--to-delete");
        }
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

        if (event.target.classList.contains("project-edit__tag-delete-button")) {
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

        if (event.target.classList.contains("project-edit__image-delete-button")) {
            loadingElem.classList.add("fixed-overlay--active");

            makeAPIRequest({
                method: "DELETE",
                url: "/projects/" + projectEditSelectedProjectID + "/images/" + event.target.getAttribute("data-id") + "/",
                onSuccess: function (response) {
                    event.target.parentElement.remove();

                    showProjectEditFeedback("Successfully deleted the project image");

                    loadingElem.classList.remove("fixed-overlay--active");
                },
                onError: function (response) {
                    var defaultFeedback = "Error deleting the project image";
                    showProjectEditFeedback(getFeedbackFromAPIResponse(response, defaultFeedback), true);

                    loadingElem.classList.remove("fixed-overlay--active");
                },
            })

            return;
        }

        if (event.target.classList.contains("js-project-image-upload-button")) {
            loadingElem.classList.add("fixed-overlay--active");

            var index = event.target.getAttribute("data-index");
            var form = new FormData();
            form.append("image", projectEditUploadedImages[index].file);

            makeAPIRequest({
                method: "POST",
                url: "/projects/" + projectEditSelectedProjectID + "/images/",
                data: form,
                onSuccess: function (response) {
                    event.target.closest(".project-edit__image-container").remove();

                    renderProjectImage(response.data);

                    showProjectEditFeedback("Successfully added a new project image");

                    loadingElem.classList.remove("fixed-overlay--active");
                },
                onError: function (response) {
                    var defaultFeedback = "Error uploading the project image";
                    showProjectEditFeedback(getFeedbackFromAPIResponse(response, defaultFeedback), true);

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
            projectsNavLink.classList.remove("nav__link--active");
            newProjectNavLink.classList.add("nav__link--active");

            projectEditSelectedProjectID = undefined;

            loadingElem.classList.add("fixed-overlay--active");

            setUpProjectEdit();
        },
        "/project/edit/(.+)/": showProjectEdit,
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
