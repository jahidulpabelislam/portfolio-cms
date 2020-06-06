;window.app = angular.module("portfolioCMS", ["ui.sortable", "ui.tinymce"]);

app.directive("fileUpload", function() {

    "use strict";

    return {
        restrict: "A",
        scope: true,
        link: function($scope, $element) {
            $element.bind("change", function() {
                var files = $element[0].files;
                for (var i = 0; i < files.length; i++) {
                    $scope.checkFile(files[i]);
                }
                jpi.cms.scrollToUploads();
            });
        },
    };
});

app.controller("portfolioCMSController", function($scope, $http, $httpParamSerializerJQLike) {

    "use strict";

    /**
     * Any global variables used in multiple places with JS
     */
    var global = {
        url: new URL(window.location),
        redirectTo: null,
        titlePostfix: " - JPI Portfolio CMS",
        loadingDisplayTimer: null,
        projectFeedbackTimer: null,
    };

    /**
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
            url = jpi.helpers.slashURL(url, true);
            global.url.pathname = url;
            history.pushState(null, null, global.url.toString());
        },

        showProjectFeedback: function(feedback, type) {
            clearTimeout(global.projectFeedbackTimer);

            type = type || "error";

            jQuery(".project__feedback")
                .removeClass("feedback--error feedback--success hide")
                .addClass("feedback--" + type);

            $scope.projectFormFeedback = feedback;
            fn.hideLoading();
        },

        showProjectSelectFeedback: function(feedback, type) {
            type = type || "error";

            jQuery(".projects-select__feedback")
                .removeClass("feedback--error feedback--success")
                .addClass("feedback--" + type);

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

            /**
             * As the reading of files are async, the upload may not be in DOM yet
             * So we go to uploads container instead as default
             * But if there was already items in uploads, we scroll to the bottom of last item
             */

            var pos = jQuery(".project__uploads").offset().top;
            var uploads = jQuery(".project__upload");
            if (uploads.length) {
                var lastItem = uploads.last();
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

        doAJAXCall: function(endpoint, method, onSuccess, onFail, data) {
            var fullURL = jpi.helpers.genURL(jpi.config.jpiAPIBaseURL, endpoint);

            method = method.toUpperCase();
            data = data || {};

            var options = {
                url: fullURL,
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

            if (endpoint !== "login") {
                options.headers.Authorization = "Bearer " + jpi.helpers.getJwt();
            }

            $http(options).then(
                function(response) {
                    if (onSuccess) {
                        response = jpi.helpers.getAPIResponse(response);
                        onSuccess(response);
                    }
                },
                function(response) {
                    if (onFail) {
                        response = jpi.helpers.getAPIResponse(response);
                        onFail(response);
                    }
                }
            );
        },

        formatProject: function(project) {
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

            return project;
        },

        // Render a Project Image deletion message to show if it's been deleted or failed
        onSuccessfulProjectImageDeletion: function(response) {
            $scope.hideProjectFeedback();

            var found = false,
                feedback = "Error deleting the Project Image.",
                feedbackType = "error";

            // Check if the deletion of project image has been processed
            if (response && response.data && response.data.id) {
                // Find and remove the image from view
                for (var i = 0; i < $scope.selectedProject.images.length; i++) {
                    if ($scope.selectedProject.images[i].id === response.data.id) {
                        $scope.selectedProject.images.splice(i, 1);
                        found = true;
                        break;
                    }
                }

                if (found) {
                    feedback = "Successfully deleted the Project Image.";
                    feedbackType = "success";
                }
            }

            fn.showProjectFeedback(feedback, feedbackType);
            fn.resetFooter();
        },

        onSuccessfulProjectImageUpload: function(response, upload) {
            $scope.selectedProject.images.push(response.data);

            var index = $scope.uploads.indexOf(upload);
            if (index > -1) {
                $scope.uploads.splice(index, 1);
            }

            var feedback = "Successfully added a new project image";
            fn.showProjectFeedback(feedback, "success");
        },

        onSuccessfulProjectDeletion: function(response) {
            $scope.selectProjectFeedback = "";
            var defaultFeedback = "Error deleting your project.",
                feedbackType = "error";

            // Check the project delete has been processed
            if (response && response.data && response.data.id) {
                defaultFeedback = "Successfully deleted the Project identified by: " + response.data.id + ".";
                feedbackType = "success";
                fn.getProjects(1);
            }

            var feedback = jpi.helpers.getAPIFeedback(response, defaultFeedback);
            fn.showProjectSelectFeedback(feedback, feedbackType);
            fn.resetFooter();
        },

        onSuccessfulProjectSave: function(response) {
            if (response && response.data) {
                var wasUpdate = $scope.selectedProject && $scope.selectedProject.id,

                    typeSubmit = wasUpdate ? "updated" : "inserted",

                    defaultFeedback = "Successfully " + typeSubmit + " project.",
                    feedback = jpi.helpers.getAPIFeedback(response, defaultFeedback);

                var project = fn.formatProject(response.data);
                $scope.selectProject(project);

                if (!wasUpdate) {
                    fn.setURl("project/" + $scope.selectedProject.id + "/edit");
                    fn.setUpEditProject();
                }

                fn.showProjectFeedback(feedback, "success");
            }
            else {
                fn.onFailedProjectSave(response);
            }
        },

        onFailedProjectSave: function(response) {
            var typeSubmit = !$scope.selectedProject.id ? "inserting" : "updating",
                defaultFeedback = "Error " + typeSubmit + " the project.",
                feedback = jpi.helpers.getAPIFeedback(response, defaultFeedback);

            fn.showProjectFeedback(feedback);
        },

        validateProjectForm: function() {
            var projectDate = jQuery(".project__date"),

                validDatePattern = /\b[\d]{4}-[\d]{2}-[\d]{2}\b/im,

                isNameValid = jpi.helpers.checkInput(jQuery(".project__name")[0]),
                isStatusValid = jpi.helpers.checkInput(jQuery(".project__status")[0]),
                isTypeValid = jpi.helpers.checkInput(jQuery(".project__type")[0]),
                isLongDescValid = jpi.helpers.checkInput(jQuery(".project__long-desc")[0]),
                isShortDescValid = jpi.helpers.checkInput(jQuery(".project__short-desc")[0]),
                isDateValid = (jpi.helpers.checkInput(projectDate[0]) && validDatePattern.test(projectDate.val())),
                isSkillsValid = $scope.selectedProject.skills.length > 0;

            if (isSkillsValid) {
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
                isNameValid &&
                isStatusValid &&
                isDateValid &&
                isTypeValid &&
                isSkillsValid &&
                isLongDescValid &&
                isShortDescValid
            );
        },

        setUpProjectForm: function() {
            $scope.hideProjectFeedback();

            $scope.selectProjectFeedback = $scope.skillInput = "";

            jQuery(".project-view, .nav").show();
            jQuery(".projects-select").hide();
            jQuery(".project__name, .project__status, .project__date, .project__type, #skill-input, .project__long-desc, .project__short-desc").removeClass("invalid valid");

            jQuery(".main-content").css("padding-top", jQuery(".nav__header").height());

            fn.resetFooter();
        },

        setUpEditProject: function() {
            if ($scope.selectedProject && $scope.selectedProject.id) {
                document.title = "Edit Project (" + $scope.selectedProject.id + ")" + global.titlePostfix;

                jpi.dnd.setUp();
                fn.setUpProjectForm();
                jQuery(".project__uploads").sortable().disableSelection();
            }
            else {
                fn.showProjectSelectFeedback("Select A Project To Edit.");
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
                type: "",
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

            if (response && response.data && response.data.length) {
                var projects = response.data;

                for (var i = 0; i < projects.length; i++) {
                    projects[i] = fn.formatProject(projects[i]);
                }
                $scope.projects = projects;

                var pages = Math.ceil(response.meta.total_count / 10);
                for (var k = 1; k <= pages; k++) {
                    $scope.pages.push(k);
                }

                fn.hideLoading();
            }
            else {
                var defaultFeedback = "Sorry, no Projects to show.";
                var feedback = jpi.helpers.getAPIFeedback(response, defaultFeedback);
                fn.showProjectSelectFeedback(feedback);
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
                    var defaultFeedback = "Error getting projects.";
                    var feedback = jpi.helpers.getAPIFeedback(response, defaultFeedback);
                    fn.showProjectSelectFeedback(feedback);
                },
                {page: $scope.currentPage}
            );
        },

        onSuccessfulProjectGet: function(response, id) {
            if (response && response.data) {
                var project = fn.formatProject(response.data);
                $scope.selectProject(project);
                fn.setUpEditProject();
                fn.hideLoading();
            }
            else {
                fn.onFailedProjectGet(response, id);
            }
        },

        onFailedProjectGet: function(response, id) {
            var defaultFeedback = "Sorry, no Project found with ID: " + id + ".";
            var feedback = jpi.helpers.getAPIFeedback(response, defaultFeedback);
            fn.showProjectSelectFeedback(feedback);
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

        onSuccessfulAuthCheck: function(response, successFunc, redirectTo, feedbackOverride) {
            if (response && response.data && response.data == true) {
                $scope.isLoggedIn = true;
                successFunc();
            }
            else {
                fn.showLoginForm(response, redirectTo, feedbackOverride);
            }
        },

        // After user has attempted to log in
        onSuccessfulLogIn: function(response) {
            // Check if data was valid
            if (response && response.data) {
                jpi.helpers.setJwt(response.data);

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
                var defaultFeedback = "Error logging you in.";
                $scope.userFormFeedback = jpi.helpers.getAPIFeedback(response, defaultFeedback);
                fn.hideLoading();
            }
        },

        onFailedLogIn: function(response) {
            $scope.isLoggedIn = false;

            var defaultFeedback = "Error logging you in.";
            $scope.userFormFeedback = jpi.helpers.getAPIFeedback(response, defaultFeedback);

            if ($scope.userFormFeedback !== "") {
                jQuery(".login__feedback")
                    .removeClass("feedback--success")
                    .addClass("feedback--error");
            }

            fn.hideLoading();
        },

        showLoginForm: function(response, redirectTo, feedbackOverride) {
            $scope.isLoggedIn = false;

            document.title = "Login" + global.titlePostfix;

            jQuery(".projects-select, .project-view, .nav").hide();
            jQuery(".login").css("display", "flex");

            if (feedbackOverride) {
                $scope.userFormFeedback = feedbackOverride;
            }
            else {
                var defaultFeedback = "You need to be logged in!";
                $scope.userFormFeedback = jpi.helpers.getAPIFeedback(response, defaultFeedback);
            }

            var success = false;
            if (response && response.data) {
                success = response.data == true;
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

            $scope.hideProjectFeedback();
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
            jQuery(".cms-page").on("click", ".js-hide-error", $scope.hideProjectFeedback);

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

    /**
     * Any functions used in HTML (and JS)
     */

    $scope.checkAuthStatus = function(successFunc, redirectTo, feedbackOverride) {
        fn.doAJAXCall(
            "/auth/session",
            "GET",
            function(response) {
                fn.onSuccessfulAuthCheck(response, successFunc, redirectTo, feedbackOverride);
            },
            function(response) {
                fn.showLoginForm(response, redirectTo, feedbackOverride);
            }
        );
    };

    $scope.hideProjectFeedback = function() {
        jQuery(".project__feedback").addClass("hide");

        global.projectFeedbackTimer = setTimeout(function() {
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
                jpi.helpers.genURL(jpi.config.jpiAPIBaseURL, relativeURL),
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
                        response = jpi.helpers.getAPIResponse(response);
                        fn.onSuccessfulProjectImageUpload(response, upload);
                    },
                    function(response) {
                        response = jpi.helpers.getAPIResponse(response);
                        var defaultFeedback = "Error uploading the Project Image.";
                        var feedback = jpi.helpers.getAPIFeedback(response, defaultFeedback);
                        fn.showProjectFeedback(feedback);
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
                var defaultFeedback = "Error deleting the Project Image.";
                var feedback = jpi.helpers.getAPIFeedback(response, defaultFeedback);
                fn.showProjectFeedback(feedback);
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
                    "type": project.type || "",
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
            var feedback = "Fill in Required Inputs Fields.";
            fn.showProjectFeedback(feedback);

            setTimeout(function() {
                var firstInvalidInput = jQuery(".project__form .invalid").first(),
                    inputId = firstInvalidInput.attr("id"),
                    navHeight = jQuery(".nav__header").outerHeight(),
                    feedbackHeight = jQuery(".project__feedback").outerHeight();

                var label = jQuery("label[for=" + inputId + "]");
                if (!label.length) {
                    label = firstInvalidInput.prev();
                }

                var pos = label.offset().top;

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
                    var defaultFeedback = "Error deleting your project.";
                    var feedback = jpi.helpers.getAPIFeedback(response, defaultFeedback);
                    fn.showProjectSelectFeedback(feedback);
                }
            );
        }
        else {
            fn.showProjectSelectFeedback("Select A Project To Delete.");
        }

        fn.resetFooter();
    };

    $scope.selectProject = function(project) {
        $scope.selectedProject = project;
    };

    $scope.logIn = function() {
        fn.showLoading();

        var isUsernameValid = jpi.helpers.checkInput(jQuery("#username")[0]),
            isPasswordValid = jpi.helpers.checkInput(jQuery("#password")[0]);

        // All is okay
        if (isUsernameValid && isPasswordValid) {
            var data = {
                username: $scope.username,
                password: $scope.password,
            };

            fn.doAJAXCall("/auth/login", "POST", fn.onSuccessfulLogIn, fn.onFailedLogIn, data);
        }
        // If both inputs are empty
        else if (!isUsernameValid && !isPasswordValid) {
            $scope.userFormFeedback = "Input fields needs to be filled.";
        }
        // Else checks if username input is empty
        else if (!isUsernameValid) {
            $scope.userFormFeedback = "Username field needs to be filled.";
        }
        // Else checks if password input is empty
        else if (!isPasswordValid) {
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
        baseURL : window.location.origin + "/assets/js/third-party/tinymce",
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

    /**
     * Dynamically add link & button classes for current colours
     * And as these can change and but managed by a variable
     */
    for (var colour in $scope.colourOptions) {
        var colourName = $scope.colourOptions[colour];
        tinymceOptions.link_class_list.push({
            title: colourName + " link",
            value: "link link--" + colour,
        });
        tinymceOptions.link_class_list.push({
            title: colourName + " button",
            value: "button button--" + colour,
        });
    }

    $scope.tinymceOptions = tinymceOptions;

    /**
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
