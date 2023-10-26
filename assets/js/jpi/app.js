window.jpi = window.jpi || {};

;(function(app) {

    "use strict";

    const loadingElem = document.querySelector(".js-loading");

    const loginContainer = document.querySelector(".login");
    const loginForm = document.querySelector(".login__form");
    const loginFeedbackElem = document.querySelector(".login__feedback");

    const nav = document.querySelector(".nav");

    const projectsListing = document.querySelector(".projects-select");
    const projectsListingFeedbackElem = document.querySelector(".projects-select__feedback");
    const projectsListingPagination = document.querySelector(".pagination");

    const searchInput = document.querySelector(".js-filters-search");
    const typeInput = document.querySelector(".js-filters-type");
    const publishedCheckbox = document.querySelector(".js-filters-published");
    const dateInput = document.querySelector(".js-filters-date");

    const projectsListingRowTemplate = document.querySelector("#js-projects-table-row").innerHTML;

    const projectEditContainer = document.querySelector(".project-edit");
    const projectEditFormContainer = document.querySelector(".project-edit__form");
    const projectEditFeedbackElem = document.querySelector(".project-edit__feedback span");
    const projectEditTagsElem = document.querySelector(".js-project-edit-tags");

    const projectEditImagesContainer = document.querySelector(".project-edit__images");
    const projectEditImageTemplate = document.querySelector("#js-project-edit-image-template").innerHTML;

    const projectEditUploadsContainer = document.querySelector(".project-edit__uploads");
    let projectEditUploadedImages = [];

    const projectEditImageUploadSuccessTemplate = document.querySelector("#js-project-edit-image-upload-success-template").innerHTML;
    const projectEditImageUploadErrorTemplate = document.querySelector("#js-project-edit-image-upload-error-template").innerHTML;

    let projectEditSelectedProjectID;

    const projectsNavLink = document.querySelector(".js-link-projects");
    const newProjectNavLink = document.querySelector(".js-link-new-project");

    const shortDateFormat = new Intl.DateTimeFormat("en-GB", {
        month: "long",
        year: "numeric",
    });

    const longDateFormat = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    });

    let jwt;
    const jwtStorageKey = "cmsJwt";

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

    const onSuccessfulLogIn = function(response) {
        setJwt(response.data);

        loginContainer.classList.remove("fixed-overlay--active");
        nav.classList.add("nav--shown");

        router.run();
    };

    const logIn = function(event) {
        event.preventDefault();

        const usernameElem = document.querySelector("#username");
        const passwordElem = document.querySelector("#password");

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
                onSuccess: onSuccessfulLogIn,
                onError: function(response) {
                    loginFeedbackElem.innerHTML = getFeedbackFromAPIResponse(response, "Error logging you in.");
                    loginFeedbackElem.classList.add("login__feedback--active");
                },
            });
            return;
        }

        if (!isUsernameValid && !isPasswordValid) {
            const message = "Username and password fields needs to be filled.";
        }
        else if (!isUsernameValid) {
            const message = "Username field needs to be filled.";
        }
        else {
            const message = "Password field needs to be filled.";
        }

        loginFeedbackElem.innerHTML = message;
        loginFeedbackElem.classList.add("login__feedback--active");
    };

    const showProjectsListingFeedback = function (feedback, isError) {
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

    const onSuccessfulProjectsGet = function (response, currentPage) {
        let rows = "";
        for (let i = 0; i < response.data.length; i++) {
            const project = response.data[i];

            let row = projectsListingRowTemplate;

            for (const field in project) {
                if ({}.hasOwnProperty.call(project, field)) {
                    const regex = new RegExp("{{2} ?" + field + " ?}{2}", "g");
                    let value = project[field];

                    if (field === "status") {
                        value = value === "published" ? "Yes" : "No";
                    }
                    else if (["date", "created_at", "updated_at"].includes(field)) {
                        if (value) {
                            value = shortDateFormat.format(new Date(value));
                        }
                    }

                    value = value ? value : "-";

                    row = row.replace(regex, value);
                }
            }

            rows += row;
        }

        projectsListingPagination.innerHTML = "";

        const finalPage = Math.ceil(response._total_count / 10);
        for (let page = 1; page <= finalPage; page++) {
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

    const getProjects = function(page) {
        page = page || 1;

        loadingElem.classList.add("fixed-overlay--active");

        projectEditContainer.classList.remove("project-edit--active");

        projectsNavLink.classList.add("nav__link--active");
        newProjectNavLink.classList.remove("nav__link--active");

        projectsListingFeedbackElem.classList.remove("projects-select__feedback--active");

        const data = {
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

    const addOffsetToProjectEditSidebar = function () {
        let offset = 20;

        offset += document.querySelector(".project-edit__header").clientHeight;

        const sidebar = document.querySelector(".project-edit__sidebar");

        sidebar.style.top = offset + "px";
    }

    const showProjectEditFeedback = function (feedback, isError) {
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

    const onProjectFormSubmit = function(event) {
        event.preventDefault();

        loadingElem.classList.add("fixed-overlay--active");

        const isNameValid = jpi.helpers.checkInput(document.getElementById("project-name"));
        const isTypeValid = jpi.helpers.checkInput(document.getElementById("project-type"));
        const isShortDescValid = jpi.helpers.checkInput(document.getElementById("project-short-desc"));
        const isLongDescValid = jpi.helpers.checkInput(document.getElementById("project-long-desc"));
        const isDateValid = (jpi.helpers.checkInput(document.getElementById("project-date")) && /\b[\d]{4}-[\d]{2}-[\d]{2}\b/im.test(document.getElementById("project-date").value));
        const isTagsValid = document.querySelectorAll(".js-project-edit-tag").length > 0;

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

            const firstInvalidInput = document.querySelector(".project-edit__form .invalid");
            const feedbackHeight = projectEditFeedbackElem.parentElement.offsetHeight;

            const label = document.querySelector("label[for=" + firstInvalidInput.getAttribute("id") + "]");

            const pos = label.getBoundingClientRect().top + window.scrollY - feedbackHeight - 16;

            window.scrollTo({top: pos, behavior: "smooth"});

            loadingElem.classList.remove("fixed-overlay--active");
            return;
        }

        const isUpdate = projectEditSelectedProjectID;

        const requestData = {
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

    const renderProjectTag = function (tag) {
        projectEditTagsElem.innerHTML +=
            '<p class="project-edit__tag"><span>' + tag +
            '</span>   <input type="hidden" class="js-project-edit-tag" name="project-tags" value="' + tag + '" />' +
            '   <button type="button" class="btn project-edit__tag-delete-button" tab-index="1">x</button>' +
            '</p>';
    };

    const renderProjectImage = function (image) {
        let html = projectEditImageTemplate;

        for (const field in image) {
            if ({}.hasOwnProperty.call(image, field)) {
                const regex = new RegExp("{{2} ?" + field + " ?}{2}", "g");
                html = html.replace(regex, image[field]);
            }
        }

        projectEditImagesContainer.innerHTML += html;
    };

    const setUpProjectEdit = function (project) {
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
            for (let i = 0; i < project.images.length; i++) {
                renderProjectImage(project.images[i]);
            }

            for (let j = 0; j < project.tags.length; j++) {
                renderProjectTag(project.tags[j]);
            }
        }

        document.querySelector(".project-edit__save-button span").innerHTML = project ? "Save" : "Create";

        projectEditContainer.classList.add("project-edit--active");
        loadingElem.classList.remove("fixed-overlay--active");

        addOffsetToProjectEditSidebar();
    };

    const showProjectEdit = function(projectID) {
        projectEditSelectedProjectID = projectID;

        loadingElem.classList.add("fixed-overlay--active");

        projectsListing.classList.remove("projects-select--active");

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

    const colourOptions = {
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

    const tinymceConfig = {
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

    for (const colour in colourOptions) {
        const colourName = colourOptions[colour];
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

    const onFileAddEnd = function () {
        const feedbackHeight = projectEditFeedbackElem.parentElement.offsetHeight;

        const pos = projectEditUploadsContainer.firstElementChild.getBoundingClientRect().top + window.scrollY - feedbackHeight - 16;

        window.scrollTo({top: pos, behavior: "smooth"});

        loadingElem.classList.remove("fixed-overlay--active");
    };

    const onFileAddSuccess = function (file, image, isAllComplete) {
        const data = {
            url: image,
            name: file.name,
            file: file,
        };
        projectEditUploadedImages.push(data);

        let html = projectEditImageUploadSuccessTemplate;

        data["index"] = projectEditUploadedImages.length - 1;
        for (const field in data) {
            if ({}.hasOwnProperty.call(data, field)) {
                const regex = new RegExp("{{2} ?" + field + " ?}{2}", "g");
                html = html.replace(regex, data[field]);
            }
        }
        projectEditUploadsContainer.innerHTML += html;

        if (isAllComplete) {
            onFileAddEnd();
        }
    };

    const onFileAddError = function (error, isAllComplete) {
        projectEditUploadedImages.push({error});

        let html = projectEditImageUploadErrorTemplate;

        const regex = new RegExp("{{2} ?error ?}{2}", "g");
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

        const files = this.files;
        const count = files.length;

        let finishedCount = 0;

        for (let i = 0; i < count; i++) {
            const file = files[i];

            if (!file.type.includes("image/")) {
                onFileAddError(file.name + " isn't a image.");
                return;
            }

            const fileReader = new FileReader();
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
        const tag = document.querySelector(".project-edit__tag-input").value;
        if (tag) {
            renderProjectTag(tag);
        }

        document.querySelector(".project-edit__tag-input").value = ""; // Reset
    });

    document.querySelector(".js-link-new-project").addEventListener("click", function (event) {
        event.preventDefault();
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
            const page = event.target.getAttribute("data-page");
            history.pushState(null, null, "/projects/" + (page != 1 ? page + "/" : ""));
            router.run();
            return;
        }

        if (event.target.classList.contains("projects-select__edit-button")) {
            event.preventDefault();
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

            const projectID = event.target.getAttribute("data-id");

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
                    const defaultFeedback = "Error deleting the project image";
                    showProjectEditFeedback(getFeedbackFromAPIResponse(response, defaultFeedback), true);

                    loadingElem.classList.remove("fixed-overlay--active");
                },
            })

            return;
        }

        if (event.target.classList.contains("js-project-image-upload-button")) {
            loadingElem.classList.add("fixed-overlay--active");

            const index = event.target.getAttribute("data-index");
            const form = new FormData();
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

    const router = jpi.Router({
        "/": getProjects,
        "/projects/": getProjects,
        "/projects/(.+)/": getProjects,
        "/project/edit/new/": function () {
            loadingElem.classList.add("fixed-overlay--active");

            projectsListing.classList.remove("projects-select--active");

            projectsNavLink.classList.remove("nav__link--active");
            newProjectNavLink.classList.add("nav__link--active");

            projectEditSelectedProjectID = undefined;

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
