var app = angular.module("projectsAdmin", ["ui.sortable"]);

app.directive("fileUpload", function () {
	return {
		restrict: "A",
		scope: true,
		link: function ($scope, $element) {

			$element.bind("change", function () {
				for (var i = 0; i < $element[0].files.length; i++) {
					$scope.checkFile($element[0].files[i]);
				}
			});
		}
	};
});

app.controller("projectsAdminController", function ($scope, $http) {

	/*
	 * Any global variables used in multiple places with JS
	 */
	var global = {
		url: new URL(window.location),
		redirectTo: null,
		titlePostfix: " - JPI Admin",
		jwtStorageKey: "cmsJwt",
		jwt: "",
	};

	/*
	 * Any Functions only used within JS
	 */
	var fn = {

		getJwtFromStorage: function() {
			var jwt = localStorage.getItem(global.jwtStorageKey);
			global.jwt = jwt;
			return jwt;
		},

		setJwt: function(jwt) {
			localStorage.setItem(global.jwtStorageKey, jwt);
			global.jwt = jwt;
		},

		setURl: function(url) {
			url += "/";
			global.url.pathname = url;
			history.pushState(null, null, global.url.toString());
		},

		getFeedback: function (response, genericFeedback) {
			if (response && response.meta && response.meta.feedback) {
				return response.meta.feedback;
			}
			else {
				return genericFeedback;
			}
		},

		showProjectError: function (message, classToAdd) {
			jQuery(".project__feedback").removeClass("feedback--error feedback--success hide").addClass(classToAdd);
			$scope.projectFormFeedback = message;

			fn.hideLoading();
		},

		showProjectSelectError: function (feedback, classToAdd) {
			if (!classToAdd) {
				classToAdd = "feedback--error";
			}

			jQuery(".project-select__feedback").removeClass("feedback--error feedback--success").addClass(classToAdd);
			$scope.selectProjectFeedback = feedback;
			fn.hideLoading();
		},

		// Set image as failed upload div to display error
		renderFailedUpload: function (errorMessage) {
			$scope.uploads.push({ok: false, text: errorMessage});
			$scope.$apply();
			jpi.helpers.delayExpandingSection();
		},

		sendAjaxResponse: function(response, func) {
			response = response && response.data ? response.data : {};

			func(response);
		},

		doAjaxCall: function(url, method, onSuccess, onFail, data) {
			var fullUrl = jpi.config.jpiAPIEndpoint + url + "/",

				options = {
					url: fullUrl,
					method: method.toUpperCase(),
					params: data ? data : {}
				};

			if (url !== "login") {
				options.headers = {
					Authorization: "Bearer " + global.jwt
				};
			}

			$http(options).then(function(response) {
				if (onSuccess) {
					fn.sendAjaxResponse(response, onSuccess)
				}
			}, function(response) {
				if (onFail) {
					fn.sendAjaxResponse(response, onFail)
				}
			});
		},

		// Render a Project Image deletion message to show if it's been deleted or failed
		onSuccessfulProjectImageDeletion: function(response) {
			$scope.hideProjectError();

			var i = 0, found = false,
				message = "Error deleting the Project Image.",
				feedbackClass = "feedback--error";

			// Check if the deletion of project image has been processed
			if (response && response.row && response.row.ID) {

				// Find and remove the image from view
				for (i = 0; i < $scope.selectedProject.Images.length; i++) {
					if ($scope.selectedProject.Images[i]["ID"] === response.row.ID) {
						$scope.selectedProject.Images.splice(i, 1);
						found = true;
						break;
					}
				}

				if (found) {
					message = "Successfully deleted the Project Image.";
					feedbackClass = "feedback--success"
				}
			}

			fn.showProjectError(message, feedbackClass);

			jpi.helpers.delayExpandingSection();
		},
		
		onSuccessfulProjectImageUpload: function(response) {
			$scope.selectedProject.Images.push(response.row);

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
			if (response && response.row && response.row.ID) {

				defaultFeedback = "Successfully deleted the Project identified by: " + response.row.ID + ".";
				feedbackClass = "feedback--success";
				fn.getProjectList(1);
			}

			fn.showProjectSelectError(fn.getFeedback(response, defaultFeedback), feedbackClass);
			jpi.helpers.delayExpandingSection();
		},
		
		onSuccessfulProjectUpdate: function(response) {
			var wasUpdate = $scope.selectedProject && $scope.selectedProject.ID,
				typeSubmit = (wasUpdate) ? "updated" : "saved",
				defaultFeedback = "Successfully " + typeSubmit + " project.",
				message = fn.getFeedback(response, defaultFeedback);

			$scope.selectProject(response.row);

			if (!wasUpdate) {
				fn.setURl("project/" + $scope.selectedProject.ID + "/edit");
				fn.setUpEditProject();
			}

			fn.showProjectError(message, "feedback--success");
		},

		onFailedProjectUpdate: function(response) {
			var typeSubmit = (!$scope.selectedProject.ID) ? "saving" : "updating",
				defaultFeedback = "Error  " + typeSubmit + " the project.",
				message = fn.getFeedback(response, defaultFeedback);

			fn.showProjectError(message, "feedback--error");
		},

		setUpProjectForm: function() {
			$scope.skillInput = "";

			jQuery(".project-view, .nav").show();
			jQuery(".project-select").hide();
			$scope.hideProjectError();

			jQuery("#projectName, #skill-input, #longDescription, #shortDescription, #github, #date").removeClass("invalid valid");

			jpi.helpers.delayExpandingSection();
		},

		setUpEditProject: function() {
			$scope.selectProjectFeedback = "";

			if ($scope.selectedProject && $scope.selectedProject.ID) {
				document.title = "Edit Project (" + $scope.selectedProject.ID + ")" + global.titlePostfix;

				jpi.dnd.setUp();
				fn.setUpProjectForm();
				$(".project__uploads").sortable().disableSelection();
			}
			else {
				fn.showProjectSelectError("Select A Project To Update.");
			}
		},

		setUpAddProject: function() {
			document.title = "Add New Project" + global.titlePostfix;

			$scope.selectProjectFeedback = "";

			jQuery(".nav .js-admin-projects").removeClass("active");
			jQuery(".nav .js-admin-new-project").addClass("active");

			fn.setUpProjectForm();
			fn.initNewProject();
			fn.hideLoading();
		},

		initNewProject: function() {
			$scope.selectedProject = {
				Name: "",
				Skills: [],
				LongDescription: "",
				ShortDescription: "",
				Link: "",
				GitHub: "",
				Download: "",
				Date: "",
				Colour: "",
				Images: []
			};
		},

		gotProjects: function(response) {
			document.title = "Projects (" + $scope.currentPage + ")" + global.titlePostfix;

			jQuery(".project-view").hide();
			jQuery(".project-select, .nav, .project-select__add-button").show();
			jQuery(".nav .js-admin-projects").addClass("active");
			jQuery(".nav .js-admin-new-project").removeClass("active");

			$scope.selectedProject = undefined;

			// Check the data doesn't exist check there's no feedback
			if (response && response.meta.ok && response.rows.length <= 0 && !response.meta.feedback) {

				// Assume there's no error and no projects to show
				fn.showProjectSelectError("Sorry, no Projects to show.");
				$scope.projects = [];
			}
			else if (response && response.rows && response.rows.length > 0) {
				$scope.projects = response.rows;
				$scope.pages = [];

				var pages = Math.ceil(response.meta.total_count / 10);
				for (var i = 1; i <= pages; i++) {
					$scope.pages.push(i);
				}

				fn.hideLoading();
			}

			jpi.helpers.delayExpandingSection();
		},

		getProjectList: function(page, addToHistory) {
			fn.showLoading();

			$scope.selectProjectFeedback = "";

			$scope.currentPage = page;

			jpi.dnd.stop();

			if (addToHistory !== false) {
				fn.setURl("projects/" + page);
			}

			// Sends a object with necessary data to XHR
			fn.doAjaxCall(
				"projects",
				"GET",
				fn.gotProjects,
				function(response) {
					fn.showProjectSelectError(fn.getFeedback(response, "Error getting projects."));
				},
				{page: $scope.currentPage}
			);
		},

		onSuccessfulProjectGet: function(response) {
			if (response && response.meta && response.meta.ok && response.row) {
				$scope.selectProject(response.row);
				fn.setUpEditProject();
				fn.hideLoading();
			}
		},

		onFailedProjectGet: function(response) {
			fn.showProjectSelectError(fn.getFeedback(response, "Sorry, no Project found with ID: " + id + "."));
			jQuery(".project-select, .nav").show();
			jQuery(".project-select__add-button").hide();
		},

		getAndEditProject: function(id) {
			fn.doAjaxCall("projects/" + id, "GET", fn.onSuccessfulProjectGet, fn.onFailedProjectGet);
		},

		onSuccessfulAuthCheck: function(response, successFunc, messageOverride) {
			if (response && response.meta && response.meta.status && response.meta.status == 200) {
				$scope.loggedIn = true;
				successFunc();
			}
			else {
				fn.showLoginForm(response, redirectTo, messageOverride);
			}
		},

		// After user has attempted to log in
		loggedIn: function(response) {
			// Check if data was valid
			if (response && response.meta && response.meta.status && response.meta.status == 200) {

				fn.setJwt(response.meta.jwt);

				// Make the log in/sign up form not visible
				jQuery(".login").hide();
				jQuery(".nav").show();

				$scope.loggedIn = true;

				if (!global.redirectTo) {
					global.redirectTo = "projects/1";
				}
				
				fn.setURl(global.redirectTo);
				fn.loadApp();
				global.redirectTo = null;
			}
			// Check if feedback was provided or generic error message
			else {
				$scope.userFormFeedback = fn.getFeedback(response, "Error logging you in.");
				fn.hideLoading();
			}
		},

		onFailedLogin: function(response) {
			$scope.userFormFeedback = fn.getFeedback(response, "Error logging you in.");

			if ($scope.userFormFeedback !== "") {
				jQuery(".login__feedback").removeClass("feedback--success").addClass("feedback--error");
			}

			fn.hideLoading();
		},

		showLoginForm: function(response, redirectTo, messageOverride) {
			document.title = "Login" + global.titlePostfix;

			jQuery(".project-select, .project-view, .nav").hide();
			jQuery(".login").show();

			if (typeof messageOverride != "undefined") {
				$scope.userFormFeedback = messageOverride;
			}
			else {
				$scope.userFormFeedback = fn.getFeedback(response, "You need to be logged in!");
			}

			var success = false;
			if (response && response.meta && response.meta.status) {
				success = response.meta.status == 200 || response.meta.status == 201;
			}

			if (success) {
				jQuery(".login__feedback").removeClass("feedback--error").addClass("feedback--success");
			}
			else {
				jQuery(".login__feedback").removeClass("feedback--success").addClass("feedback--error");
			}
			fn.hideLoading();

			jpi.helpers.delayExpandingSection();

			global.redirectTo = redirectTo;
			fn.setURl("login");
		},
		
		callLogout: function () {
			fn.doAjaxCall(
				"logout",
				"DELETE",
				function(response) {
					if (response && response.meta && response.meta.status && response.meta.status == 200) {
						fn.setJwt("");
						fn.showLoginForm(response);
					}
				}
			);
		},

		logout: function(e) {
			e.preventDefault();
			e.stopPropagation();
			fn.callLogout();
			return false;
		},

		hideLoading: function() {
			jQuery(".js-loading").css({
				opacity: "0"
			});

			setTimeout(function() {
				jQuery(".js-loading").css({
					zIndex: "-10"
				});
			}, 1000);
		},

		showLoading: function() {
			jQuery(".js-loading").css({
				opacity: "1",
				zIndex: "10"
			});

			$scope.hideProjectError();
		},

		initialLogin: function() {
			$scope.checkAuthStatus(function() {
				fn.getProjectList(1);
			}, null, "");
		},

		loadApp: function() {
			var path = global.url.pathname.substring(1).split("/"),
				root = path[0] ? path[0] : "",
				func,
				redirectTo;

			// Check what page should be shown
			if (root === "projects" && !path[2]) {
				var pageNum = 1;
				if (path[1] && Number.isInteger(parseInt(path[1]))) {
					pageNum = parseInt(path[1], 10);
				}
				func = function() {
					fn.getProjectList(pageNum, false);
				};
				redirectTo = "projects/" + pageNum;
			}
			else if (root === "project" && path[1]) {
				if (path[1] === "add" && !path[2]) {
					func = fn.setUpAddProject;
					redirectTo = "project/add";
				}
				else if (Number.isInteger(parseInt(path[1])) && path[2] && path[2] === "edit" && !path[3]) {
					var id = parseInt(path[1], 10);
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
			jQuery(".admin-page").on("click", ".js-hide-error", $scope.hideProjectError);

			jQuery(".admin-page").on("click", ".js-admin-logout", fn.logout);

			jQuery(".admin-page").on("click", ".js-admin-projects", function(e) {
				e.preventDefault();
				e.stopPropagation();

				var page = jQuery(this).attr("data-page");
				if (!page) {
					page = 1;
				}

				$scope.checkAuthStatus(function() {
					fn.getProjectList(page);
				}, "projects/" + page);
			});

			jQuery(".admin-page").on("click", ".js-admin-new-project", function(e) {
				e.preventDefault();
				e.stopPropagation();

				$scope.checkAuthStatus(function() {
					fn.setURl("project/add");
					fn.setUpAddProject();
				}, "project/add");
			});

			jQuery(".admin-page").on("click", ".js-admin-edit-project", function(e) {
				e.preventDefault();
				e.stopPropagation();

				var id = $scope.selectedProject ? $scope.selectedProject.ID : null;

				$scope.checkAuthStatus(function() {

					if (id) {
						fn.setURl("project/" + id + "/edit");
					}

					fn.setUpEditProject();
				}, "project/" + id + "/edit");
			});

			window.addEventListener("popstate", function() {
				fn.showLoading();
				global.url = new URL(window.location);
				fn.loadApp();
			});
		},

		initVariables: function() {
			$scope.loggedIn = false;
			$scope.projects = $scope.pages = $scope.uploads = [];
			$scope.currentPage = 1;
			$scope.userFormFeedback = $scope.selectProjectFeedback = $scope.projectFormFeedback = $scope.skillInput = "";
		},

		init: function() {
			fn.getJwtFromStorage();
			fn.showLoading();
			fn.initVariables();
			fn.initNewProject();
			fn.initListeners();

			jQuery(".main-content").css("padding-top", jQuery("nav").height());

			jQuery(".login, .project-view, .project-select").hide();

			fn.loadApp();
		}
	};


	/*
	 * Any functions used in HTML (and JS)
	 */

	$scope.checkAuthStatus = function(successFunc, redirectTo, messageOverride) {
		fn.doAjaxCall(
			"session",
			"GET",
			function(response) {
				fn.onSuccessfulAuthCheck(response, successFunc, messageOverride);
			},
			function(response) {
				fn.showLoginForm(response, redirectTo, messageOverride);
			});
	};

	$scope.hideProjectError = function() {
		jQuery(".project__feedback").addClass("hide");
	};

	// Send a newly uploaded image to API
	$scope.sendImage = function(upload) {
		fn.showLoading();

		$scope.checkAuthStatus(function() {
			var form = new FormData();
			// Add the image
			form.append("image", upload.file);

			$http.post(
				jpi.config.jpiAPIEndpoint + "projects/" + $scope.selectedProject.ID + "/images/",
				form,
				{
					transformRequest: angular.identity,
					headers: {
						"Content-Type": undefined,
						"Process-Data": false,
						Authorization: "Bearer " + global.jwt
					}
				}
			).then(function(response) {
				fn.sendAjaxResponse(response, fn.onSuccessfulProjectImageUpload);
			}, function(response) {
				fn.sendAjaxResponse(response,
					function(response) {
						var message = fn.getFeedback(response, "Error uploading the Project Image.");
						fn.showProjectError(message, "feedback--error");
					}
				);
			});
		});
	};

	$scope.checkFile = function(file) {
		var fileReader;

		// Check if file is a image
		if (file.type.includes("image/")) {

			// Gets image
			fileReader = new FileReader();

			fileReader.onload = function(e) {
				$scope.uploads.push({ok: true, text: file.name, image: e.target.result, file: file});
				$scope.$apply();
				jpi.helpers.delayExpandingSection();
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

		fn.doAjaxCall(
			"projects/" + projectImage.ProjectID + "/images/" + projectImage.ID,
			"DELETE",
			fn.onSuccessfulProjectImageDeletion,
			function(response) {
				var message = fn.getFeedback(response, "Error deleting the Project Image.");
				fn.showProjectError(message, "feedback--error");
			}
		);
	};

	$scope.addSkill = function() {
		$scope.selectedProject.Skills.push($scope.skillInput);
		$scope.skillInput = "";
	};

	$scope.deleteSkill = function(skill) {
		var index = $scope.selectedProject.Skills.indexOf(skill);
		$scope.selectedProject.Skills.splice(index, 1);
	};

	$scope.submitProject = function() {
		fn.showLoading();

		var validDatePattern = /\b[\d]{4}-[\d]{2}-[\d]{2}\b/im,

			projectNameValidation = jpi.helpers.checkInputField(jQuery("#projectName")[0]),
			longDescriptionValidation = jpi.helpers.checkInputField(jQuery("#longDescription")[0]),
			shortDescriptionValidation = jpi.helpers.checkInputField(jQuery("#shortDescription")[0]),
			githubValidation = jpi.helpers.checkInputField(jQuery("#github")[0]),
			dateValidation = jpi.helpers.checkInputField(jQuery("#date")[0]) && validDatePattern.test(jQuery("#date").val()),
			skillsValidation = $scope.selectedProject.Skills.length > 0;

		if (!skillsValidation) {
			jQuery(".project__skill-input").addClass("invalid").removeClass("valid");
		}
		else {
			jQuery(".project__skill-input").addClass("valid").removeClass("invalid");
		}

		if (projectNameValidation && skillsValidation && longDescriptionValidation && shortDescriptionValidation && githubValidation && dateValidation) {

			var id = $scope.selectedProject.ID ? $scope.selectedProject.ID : "",
				method = $scope.selectedProject.ID ? "PUT" : "POST",
				data = {
				Name: $scope.selectedProject.Name ? $scope.selectedProject.Name : "",
				Skills: $scope.selectedProject.Skills ? $scope.selectedProject.Skills.join(",") : "",
				LongDescription: $scope.selectedProject.LongDescription ? $scope.selectedProject.LongDescription : "",
				ShortDescription: $scope.selectedProject.ShortDescription ? $scope.selectedProject.ShortDescription : "",
				Link: $scope.selectedProject.Link ? $scope.selectedProject.Link : "",
				GitHub: $scope.selectedProject.GitHub ? $scope.selectedProject.GitHub : "",
				Download: $scope.selectedProject.Download ? $scope.selectedProject.Download : "",
				Date: $scope.selectedProject.Date ? $scope.selectedProject.Date : "",
				Colour: $scope.selectedProject.Colour ? $scope.selectedProject.Colour : "",
				Images: $scope.selectedProject.Images ? angular.toJson($scope.selectedProject.Images) : []
			};

			fn.doAjaxCall("projects/" + id, method, fn.onSuccessfulProjectUpdate, fn.onFailedProjectUpdate, data);
		}
		else {
			var message = "Fill in Required Inputs Fields.";
			fn.showProjectError(message, "feedback--error");

			setTimeout(function() {
				var firstInvalidInput = jQuery(".project__form .invalid").first(),
					id = firstInvalidInput.attr("id"),

					pos = jQuery("label[for=" + id + "]").offset().top,
					navHeight = jQuery(".nav").outerHeight(),
					feedbackHeight = jQuery(".project__feedback").outerHeight();

				jQuery("html, body").animate({
					scrollTop: pos - navHeight - feedbackHeight - 16
				}, 1000);

			}, 400);
		}
	};

	$scope.deleteProject = function() {
		fn.showLoading();

		$scope.selectProjectFeedback = "";
		if ($scope.selectedProject && $scope.selectedProject.ID) {

			fn.doAjaxCall(
				"projects/" + $scope.selectedProject.ID,
				"DELETE",
				fn.onSuccessfulProjectDeletion,
				function (response) {
					fn.showProjectSelectError(fn.getFeedback(response, "Error deleting your project."));
				}
			);
		}
		else {
			fn.showProjectSelectError("Select A Project To Delete.");
		}

		jpi.helpers.delayExpandingSection();
	};

	$scope.selectProject = function(project) {
		project.Date = new Date(project.Date);

		if (typeof project.Skills == "string") {
			project.Skills = project.Skills.split(",");
		}

		$scope.selectedProject = project;
	};

	$scope.logIn = function() {
		fn.showLoading();

		var usernameValid = jpi.helpers.checkInputField(jQuery("#username")[0]),
			passwordValid = jpi.helpers.checkInputField(jQuery("#password")[0]);

		// Check if both inputs are empty
		if (!usernameValid && !passwordValid) {
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
		// Else both inputs are filled
		else {
			var data = {username: $scope.username, password: $scope.password};

			fn.doAjaxCall("login", "POST", fn.loggedIn, fn.onFailedLogin, data);
		}
	};

	/*
	 * Allow some selective functions to be window scoped (So it can be used in other JS files)
	 */
	window.jpi = window.jpi || {};
	window.jpi.admin = {
		checkFile: $scope.checkFile,
		renderFailedUpload: fn.renderFailedUpload
	};

	jQuery(document).on("ready", fn.init);
});