var app = angular.module('projectsAdmin', ['ui.sortable']);

app.directive("fileUpload", function () {
	return {
		restrict: 'A',
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

app.controller('projectsAdminController', function ($scope, $http) {

	/*
	 * Any global variables used in multiple places with JS
	 */
	var global = {
		apiBase: "/api/v2/",
		url: new URL(window.location),
		baseURL: "admin/",
		redirectTo: null,
		titlePostfix: " - JPI Admin"
	};

	/*
	 * Any Functions only used within JS
	 */
	var fn = {

		getFeedback: function (result, genericFeedback) {
			if (result && result.data && result.data.meta && result.data.meta.feedback) {
				return result.data.meta.feedback;
			}
			else {
				return genericFeedback;
			}
		},

		showProjectError: function (message, classToAdd) {
			jQuery(".project__feedback").removeClass("feedback--error feedback--success hide").addClass(classToAdd);
			$scope.projectFormFeedback = message;
		},

		showProjectSelectError: function (feedback, classToAdd) {
			if (!classToAdd) classToAdd = "feedback--error";
			jQuery(".project-select__feedback").removeClass("feedback--error feedback--success").addClass(classToAdd);
			$scope.selectProjectFeedback = feedback;
		},

		//set image as failed upload div to display error
		renderFailedUpload: function (errorMessage) {
			$scope.uploads.push({ok: false, text: errorMessage});
			$scope.$apply();
			jpi.footer.delayExpand();
		},

		//render a project image delete
		deletedProjectImage: function (result) {
			$scope.hideProjectError();

			var message = "Error deleting the Project Image.";
			var feedbackClass = "feedback--error";

			//check if the deletion of project image has been processed
			if (result.data.rows && result.data.rows.id) {

				var i = 0, found = false;
				//find and remove the image
				for (i = 0; i < $scope.selectedProject.Pictures.length; i++) {
					if ($scope.selectedProject.Pictures[i]["ID"] === result.data.rows.id) {
						var pictureToDelete = $scope.selectedProject.Pictures[i];
						var index = $scope.selectedProject.Pictures.indexOf(pictureToDelete);
						if (index > -1) {
							$scope.selectedProject.Pictures.splice(index, 1);
						}
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

			jpi.footer.delayExpand();

			fn.hideLoading();
		},

		renderProjectDelete: function (result) {
			$scope.selectProjectFeedback = "";
			var defaultFeedback = "Error deleting your project.";

			var feedbackClass = "feedback--error";
			//check if project delete has been processed
			if (result.data.rows && result.data.rows.projectID) {

				defaultFeedback = "Successfully deleted the Project identified by: " + result.data.rows.projectID + ".";
				feedbackClass = "feedback--success";
				fn.getProjectList(1);
			}

			fn.showProjectSelectError(fn.getFeedback(result, defaultFeedback), feedbackClass);
			jpi.footer.delayExpand();
			fn.hideLoading();
		},

		setUpProjectForm: function () {
			$scope.skillInput = "";

			jQuery(".project-view, .nav").show();
			jQuery(".project-select").hide();
			$scope.hideProjectError();

			jQuery("#projectName, #skill-input, #longDescription, #shortDescription, #github, #date").removeClass("invalid valid");

			jpi.footer.delayExpand();
		},

		setUpEditProject: function () {

			$scope.selectProjectFeedback = "";

			if ($scope.selectedProject && $scope.selectedProject.ID) {
				document.title = "Edit Project (" + $scope.selectedProject.ID + ")" + global.titlePostfix;

				jpi.dnd.setUp();
				fn.setUpProjectForm();
				$(".project__uploads").sortable();
				$(".project__uploads").disableSelection();
			}
			else {
				fn.showProjectSelectError("Select A Project To Update.");
			}
		},

		setUpAddProject: function () {

			document.title = "Add New Project" + global.titlePostfix;

			$scope.selectProjectFeedback = "";

			jQuery(".nav .js-admin-projects").removeClass("active");
			jQuery(".nav .js-admin-new-project").addClass("active");

			fn.setUpProjectForm();

			fn.initNewProject();

			fn.hideLoading();
		},

		initNewProject: function () {
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
				Pictures: []
			};
		},

		gotProjects: function (result) {
			document.title = "Projects (" + $scope.currentPage + ")" + global.titlePostfix;
			jQuery(".project-view").hide();

			jQuery(".project-select, .nav, .project-select__add-button").show();

			jQuery(".nav .js-admin-projects").addClass("active");
			jQuery(".nav .js-admin-new-project").removeClass("active");

			$scope.selectedProject = undefined;

			//check if data doesn't exist check there's no feedback
			if (result.data.meta.ok && result.data.rows.length <= 0 && !result.data.meta.feedback) {

				//assume there's no error and no projects to show
				fn.showProjectSelectError("Sorry, no Projects to show.");
				$scope.projects = [];
			}
			else if (result.data.rows.length > 0) {
				$scope.projects = result.data.rows;
				$scope.pages = [];

				var pages = Math.ceil(result.data.count / 10);

				for (var i = 1; i <= pages; i++) {
					$scope.pages.push(i);
				}
			}

			jpi.footer.delayExpand();

			fn.hideLoading();
		},

		getProjectList: function (page, addToHistory) {
			fn.showLoading();

			$scope.hideProjectError();

			$scope.selectProjectFeedback = "";

			$scope.currentPage = page;

			jpi.dnd.stop();

			if (addToHistory !== false) {
				global.url.pathname = global.baseURL + "projects/" + page + "/";
				history.pushState(null, null, global.url.toString());
			}

			//Sends a object with necessary data to XHR
			$http({
				url: global.apiBase + "projects",
				method: "GET",
				params: {page: $scope.currentPage}
			}).then(fn.gotProjects, function (result) {
				fn.showProjectSelectError(fn.getFeedback(result, "Error getting projects."));
				fn.hideLoading();
			});
		},

		getAndEditProject: function (id) {
			$http({
				url: global.apiBase + "projects/" + id,
				method: "GET"
			}).then(function (result) {
				if (result.data.meta.ok && result.data.rows.length > 0) {
					$scope.selectProject(result.data.rows[0]);
					fn.setUpEditProject();
					fn.hideLoading();
				}
			}, function (result) {
				fn.showProjectSelectError(fn.getFeedback(result, "Sorry, no Project found with ID: " + id + "."));
				jQuery(".project-select, .nav").show();
				jQuery(".project-select__add-button").hide();
				fn.hideLoading()
			});
		},

		//after user has attempted to log in
		loggedIn: function (result) {

			//check if data was valid
			if (result.data.meta.status && result.data.meta.status == 200) {

				//make the log in/sign up form not visible
				jQuery(".login").hide();
				jQuery(".nav").show();

				$scope.loggedIn = true;

				if (!global.redirectTo) {
					global.redirectTo = "projects/1/";
				}

				global.url.pathname = global.baseURL + global.redirectTo;
				history.pushState(null, null, global.url.toString());
				fn.loadApp();
				global.redirectTo = null;
			}
			//check if feedback was provided or generic error message
			else {
				$scope.userFormFeedback = fn.getFeedback(result, "Error logging you in.");
				fn.hideLoading();
			}
		},

		showLoginForm: function (result, redirectTo, messageOverride) {

			document.title = "Login" + global.titlePostfix;

			jQuery(".project-select, .project-view, .nav").hide();
			jQuery(".login").show();

			if (typeof messageOverride != "undefined") {
				$scope.userFormFeedback = messageOverride;
			}
			else {
				$scope.userFormFeedback = fn.getFeedback(result, "You need to be logged in!");
			}

			var success = false;

			if (result && result.data && result.data.meta && result.data.meta.status) {
				success = result.data.meta.status == 200 || result.data.meta.status == 201;
			}

			if (success) {
				jQuery(".login__feedback").removeClass("feedback--error").addClass("feedback--success");
			}
			else {
				jQuery(".login__feedback").removeClass("feedback--success").addClass("feedback--error");
			}
			fn.hideLoading();

			jpi.footer.delayExpand();

			global.redirectTo = redirectTo;
			global.url.pathname = global.baseURL + "login/";
			history.pushState(null, null, global.url.toString());
		},

		logout: function (e) {
			e.preventDefault();
			e.stopPropagation();

			$http({
				url: global.apiBase + "logout",
				method: "GET"
			}).then(function (result) {
				if (result.data.meta.status && result.data.meta.status == 200) {
					fn.showLoginForm(result);
				}
			});

			return false;
		},

		hideLoading: function () {
			jQuery(".js-loading").css({
				opacity: "0"
			});

			setTimeout(function () {
				jQuery(".js-loading").css({
					zIndex: "-10"
				});
			}, 1000);
		},

		showLoading: function () {
			jQuery(".js-loading").css({
				opacity: "1",
				zIndex: "10"
			});
		},

		initialLogin: function () {
			$scope.checkAuthStatus(function () {
				fn.getProjectList(1);
			}, null, '');
		},

		loadApp: function () {
			var path = global.url.pathname.substring(1).split('/');

			if (path[1]) {
				var root = path[1];

				//check what page should be shown
				if (root === "projects") {
					var pageNum = 1;
					if (path[2] && Number.isInteger(parseInt(path[2]))) {
						pageNum = parseInt(path[2], 10);
					}
					$scope.checkAuthStatus(function () {
						fn.getProjectList(pageNum, false);
					}, "projects/" + pageNum + "/");
				}
				else if (root === "project" && path[2]) {
					if (path[2] === "add") {
						$scope.checkAuthStatus(fn.setUpAddProject, "project/add/");
					}
					else if (Number.isInteger(parseInt(path[2])) && path[3] && path[3] === "edit") {
						$scope.checkAuthStatus(function () {
							fn.getAndEditProject(parseInt(path[2], 10));
						}, "project/" + parseInt(path[2], 10) + "/edit");
					}
				}
				else {
					fn.initialLogin();
				}
			}
			else {
				fn.initialLogin();
			}
		},

		initListeners: function () {
			jQuery(".admin-page").on("click", ".js-hide-error", $scope.hideProjectError);

			jQuery(".admin-page").on("click", ".js-admin-logout", fn.logout);

			jQuery(".admin-page").on("click", ".js-admin-projects", function (e) {
				e.preventDefault();
				e.stopPropagation();

				var page = jQuery(this).attr("data-page");
				if (!page) {
					page = 1;
				}

				$scope.checkAuthStatus(function () {
					fn.getProjectList(page);
				}, "projects/" + page + "/");
			});

			jQuery(".admin-page").on("click", ".js-admin-new-project", function (e) {
				e.preventDefault();
				e.stopPropagation();

				$scope.checkAuthStatus(function () {
					global.url.pathname = global.baseURL + "project/add/";
					history.pushState(null, null, global.url.toString());
					fn.setUpAddProject();
				}, "project/add/");
			});

			jQuery(".admin-page").on("click", ".js-admin-edit-project", function (e) {
				e.preventDefault();
				e.stopPropagation();

				var id = $scope.selectedProject ? $scope.selectedProject.ID : null;

				$scope.checkAuthStatus(function () {

					if (id) {
						global.url.pathname = global.baseURL + "project/" + id + "/edit";
						history.pushState(null, null, global.url.toString());
					}

					fn.setUpEditProject();
				}, "project/" + id + "/edit");
			});

			window.addEventListener('popstate', function () {
				fn.showLoading();
				global.url = new URL(window.location);
				fn.loadApp();
			});
		},

		initVariables: function () {
			$scope.loggedIn = false;
			$scope.projects = $scope.pages = $scope.uploads = [];
			$scope.currentPage = 1;

			$scope.userFormFeedback = $scope.selectProjectFeedback = $scope.projectFormFeedback = $scope.skillInput = "";
		},

		init: function () {
			fn.showLoading();

			fn.initVariables();

			fn.initNewProject();

			fn.initListeners();

			jQuery('.main-content').css("padding-top", jQuery('nav').height());

			jQuery(".login, .project-view, .project-select").hide();

			fn.loadApp();
		}
	};


	/*
	 * Any functions used in HTML (and JS)
	 */


	$scope.checkAuthStatus = function (successFunc, redirectTo, messageOverride) {
		$http({
			url: global.apiBase + "session",
			method: "GET"
		}).then(function (result) {
			if (result.data.meta.status && result.data.meta.status == 200) {
				$scope.loggedIn = true;
				successFunc();
			}
			else {
				fn.showLoginForm(result, redirectTo, messageOverride);
			}
		}, function (result) {
			fn.showLoginForm(result, redirectTo, messageOverride);
		});
	};

	$scope.hideProjectError = function () {
		jQuery(".project__feedback").addClass("hide");
	};

	//send a image to API
	$scope.sendImage = function (upload) {

		fn.showLoading();
		$scope.hideProjectError();

		$scope.checkAuthStatus(function () {
			var form = new FormData();
			//add the picture
			form.append("picture", upload.file);

			$http.post(global.apiBase + "projects/" + $scope.selectedProject.ID + "/pictures/", form, {
				transformRequest: angular.identity,
				headers: {'Content-Type': undefined, 'Process-Data': false}
			}).then(function (result) {
				$scope.selectedProject.Pictures.push(result.data.rows[0]);
				var index = $scope.uploads.indexOf(upload);
				if (index > -1) {
					$scope.uploads.splice(index, 1);
				}

				var message = "Successfully added a new project image";
				fn.showProjectError(message, "feedback--success");
				fn.hideLoading();

			}, function (result) {
				var message = fn.getFeedback(result, "Error uploading the Project Image.");
				fn.showProjectError(message, "feedback--error");
				fn.hideLoading();
			});
		});
	};

	$scope.checkFile = function (file) {

		var fileReader;

		//checks if file is a image
		if (file.type.includes("image/")) {

			//gets image
			fileReader = new FileReader();

			fileReader.onload = function (e) {
				$scope.uploads.push({ok: true, text: file.name, image: e.target.result, file: file});
				$scope.$apply();
				jpi.footer.delayExpand();
			};

			fileReader.onerror = function () {
				fn.renderFailedUpload("Error getting " + file.name);
			};

			fileReader.readAsDataURL(file);
		}
		//else it isn't a image so show its failed
		else {
			fn.renderFailedUpload(file.name + " isn't a image.");
		}
	};

	//send a request to delete a project image
	$scope.deleteProjectImage = function (projectImage) {

		fn.showLoading();

		$scope.hideProjectError();

		$scope.checkAuthStatus(function () {
			$http({
				url: global.apiBase + "projects/" + projectImage.ProjectID + "/pictures/" + projectImage.ID,
				method: "DELETE"
			}).then(fn.deletedProjectImage, function (result) {
				var message = fn.getFeedback(result, "Error deleting the Project Image.");
				fn.showProjectError(message, "feedback--error");
				fn.hideLoading();
			});
		});
	};

	$scope.addSkill = function () {
		$scope.selectedProject.Skills.push($scope.skillInput);
		$scope.skillInput = "";
	};

	$scope.deleteSkill = function (skill) {
		var index = $scope.selectedProject.Skills.indexOf(skill);
		$scope.selectedProject.Skills.splice(index, 1);
	};

	$scope.submitProject = function () {

		fn.showLoading();
		$scope.hideProjectError();

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
			var method = "PUT";
			var wasUpdate = true;
			if (!$scope.selectedProject.ID) {
				$scope.selectedProject.ID = "";
				method = "POST";
				wasUpdate = false;
			}

			$scope.selectedProject.Pictures.forEach(function (picture, i) {
				picture.Number = i + 1;
			});

			$http({
				url: global.apiBase + "projects/" + $scope.selectedProject.ID,
				method: method,
				params: {
					projectName: $scope.selectedProject.Name ? $scope.selectedProject.Name : "",
					skills: $scope.selectedProject.Skills ? $scope.selectedProject.Skills.join(",") : "",
					longDescription: $scope.selectedProject.LongDescription ? $scope.selectedProject.LongDescription : "",
					shortDescription: $scope.selectedProject.ShortDescription ? $scope.selectedProject.ShortDescription : "",
					link: $scope.selectedProject.Link ? $scope.selectedProject.Link : "",
					github: $scope.selectedProject.GitHub ? $scope.selectedProject.GitHub : "",
					download: $scope.selectedProject.Download ? $scope.selectedProject.Download : "",
					date: $scope.selectedProject.Date ? $scope.selectedProject.Date : "",
					colour: $scope.selectedProject.Colour ? $scope.selectedProject.Colour : "",
					pictures: $scope.selectedProject.Pictures ? angular.toJson($scope.selectedProject.Pictures) : []
				}
			}).then(function (result) {
				result.data.rows[0].Date = new Date(result.data.rows[0].Date);

				if (typeof  result.data.rows[0].Skills == "string") {
					result.data.rows[0].Skills = result.data.rows[0].Skills.split(",");
				}

				$scope.selectedProject = result.data.rows[0];

				if (!wasUpdate) {
					global.url.pathname = global.baseURL + "project/" + $scope.selectedProject.ID + "/edit";
					history.pushState(null, null, global.url.toString());
					fn.setUpEditProject();
				}

				var typeSubmit = (wasUpdate) ? "updated" : "saved";
				var defaultFeedback = "Successfully " + typeSubmit + " project.";
				var message = fn.getFeedback(result, defaultFeedback);
				fn.showProjectError(message, "feedback--success");

				fn.hideLoading();
			}, function (result) {
				var typeSubmit = (!$scope.selectedProject.ID) ? "saving" : "updating";
				var defaultFeedback = "Error  " + typeSubmit + " the project.";

				var message = fn.getFeedback(result, defaultFeedback);
				fn.showProjectError(message, "feedback--error");
				fn.hideLoading();
			});

		}
		else {
			var message = "Fill in Required Inputs Fields.";
			fn.showProjectError(message, "feedback--error");

			setTimeout(function () {
				var firstInvalidInput = jQuery(".project__form .invalid").first();
				var id = firstInvalidInput.attr("id");
				var pos = jQuery("label[for=" + id + "]").offset().top;
				var navHeight = jQuery(".nav").outerHeight();
				var feedbackHeight = jQuery(".project__feedback").outerHeight();
				jQuery('html, body').animate({
					scrollTop: pos - navHeight - feedbackHeight - 16
				}, 1000);
			}, 400);

			fn.hideLoading();
		}
	};

	$scope.deleteProject = function () {

		fn.showLoading();

		$scope.selectProjectFeedback = "";
		if ($scope.selectedProject && $scope.selectedProject.ID) {
			$http({
				url: global.apiBase + "projects/" + $scope.selectedProject.ID,
				method: "DELETE"
			}).then(fn.renderProjectDelete, function (result) {
				fn.showProjectSelectError(fn.getFeedback(result, "Error deleting your project."));
				fn.hideLoading();
			});
		}
		else {
			fn.showProjectSelectError("Select A Project To Delete.");
			fn.hideLoading();
		}

		jpi.footer.delayExpand();
	};

	$scope.selectProject = function (project) {
		$scope.selectedProject = project;

		if (typeof project.Skills == "string") {
			$scope.selectedProject.Skills = project.Skills.split(",");
		}

		$scope.selectedProject.Date = new Date(project.Date);
	};

	$scope.logIn = function () {
		fn.showLoading();

		var usernameValid = jpi.helpers.checkInputField(jQuery("#username")[0]),
			passwordValid = jpi.helpers.checkInputField(jQuery("#password")[0]);

		//checks if inputs both are empty
		if (!usernameValid && !passwordValid) {
			$scope.userFormFeedback = "Input fields needs to be filled.";
		}
		//else checks if username input is empty
		else if (!usernameValid) {
			$scope.userFormFeedback = "Username field needs to be filled.";
		}
		//else checks if password input is empty
		else if (!passwordValid) {
			$scope.userFormFeedback = "Password field needs to be filled.";
		}
		//else inputs are filled
		else {
			$http({
				url: global.apiBase + "login",
				method: "POST",
				params: {username: $scope.username, password: $scope.password}
			}).then(fn.loggedIn, function (result) {
				$scope.userFormFeedback = fn.getFeedback(result, "Error logging you in.");

				if ($scope.userFormFeedback !== "") {
					jQuery(".login__feedback").removeClass("feedback--success").addClass("feedback--error");
				}

				fn.hideLoading();
			});
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