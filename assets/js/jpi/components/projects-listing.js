window.jpi = window.jpi || {};
window.jpi.ProjectsListing = function() {

    "use strict";

    const app = window.jpi;

    const container = document.querySelector(".projects-listing");

    const feedbackElem = document.querySelector(".projects-listing__feedback");

    const table = container.querySelector(".table tbody");

    const searchInput = document.querySelector(".js-filters-search");

    const typeInput = document.querySelector(".js-filters-type");
    const publishedCheckbox = document.querySelector(".js-filters-published");
    const dateInput = document.querySelector(".js-filters-date");

    const pagination = document.querySelector(".projects-listing__pagination");

    const rowTemplate = document.querySelector("#js-projects-table-row").innerHTML;

    const showFeedback = function (feedback, isError) {
        feedbackElem.innerHTML = feedback;
        feedbackElem.classList.toggle("feedback--success", !isError);
        feedbackElem.classList.toggle("feedback--error", isError);
        feedbackElem.classList.add("projects-listing__feedback--active");
    };

    const onSuccessfulGet = function (response, currentPage) {
        let rows = "";
        for (let i = 0; i < response.data.length; i++) {
            const project = response.data[i];

            let row = rowTemplate;

            for (const field in project) {
                if ({}.hasOwnProperty.call(project, field)) {
                    const regex = new RegExp("{{2} ?" + field + " ?}{2}", "g");
                    let value = project[field];

                    if (field === "status") {
                        value = value === "published" ? "Yes" : "No";
                    }
                    else if (value && ["date", "created_at", "updated_at"].includes(field)) {
                        value = app.shortDateFormat.format(new Date(value));
                    }

                    value = value ? value : "-";

                    row = row.replace(regex, value);
                }
            }

            rows += row;
        }

        pagination.innerHTML = "";

        const finalPage = Math.ceil(response._total_count / 10);
        for (let page = 1; page <= finalPage; page++) {
            pagination.innerHTML += '<li class="pagination__item">' +
                '    <a class="pagination__item-link' + (page == currentPage ? ' active' : '') + '" href="/projects/' + page + '/" title="Link to Projects Page ' + page + '" data-page="' + page +'" tabindex="1">' + page + '</a>' +
                '</li>';
        }

        if (!response.data.length) {
            showFeedback(
                app.getFeedbackFromAPIResponse(response, "No projects found"),
                true
            );
        }

        table.innerHTML = rows;
        container.classList.add("projects-listing--active");

        app.hideLoading();
    };

    const load = function(page) {
        page = page || 1;

        app.showLoading();

        container.classList.remove("project-edit--active");

        app.activateLink("/projects/");

        feedbackElem.classList.remove("projects-listing__feedback--active");

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

        app.makeAPIRequest({
            method: "GET",
            url: "/projects/",
            data: data,
            onSuccess: function (response) {
                onSuccessfulGet(response, page);
            },
            onError: function(response) {
                showFeedback(
                    app.getFeedbackFromAPIResponse(response, "Error getting projects."),
                    true
                );
            },
        });
    };

    document.querySelectorAll(".js-filters-on-change").forEach(function (element) {
        element.addEventListener("change", function (event) {
            app.router.changeTo("/projects/");
        });
    });

    searchInput.addEventListener("keyup", function (event) {
        app.router.changeTo("/projects/");
    });

    app.helpers.delegate(window, "pagination__item-link", "click", function (event) {
        event.preventDefault();
        const page = event.target.getAttribute("data-page");
        app.router.changeTo("/projects/" + (page != 1 ? page + "/" : ""));
    });

    app.helpers.delegate(window, "projects-listing__edit-button", "click", function (event) {
        event.preventDefault();
        app.router.changeTo("/project/edit/" + event.target.getAttribute("data-id") + "/");
    });

    app.helpers.delegate(window, "projects-listing__delete-button", "click", function (event) {
        app.showLoading();

        const projectID = event.target.getAttribute("data-id");

        app.makeAPIRequest({
            method: "DELETE",
            url: "/projects/" + projectID + "/",
            onSuccess: function (response) {
                showFeedback(
                    app.getFeedbackFromAPIResponse(response, "Successfully deleted project identified by '" + projectID + "'.")
                );
                app.router.changeTo("/projects/");
            },
            onError: function (response) {
                showFeedback(
                    app.getFeedbackFromAPIResponse(response, "Error deleting project identified by '" + projectID + "'."),
                    true
                );
                app.hideLoading();
            },
        });
    });

    return {
        load,
        showFeedback,
    };
};
