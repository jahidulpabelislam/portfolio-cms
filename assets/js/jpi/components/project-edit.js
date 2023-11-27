window.jpi = window.jpi || {};
window.jpi.ProjectEdit = function() {

    "use strict";

    const app = window.jpi;

    const container = document.querySelector(".project-edit");

    const form = document.querySelector(".project-edit__form");

    const header = document.querySelector(".project-edit__header");
    const sidebar = document.querySelector(".project-edit__sidebar");

    const feedbackElem = document.querySelector(".project-edit__feedback span");

    const tagsContainer = document.querySelector(".js-project-edit-tags");
    const tagInput = document.querySelector(".project-edit__tag-input");

    const tabs = document.querySelectorAll(".project-edit__tabs-content");

    const publishedCheckbox = document.querySelector("#project-is-published");
    const colourInput = document.querySelector("#project-colour");
    const dateInput = document.querySelector("#project-date");
    const createdInput = document.querySelector(".js-project-created-at");
    const updatedInput = document.querySelector(".js-project-updated-at");
    const nameInput = document.querySelector("#project-name");
    const typeInput = document.querySelector("#project-type");
    const urlInput = document.querySelector("#project-url");
    const githubInput = document.querySelector("#project-github-url");
    const downloadInput = document.querySelector("#project-download-url");
    const shortDescInput = document.querySelector("#project-short-desc");
    const longDescInput = document.querySelector("#project-long-desc");

    const imagesContainer = document.querySelector(".project-edit__images");
    const imageTemplate = document.querySelector("#js-project-edit-image-template").innerHTML;

    const uploadsContainer = document.querySelector(".project-edit__uploads");

    let uploadedImages = [];

    const successfulImageUploadTemplate = document.querySelector("#js-project-edit-image-upload-success-template").innerHTML;
    const failedImageUploadTemplate = document.querySelector("#js-project-edit-image-upload-error-template").innerHTML;

    let selectedProjectID;

    const showFeedback = function (feedback, isError) {
        feedbackElem.innerHTML = feedback;
        feedbackElem.parentElement.classList.toggle("feedback--success", !isError);
        feedbackElem.parentElement.classList.toggle("feedback--error", isError);
        feedbackElem.parentElement.classList.remove("hide");
    };

    const onSubmit = function(event) {
        event.preventDefault();

        app.showLoading();

        const tags = document.querySelectorAll(".js-project-edit-tag");

        app.helpers.checkInput(nameInput);
        app.helpers.checkInput(typeInput);

        dateInput.classList.toggle("invalid", dateInput.value === "" || !/\b[\d]{4}-[\d]{2}-[\d]{2}\b/im.test(dateInput.value));

        tagInput.classList.toggle("invalid", tags.length === 0);

        [shortDescInput, longDescInput].forEach(function (elem) {
            tinymce.get(elem.getAttribute("id")).container.classList.toggle("invalid", elem.value === "");
        });

        const firstInvalidInput = form.querySelector(".invalid");

        if (firstInvalidInput) {
            showFeedback("Fill in Required Inputs Fields.", true);

            const feedbackHeight = feedbackElem.parentElement.offsetHeight;

            const label = document.querySelector("label[for=" + firstInvalidInput.getAttribute("id") + "]");

            const pos = label.getBoundingClientRect().top + window.scrollY - feedbackHeight - 16;

            window.scrollTo({top: pos, behavior: "smooth"});

            app.hideLoading();
            return;
        }

        const isUpdate = selectedProjectID;

        const requestData = {
            "name": nameInput.value,
            "type": typeInput.value,
            "status": publishedCheckbox.checked ? "published" : "draft",
            "date": dateInput.value,
            "url": urlInput.value,
            "github_url": githubInput.value,
            "download_url": downloadInput.value,
            "colour": colourInput.value,
            "short_description": shortDescInput.value,
            "long_description": longDescInput.value,
            "tags": [],
            "images": [],
        };

        tags.forEach(function (elem) {
            requestData.tags.push(elem.value);
        });

        document.querySelectorAll(".js-project-edit-image").forEach(function (elem) {
            requestData.images.push(elem.value);
        });

        app.makeAPIRequest({
            method: isUpdate ? "PUT" : "POST",
            url: isUpdate ? ("/projects/" + selectedProjectID + "/") : "/projects/",
            data: requestData,
            onSuccess: function (response) {
                showFeedback(
                    app.getFeedbackFromAPIResponse(response, "Successfully " + (isUpdate ? "updated" : "added") + " project"),
                );

                if (!isUpdate) {
                    history.pushState(null, null, "/project/edit/" + response.data.id + "/");
                }

                show(response.data);
            },
            onError: function (response) {
                showFeedback(
                    app.getFeedbackFromAPIResponse(response, "Error " + (isUpdate ? "updating" : "adding") + " project"),
                    true
                );

                app.hideLoading();
            },
        });
    };

    const renderTag = function (tag) {
        tagsContainer.innerHTML +=
            '<p class="project-edit__tag"><span>' + tag +
            '</span>   <input type="hidden" class="js-project-edit-tag" name="project-tags" value="' + tag + '" />' +
            '   <button type="button" class="btn project-edit__tag-delete-button">x</button>' +
            '</p>';
    };

    const renderImage = function (image) {
        let html = imageTemplate;

        for (const field in image) {
            if ({}.hasOwnProperty.call(image, field)) {
                const regex = new RegExp("{{2} ?" + field + " ?}{2}", "g");
                html = html.replace(regex, image[field]);
            }
        }

        imagesContainer.innerHTML += html;
    };

    const show = function (project) {
        selectedProjectID = project ? project.id : undefined;

        publishedCheckbox.checked = project ? (project.status === "published") : false;
        colourInput.value = project ? project.colour : "";
        dateInput.value = project ? project.date : "";
        createdInput.innerHTML = project && project.created_at ? app.longDateFormat.format(new Date(project.created_at)) : "-";
        updatedInput.innerHTML = project && project.updated_at ? app.longDateFormat.format(new Date(project.updated_at)) : "-";
        nameInput.value = project ? project.name : "";
        typeInput.value = project ? project.type : "";
        urlInput.value = project ? project.url : "";
        githubInput.value = project ? project.github_url : "";
        downloadInput.value = project ? project.download_url : "";
        shortDescInput.value = project ? project.short_description : "";
        longDescInput.value = project ? project.long_description : "";

        tinymce.get("project-short-desc").setContent(project ? project.short_description : "");
        tinymce.get("project-long-desc").setContent(project ? project.long_description : "");

        imagesContainer.innerHTML = "";
        tagsContainer.innerHTML = "";

        uploadedImages = [];
        uploadsContainer.innerHTML = "";
        if (project) {
            for (let i = 0; i < project.images.length; i++) {
                renderImage(project.images[i]);
            }

            for (let j = 0; j < project.tags.length; j++) {
                renderTag(project.tags[j]);
            }
        }

        document.querySelector(".project-edit__save-button span").innerHTML = project ? "Save" : "Create";

        container.classList.add("project-edit--active");
        app.hideLoading();

        sidebar.style.top = header.clientHeight + 20 + "px";
    };

    const load = function(projectID) {
        app.showLoading();

        app.makeAPIRequest({
            method: "GET",
            url: "/projects/" + projectID + "/",
            onSuccess: function (response) {
                app.activateLink("");
                show(response.data);
            },
            onError: function(response) {
                app.projectsListing.showFeedback(
                    app.getFeedbackFromAPIResponse(response, "Error getting project identified by '" + projectID + "'."),
                    true
                );

                app.router.changeTo("/projects/");
            },
        });
    };

    const onFileAddEnd = function () {
        const feedbackHeight = feedbackElem.parentElement.offsetHeight;

        window.scrollTo({
            top: uploadsContainer.firstElementChild.getBoundingClientRect().top + window.scrollY - feedbackHeight - 16,
            behavior: "smooth"
        });

        app.hideLoading();
    };

    const onFileAddSuccess = function (file, image, isAllComplete) {
        const data = {
            url: image,
            name: file.name,
            file: file,
        };
        uploadedImages.push(data);

        let html = successfulImageUploadTemplate;

        data["index"] = uploadedImages.length - 1;
        for (const field in data) {
            if ({}.hasOwnProperty.call(data, field)) {
                const regex = new RegExp("{{2} ?" + field + " ?}{2}", "g");
                html = html.replace(regex, data[field]);
            }
        }
        uploadsContainer.innerHTML += html;

        if (isAllComplete) {
            onFileAddEnd();
        }
    };

    const onFileAddError = function (error, isAllComplete) {
        uploadedImages.push({error});

        let html = failedImageUploadTemplate;

        const regex = new RegExp("{{2} ?error ?}{2}", "g");
        html = html.replace(regex, error);

        uploadsContainer.innerHTML += html;

        if (isAllComplete) {
            onFileAddEnd();
        }
    };

    document.querySelector(".project-edit__image-upload").addEventListener("change", function () {
        app.hideLoading();

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
            };
            fileReader.readAsDataURL(file);
        }
    });

    form.addEventListener("submit", onSubmit);

    document.querySelectorAll(".js-link-projects").forEach(function (element) {
        element.addEventListener("click", function (event) {
            event.preventDefault();
            app.router.changeTo("/projects/");
        });
    });

    document.querySelectorAll(".project-edit__tabs-bar-item").forEach(function (element, i) {
        element.addEventListener("click", function (event) {
            document.querySelector(".project-edit__tabs-content--active").classList.remove("project-edit__tabs-content--active");
            tabs[i].classList.add("project-edit__tabs-content--active");
            document.querySelector(".project-edit__tabs-bar-item--active").classList.remove("project-edit__tabs-bar-item--active");
            element.classList.add("project-edit__tabs-bar-item--active");
        });
    });

    document.querySelector(".project-edit__hide-error").addEventListener("click", function (event) {
        feedbackElem.parentElement.classList.add("hide");
    });

    document.querySelector(".project-edit__tag-add-button").addEventListener("click", function (event) {
        const tag = tagInput.value;
        if (tag) {
            renderTag(tag);
        }

        tagInput.value = ""; // Reset
    });

    app.helpers.delegate(window, "project-edit__tag-delete-button", "mouseover", function (event) {
        event.target.parentElement.classList.add("project-edit__tag--to-delete");
    });

    app.helpers.delegate(window, "project-edit__tag-delete-button", "mouseout", function (event) {
        event.target.parentElement.classList.remove("project-edit__tag--to-delete");
    });

    app.helpers.delegate(window, "project-edit__tag-delete-button", "click", function (event) {
        event.preventDefault();
        event.target.parentElement.remove();
    });

    app.helpers.delegate(window, "project-edit__image-delete-button", "click", function (event) {
        app.showLoading();

        app.makeAPIRequest({
            method: "DELETE",
            url: "/projects/" + selectedProjectID + "/images/" + event.target.getAttribute("data-id") + "/",
            onSuccess: function (response) {
                event.target.parentElement.remove();
                showFeedback("Successfully deleted the project image");
                app.hideLoading();
            },
            onError: function (response) {
                const defaultFeedback = "Error deleting the project image";
                showFeedback(app.getFeedbackFromAPIResponse(response, defaultFeedback), true);
                app.hideLoading();
            },
        });
    });

    app.helpers.delegate(window, "js-project-image-upload-button", "click", function (event) {
        app.showLoading();

        const index = event.target.getAttribute("data-index");
        const form = new FormData();
        form.append("image", uploadedImages[index].file);

        app.makeAPIRequest({
            method: "POST",
            url: "/projects/" + selectedProjectID + "/images/",
            data: form,
            onSuccess: function (response) {
                event.target.closest(".project-edit__image-container").remove();
                renderImage(response.data);
                showFeedback("Successfully added a new project image");
                app.hideLoading();
            },
            onError: function (response) {
                showFeedback(
                    app.getFeedbackFromAPIResponse(response, "Error uploading the project image"),
                    true
                );
                app.hideLoading();
            },
        });
    });

    new app.DragNDrop(
        document.querySelector(".project-edit__image-drop-zone"),
        {
            onDrop: function () {
                app.showLoading();
            },
            onFileAddSuccess,
            onFileAddError,
        }
    );

    Sortable.create(tagsContainer);
    Sortable.create(imagesContainer);

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

    for (const colour in app.config.colours) {
        const colourName = app.config.colours[colour];
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

    return {
        show,
        load,
        beforeLeave: function () {
            container.classList.remove("project-edit--active");
            container.querySelectorAll(".invalid").forEach(function (elem) {
                elem.classList.remove("invalid");
            });
            feedbackElem.parentElement.classList.add("hide");
        },
    };
};
