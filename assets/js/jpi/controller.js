;window.app = angular.module("portfolioCMS", ["ui.sortable", "ui.tinymce"]);

app.directive("fileUpload", function() {

    "use strict";

    return {
        restrict: "A",
        scope: true,
        link: function($scope, $element) {
            $element.bind("change", function() {
                for (var i = 0; i < $element[0].files.length; i++) {
                    $scope.checkFile($element[0].files[i]);
                }
                jpi.cms.scrollToUploads();
            });
        },
    };
});

app.controller("portfolioCMSController", function($scope, $http, $httpParamSerializerJQLike) {

    "use strict";

    /*
     * Any global variables used in multiple places with JS
     */
    var global = {
        url: new URL(window.location),
        redirectTo: null,
        titlePostfix: " - JPI Portfolio CMS",
        loadingDisplayTimer: null,
        projectErrorTimer: null,
    };

    /*
     * Any Functions only used within JS
     */
    var fn = {

        resetFooter: function() {
            if (jpi && jpi.stickyFooter) {
                // Slight delay so Angular updates UI
                setTimeout(function() {
                    jpi.stickyFooter.repositionFooter();
                }, 1);
            }
        },

        setURl: function(url) {
            url += "/";
            global.url.pathname = url;
            history.pushState(null, null, global.url.toString());
        },

        showProjectError: function(message, classToAdd) {
            clearTimeout(global.projectErrorTimer);

            jQuery(".project__feedback")
                .removeClass("feedback--error feedback--success hide")
                .addClass(classToAdd);

            $scope.projectFormFeedback = message;
            fn.hideLoading();
        },

        showProjectSelectError: function(feedback, classToAdd) {
            if (!classToAdd) {
                classToAdd = "feedback--error";
            }

            jQuery(".projects-select__feedback")
                .removeClass("feedback--error feedback--success")
                .addClass(classToAdd);

            $scope.selectProjectFeedback = feedback;
            fn.hideLoading();
        },

        // Set image as failed upload div to display error
        renderFailedUpload: function(errorMessage) {
            $scope.uploads.push({
                ok: false,
                text: errorMessage,
            });
            $scope.$apply();
            fn.resetFooter();
        },

        scrollToUploads: function() {

            /*
             * As the reading of files are async, the upload may not be in DOM yet
             * So we go to uploads container instead as default
             * But if there was already items in uploads, we scroll to the bottom of last item
             */

            var pos = jQuery(".project__uploads").offset().top;
            if (jQuery(".project__upload").length) {
                var lastItem = jQuery(".project__upload").last();
                var topOfLastItem = lastItem.offset().top;
                pos = topOfLastItem + lastItem.outerHeight();
            }

            var navHeight = jQuery(".nav__header").outerHeight();
            var feedbackHeight = jQuery(".project__feedback").outerHeight();
            jQuery("html, body").animate(
                {
                    scrollTop: pos - navHeight - feedbackHeight - 16,
                },
                1000
            );
        },

        doAJAXCall: function(url, method, onSuccess, onFail, data) {
            var fullUrl = jpi.helpers.genURL(jpi.config.jpiAPIEndpoint, url);

            method = method.toUpperCase();
            data = data || {};

            var options = {
                url: fullUrl,
                method: method,
                headers: {},
            };

            if (method === "POST") {
                options.headers["Content-Type"] = "application/x-www-form-urlencoded";
                options.data = $httpParamSerializerJQLike(data);
            }
            else {
                options.params = data;
            }

            if (url !== "login") {
                options.headers.Authorization = "Bearer " + jpi.helpers.getJwt();
            }

            $http(options).then(
                function(response) {
                    if (onSuccess) {
                        response = jpi.helpers.getAJAXResponse(response);
                        onSuccess(response);
                    }
                },
                function(response) {
                    if (onFail) {
                        response = jpi.helpers.getAJAXResponse(response);
                        onFail(response);
                    }
                }
            );
        },

        // Render a Project Image deletion message to show if it's been deleted or failed
        onSuccessfulProjectImageDeletion: function(response) {
            $scope.hideProjectError();

            var i = 0,
                found = false,
                message = "Error deleting the Project Image.",
                feedbackClass = "feedback--error";

            // Check if the deletion of project image has been processed
            if (response && response.row && response.row.id) {
                // Find and remove the image from view
                for (i = 0; i < $scope.selectedProject.images.length; i++) {
                    if ($scope.selectedProject.images[i].id === response.row.id) {
                        $scope.selectedProject.images.splice(i, 1);
                        found = true;
                        break;
                    }
                }

                if (found) {
                    message = "Successfully deleted the Project Image.";
                    feedbackClass = "feedback--success";
                }
            }

            fn.showProjectError(message, feedbackClass);
            fn.resetFooter();
        },

        onSuccessfulProjectImageUpload: function(response, upload) {
            $scope.selectedProject.images.push(response.row);

            var index = $scope.uploads.indexOf(upload);
            if (index > -1) {
                $scope.uploads.splice(index, 1);
            }

            var message = "Successfully added a new project image";
            fn.showProjectError(message, "feedback--success");
        },

        onSuccessfulProjectDeletion: function(response) {
            $scope.selectProjectFeedback = "";
            var defaultFeedback = "Error deleting your project.",
                feedbackClass = "feedback--error";

            // Check the project delete has been processed
            if (response && response.row && response.row.id) {
                defaultFeedback = "Successfully deleted the Project identified by: " + response.row.id + ".";
                feedbackClass = "feedback--success";
                fn.getProjects(1);
            }

            fn.showProjectSelectError(jpi.helpers.getFeedback(response, defaultFeedback), feedbackClass);
            fn.resetFooter();
        },

        onSuccessfulProjectSave: function(response) {
            if (response && response.row) {
                var wasUpdate = $scope.selectedProject && $scope.selectedProject.id,
                    typeSubmit = wasUpdate ? "updated" : "inserted",
                    defaultFeedback = "Successfully " + typeSubmit + " project.",
                    message = jpi.helpers.getFeedback(response, defaultFeedback);

                $scope.selectProject(response.row);

                if (!wasUpdate) {
                    fn.setURl("project/" + $scope.selectedProject.id + "/edit");
                    fn.setUpEditProject();
                }

                fn.showProjectError(message, "feedback--success");
            }
            else {
                fn.onFailedProjectSave(response);
            }
        },

        onFailedProjectSave: function(response) {
            var typeSubmit = !$scope.selectedProject.id ? "inserting" : "updating",
                defaultFeedback = "Error  " + typeSubmit + " the project.",
                message = jpi.helpers.getFeedback(response, defaultFeedback);

            fn.showProjectError(message, "feedback--error");
        },

        validateProjectForm: function() {
            var projectDate = jQuery(".project__date");
            var validDatePattern = /\b[\d]{4}-[\d]{2}-[\d]{2}\b/im,
                projectNameValidation = jpi.helpers.checkInputField(jQuery(".project__name")[0]),
                statusValidation = jpi.helpers.checkInputField(jQuery(".project__status")[0]),
                longDescriptionValidation = jpi.helpers.checkInputField(jQuery(".project__long-desc")[0]),
                shortDescriptionValidation = jpi.helpers.checkInputField(jQuery(".project__short-desc")[0]),
                dateValidation = (jpi.helpers.checkInputField(projectDate[0]) && validDatePattern.test(projectDate.val())),
                skillsValidation = $scope.selectedProject.skills.length;

            if (skillsValidation) {
                jQuery(".project__skill-input")
                    .addClass("valid")
                    .removeClass("invalid");
            }
            else {
                jQuery(".project__skill-input")
                    .addClass("invalid")
                    .removeClass("valid");
            }

            return (
                projectNameValidation &&
                statusValidation &&
                dateValidation &&
                skillsValidation &&
                longDescriptionValidation &&
                shortDescriptionValidation
            );
        },

        setUpProjectForm: function() {
            $scope.hideProjectError();

            $scope.selectProjectFeedback = $scope.skillInput = "";

            jQuery(".project-view, .nav").show();
            jQuery(".projects-select").hide();
            jQuery(".project__name, .project__status, .project__date, #skill-input, .project__long-desc, .project__short-desc").removeClass("invalid valid");

            jQuery(".main-content").css("padding-top", jQuery(".nav__header").height());

            fn.resetFooter();
        },

        setUpEditProject: function() {
            if ($scope.selectedProject && $scope.selectedProject.id) {
                document.title = "Edit Project (" + $scope.selectedProject.id + ")" + global.titlePostfix;

                jpi.dnd.setUp();
                fn.setUpProjectForm();
                jQuery(".project__uploads")
                    .sortable()
                    .disableSelection();
            }
            else {
                fn.showProjectSelectError("Select A Project To Edit.");
            }
        },

        setUpAddProject: function() {
            document.title = "Add New Project" + global.titlePostfix;
            jQuery(".nav .js-projects").removeClass("active");
            jQuery(".nav .js-new-project").addClass("active");

            fn.setUpProjectForm();
            fn.initNewProject();
            fn.hideLoading();
        },

        initNewProject: function() {
            $scope.selectedProject = {
                name: "",
                skills: [],
                long_description: "",
                short_description: "",
                link: "",
                github: "",
                download: "",
                date: "",
                colour: "",
                images: [],
            };
        },

        setUpProjectsSelect: function() {
            document.title = "Projects (" + $scope.currentPage + ")" + global.titlePostfix;

            $scope.projects = $scope.pages = [];
            $scope.selectedProject = undefined;

            jQuery(".project-view").hide();
            jQuery(".projects-select, .nav, .projects-select__add-button").show();
            jQuery(".nav .js-projects").addClass("active");
            jQuery(".nav .js-new-project").removeClass("active");

            jQuery(".main-content").css("padding-top", jQuery(".nav__header").height());
        },

        onSuccessfulProjectsGet: function(response) {
            fn.setUpProjectsSelect();

            if (response && response.rows && response.rows.length) {
                $scope.projects = response.rows;

                var pages = Math.ceil(response.meta.total_count / 10);
                for (var i = 1; i <= pages; i++) {
                    $scope.pages.push(i);
                }

                fn.hideLoading();
            }
            else {
                var message = jpi.helpers.getFeedback(response, "Sorry, no Projects to show.");
                fn.showProjectSelectError(message);
            }

            fn.resetFooter();
        },

        getProjects: function(page, addToHistory) {
            fn.showLoading();

            $scope.selectProjectFeedback = "";

            $scope.currentPage = page;

            jpi.dnd.stop();

            if (addToHistory !== false) {
                fn.setURl("projects/" + page);
            }

            fn.doAJAXCall(
                "projects",
                "GET",
                fn.onSuccessfulProjectsGet,
                function(response) {
                    fn.setUpProjectsSelect();
                    fn.showProjectSelectError(jpi.helpers.getFeedback(response, "Error getting projects."));
                },
                {page: $scope.currentPage}
            );
        },

        onSuccessfulProjectGet: function(response, id) {
            if (response && response.meta && response.meta.ok && response.row) {
                $scope.selectProject(response.row);
                fn.setUpEditProject();
                fn.hideLoading();
            }
            else {
                fn.onFailedProjectGet(response, id);
            }
        },

        onFailedProjectGet: function(response, id) {
            fn.showProjectSelectError(
                jpi.helpers.getFeedback(response, "Sorry, no Project found with ID: " + id + ".")
            );
            jQuery(".projects-select, .nav").show();
            jQuery(".projects-select__add-button").hide();
        },

        getAndEditProject: function(id) {
            fn.doAJAXCall(
                "/projects/" + id,
                "GET",
                function(response) {
                    fn.onSuccessfulProjectGet(response, id);
                },
                function(response) {
                    fn.onFailedProjectGet(response, id);
                }
            );
        },

        onSuccessfulAuthCheck: function(response, successFunc, redirectTo, messageOverride) {
            if (response && response.meta && response.meta.status && response.meta.status == 200) {
                $scope.isLoggedIn = true;
                successFunc();
            }
            else {
                fn.showLoginForm(response, redirectTo, messageOverride);
            }
        },

        // After user has attempted to log in
        onSuccessfulLogIn: function(response) {
            // Check if data was valid
            if (response && response.meta && response.meta.status && response.meta.status == 200) {
                jpi.helpers.setJwt(response.meta.jwt);

                // Make the log in/sign up form not visible
                jQuery(".login").hide();
                jQuery(".nav").show();

                $scope.isLoggedIn = true;

                if (!global.redirectTo) {
                    global.redirectTo = "projects/1";
                }

                fn.setURl(global.redirectTo);
                fn.loadApp();
                global.redirectTo = null;
            }
            // Check if feedback was provided or generic error message
            else {
                $scope.userFormFeedback = jpi.helpers.getFeedback(response, "Error logging you in.");
                fn.hideLoading();
            }
        },

        onFailedLogIn: function(response) {
            $scope.isLoggedIn = false;

            $scope.userFormFeedback = jpi.helpers.getFeedback(response, "Error logging you in.");

            if ($scope.userFormFeedback !== "") {
                jQuery(".login__feedback")
                    .removeClass("feedback--success")
                    .addClass("feedback--error");
            }

            fn.hideLoading();
        },

        showLoginForm: function(response, redirectTo, messageOverride) {
            $scope.isLoggedIn = false;

            document.title = "Login" + global.titlePostfix;

            jQuery(".projects-select, .project-view, .nav").hide();
            jQuery(".login").css("display", "flex");

            if (messageOverride) {
                $scope.userFormFeedback = messageOverride;
            }
            else {
                $scope.userFormFeedback = jpi.helpers.getFeedback(response, "You need to be logged in!");
            }

            var success = false;
            if (response && response.meta && response.meta.status) {
                success = response.meta.status == 200 || response.meta.status == 201;
            }

            if (success) {
                jQuery(".login__feedback")
                    .removeClass("feedback--error")
                    .addClass("feedback--success");
            }
            else {
                jQuery(".login__feedback")
                    .removeClass("feedback--success")
                    .addClass("feedback--error");
            }
            fn.hideLoading();

            fn.resetFooter();

            global.redirectTo = redirectTo;
            fn.setURl("login");
        },

        callLogout: function() {
            fn.doAJAXCall("/auth/logout", "DELETE", function(response) {
                if (response && response.meta && response.meta.status && response.meta.status == 200) {
                    jpi.helpers.setJwt("");
                    fn.showLoginForm(response);
                }
            });
        },

        logout: function(e) {
            e.preventDefault();
            e.stopPropagation();
            fn.callLogout();
            return false;
        },

        hideLoading: function() {
            jQuery(".js-loading").css({
                opacity: "0",
            });

            global.loadingDisplayTimer = setTimeout(function() {
                jQuery(".js-loading").css({
                    zIndex: "-10",
                });
            }, 1000);
        },

        showLoading: function() {
            clearTimeout(global.loadingDisplayTimer);

            jQuery(".js-loading").css({
                opacity: "1",
                zIndex: "10",
            });

            $scope.hideProjectError();
        },

        initialLogin: function() {
            $scope.checkAuthStatus(
                function() {
                    fn.getProjects(1);
                },
                null,
                ""
            );
        },

        loadApp: function() {
            var path = global.url.pathname.substring(1).split("/"),
                root = path[0] || "",
                func,
                redirectTo;

            // Check what page should be shown
            if (root === "projects" && !path[2]) {
                var pageNum = jpi.helpers.getInt(path[1], 1);
                func = function() {
                    fn.getProjects(pageNum, false);
                };
                redirectTo = "projects/" + pageNum;
            }
            else if (root === "project" && path[1]) {
                if (path[1] === "add" && !path[2]) {
                    func = fn.setUpAddProject;
                    redirectTo = "project/add";
                }
                else if (jpi.helpers.getInt(path[1]) && path[2] && path[2] === "edit" && !path[3]) {
                    var id = jpi.helpers.getInt(path[1]);
                    func = function() {
                        fn.getAndEditProject(id, 10);
                    };
                    redirectTo = "project/" + id + "/edit";
                }
            }
            else if (root === "logout" && !path[1]) {
                fn.callLogout();
            }

            if (func && redirectTo) {
                $scope.checkAuthStatus(func, redirectTo);
            }
            else {
                fn.initialLogin();
            }
        },

        initListeners: function() {
            jQuery(".cms-page").on("click", ".js-hide-error", $scope.hideProjectError);

            jQuery(".cms-page").on("click", ".js-logout", fn.logout);

            jQuery(".cms-page").on("click", ".js-projects", function(e) {
                e.preventDefault();
                e.stopPropagation();

                var page = jQuery(this).attr("data-page");
                if (!page) {
                    page = 1;
                }

                $scope.checkAuthStatus(function() {
                    fn.getProjects(page);
                }, "projects/" + page);
            });

            jQuery(".cms-page").on("click", ".js-new-project", function(e) {
                e.preventDefault();
                e.stopPropagation();

                $scope.checkAuthStatus(function() {
                    fn.setURl("project/add");
                    fn.setUpAddProject();
                }, "project/add");
            });

            jQuery(".cms-page").on("click", ".js-edit-project", function(e) {
                e.preventDefault();
                e.stopPropagation();

                var id = $scope.selectedProject && $scope.selectedProject.id ? $scope.selectedProject.id : null;

                if (id) {
                    $scope.checkAuthStatus(function() {
                        fn.setURl("project/" + id + "/edit");
                        fn.setUpEditProject();
                    }, "project/" + id + "/edit");
                }
            });

            jQuery(".nav-item__link").on("click", jpi.nav.closeMobileNav);

            window.addEventListener("popstate", function() {
                fn.showLoading();
                global.url = new URL(window.location);
                fn.loadApp();
            });
        },

        initVariables: function() {
            $scope.isLoggedIn = false;
            $scope.projects = $scope.pages = $scope.uploads = [];
            $scope.currentPage = 1;
            $scope.userFormFeedback = $scope.selectProjectFeedback = $scope.projectFormFeedback = $scope.skillInput = "";
        },

        init: function() {
            jpi.helpers.getJwt();
            fn.showLoading();
            fn.initVariables();
            fn.initNewProject();
            fn.initListeners();

            jQuery(".main-content").css("padding-top", jQuery(".nav__header").height());

            jQuery(".login, .project-view, .projects-select").hide();

            fn.loadApp();
        },
    };

    /*
     * Any functions used in HTML (and JS)
     */

    $scope.checkAuthStatus = function(successFunc, redirectTo, messageOverride) {
        fn.doAJAXCall(
            "/auth/session",
            "GET",
            function(response) {
                fn.onSuccessfulAuthCheck(response, successFunc, redirectTo, messageOverride);
            },
            function(response) {
                fn.showLoginForm(response, redirectTo, messageOverride);
            }
        );
    };

    $scope.hideProjectError = function() {
        jQuery(".project__feedback").addClass("hide");

        global.projectErrorTimer = setTimeout(function() {
            $scope.projectFormFeedback = "";
        }, 300);
    };

    // Send a newly uploaded image to API
    $scope.sendImage = function(upload) {
        fn.showLoading();

        $scope.checkAuthStatus(function() {
            var form = new FormData();
            form.append("image", upload.file);

            var relativeURL = "/projects/" + $scope.selectedProject.id + "/images/";
            $http.post(
                jpi.helpers.genURL(jpi.config.jpiAPIEndpoint, relativeURL),
                form,
                {
                    transformRequest: angular.identity,
                    headers: {
                        "Content-Type": undefined,
                        "Process-Data": false,
                        "Authorization": "Bearer " + jpi.helpers.getJwt(),
                    },
                })
                .then(
                    function(response) {
                        response = jpi.helpers.getAJAXResponse(response);
                        fn.onSuccessfulProjectImageUpload(response, upload);
                    },
                    function(response) {
                        response = jpi.helpers.getAJAXResponse(response);
                        var message = jpi.helpers.getFeedback(response, "Error uploading the Project Image.");
                        fn.showProjectError(message, "feedback--error");
                    }
                );
        });
    };

    $scope.checkFile = function(file) {
        var fileReader;

        if (file.type.includes("image/")) {
            // Gets image
            fileReader = new FileReader();

            fileReader.onload = function(e) {
                $scope.uploads.push({
                    ok: true,
                    text: file.name,
                    image: e.target.result,
                    file: file,
                });
                $scope.$apply();
                fn.resetFooter();
            };

            fileReader.onerror = function() {
                fn.renderFailedUpload("Error getting " + file.name);
            };

            fileReader.readAsDataURL(file);
        }
        // Else it isn't a image so show its failed
        else {
            fn.renderFailedUpload(file.name + " isn't a image.");
        }
    };

    // Send a request to delete a Project Image
    $scope.deleteProjectImage = function(projectImage) {
        fn.showLoading();

        fn.doAJAXCall(
            "/projects/" + projectImage.project_id + "/images/" + projectImage.id,
            "DELETE",
            fn.onSuccessfulProjectImageDeletion,
            function(response) {
                var message = jpi.helpers.getFeedback(response, "Error deleting the Project Image.");
                fn.showProjectError(message, "feedback--error");
            }
        );
    };

    $scope.addSkill = function() {
        $scope.selectedProject.skills.push($scope.skillInput);
        $scope.skillInput = "";
    };

    $scope.deleteSkill = function(skill) {
        var index = $scope.selectedProject.skills.indexOf(skill);
        $scope.selectedProject.skills.splice(index, 1);
    };

    $scope.submitProject = function() {
        fn.showLoading();

        var isFormValid = fn.validateProjectForm();
        if (isFormValid) {
            var project = $scope.selectedProject,
                id = project.id || "",
                method = project.id ? "PUT" : "POST",
                data = {
                    "name": project.name || "",
                    "status": project.status || "",
                    "date": project.date || "",
                    "link": project.link || "",
                    "github": project.github || "",
                    "download": project.download || "",
                    "colour": project.colour || "",
                    "short_description": project.short_description || "",
                    "long_description": project.long_description || "",
                    "images[]": project.images || [],
                };

            var skillsProp = project.id ? "skills[]" : "skills";
            data[skillsProp] = project.skills || [];

            fn.doAJAXCall(
                "/projects/" + id,
                method,
                fn.onSuccessfulProjectSave,
                fn.onFailedProjectSave,
                data
            );
        }
        else {
            var message = "Fill in Required Inputs Fields.";
            fn.showProjectError(message, "feedback--error");

            setTimeout(function() {
                var pos = 0,
                    firstInvalidInput = jQuery(".project__form .invalid").first(),
                    inputId = firstInvalidInput.attr("id"),
                    navHeight = jQuery(".nav__header").outerHeight(),
                    feedbackHeight = jQuery(".project__feedback").outerHeight();

                var label = jQuery("label[for=" + inputId + "]");
                if (!label.length) {
                    label = firstInvalidInput.prev();
                }

                pos = label.offset().top;

                jQuery("html, body").animate(
                    {
                        scrollTop: pos - navHeight - feedbackHeight - 16,
                    },
                    1000
                );
            }, 400);
        }
    };

    $scope.deleteProject = function() {
        fn.showLoading();

        $scope.selectProjectFeedback = "";
        if ($scope.selectedProject && $scope.selectedProject.id) {
            fn.doAJAXCall(
                "/projects/" + $scope.selectedProject.id,
                "DELETE",
                fn.onSuccessfulProjectDeletion,
                function(response) {
                    var message = jpi.helpers.getFeedback(response, "Error deleting your project.");
                    fn.showProjectSelectError(message);
                }
            );
        }
        else {
            fn.showProjectSelectError("Select A Project To Delete.");
        }

        fn.resetFooter();
    };

    $scope.selectProject = function(project) {
        project.date = new Date(project.date);

        if (project.created_at && project.created_at !== "") {
            project.created_at = new Date(project.created_at);
        }
        else {
            project.created_at = "Not Available";
        }

        if (project.updated_at && project.updated_at !== "") {
            project.updated_at = new Date(project.updated_at);
        }
        else {
            project.updated_at = "Not Available";
        }

        $scope.selectedProject = project;
    };

    $scope.logIn = function() {
        fn.showLoading();

        var usernameValid = jpi.helpers.checkInputField(jQuery("#username")[0]),
            passwordValid = jpi.helpers.checkInputField(jQuery("#password")[0]);

        // All is okay
        if (usernameValid && passwordValid) {
            var data = {
                username: $scope.username,
                password: $scope.password,
            };

            fn.doAJAXCall("/auth/login", "POST", fn.onSuccessfulLogIn, fn.onFailedLogIn, data);
        }
        // If both inputs are empty
        else if (!usernameValid && !passwordValid) {
            $scope.userFormFeedback = "Input fields needs to be filled.";
        }
        // Else checks if username input is empty
        else if (!usernameValid) {
            $scope.userFormFeedback = "Username field needs to be filled.";
        }
        // Else checks if password input is empty
        else if (!passwordValid) {
            $scope.userFormFeedback = "Password field needs to be filled.";
        }
    };

    $scope.colourOptions = {
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

    var tinymceOptions = {
        branding: false,
        menubar: false,
        browser_spellcheck: true,
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
            {title: "Project link", value: "link-styled link-styled--{{colour}}"},
            {title: "Project button", value: "btn btn--{{colour}}"},
        ],
    };

    /*
     * Dynamically add link & button classes for current colours
     * And as these can change and but managed by a variable
     */
    for (var colour in $scope.colourOptions) {
        var colourName = $scope.colourOptions[colour];
        tinymceOptions.link_class_list.push({
            title: colourName + " link",
            value: "link-styled link-styled--" + colour,
        });
        tinymceOptions.link_class_list.push({
            title: colourName + " button",
            value: "btn btn--" + colour,
        });
    }

    $scope.tinymceOptions = tinymceOptions;

    /*
     * Allow some selective functions to be window scoped (So it can be used in other JS files)
     */
    window.jpi = window.jpi || {};

    window.jpi.cms = {
        checkFile: $scope.checkFile,
        renderFailedUpload: fn.renderFailedUpload,
        scrollToUploads: fn.scrollToUploads,
    };

    jQuery(window).on("load", function() {
        jpi.stickyFooter = new StickyFooter(".main-content");
    });

    jQuery(document).on("ready", fn.init);

});
