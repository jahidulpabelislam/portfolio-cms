<?php include_once($_SERVER["DOCUMENT_ROOT"] . "/config.php"); ?>

<!DOCTYPE html>
<html lang="en" ng-app="projectsAdmin">
	<head>
		<meta charset="UTF-8"/>
		<meta name="author" content="Jahidul Pabel Islam"/>
		<meta name="viewport" content="width=device-width, initial-scale=1"/>
		<title>JPI Admin</title>

		<!-- The custom styling for this page -->
		<?php if (!isset($_GET["debug"])): ?>
			<link href="/assets/css/main.min.css?v=1" rel="stylesheet" title="style" media="all" type="text/css">
		<?php else: ?>
			<link href="/assets/css/style.css?v=1" rel="stylesheet" title="style" media="all" type="text/css">
		<?php endif; ?>

		<link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet" title="style" media="all" type="text/css">

		<?php
		include_once($_SERVER["DOCUMENT_ROOT"] . "/partials/favicons.php");
		?>
	</head>

	<body ng-controller="projectsAdminController" class="admin-page">

		<!-- The navigation used on site -->
		<nav class="nav nav--dark">
			<div class="container nav__container">
				<div class="nav__header">
					<button type="button" class="nav__mobile-toggle">
						<span class="screen-reader-text">Toggle navigation</span>
						<span class="menu-bar menu-bar--top"></span>
						<span class="menu-bar menu-bar--middle"></span>
						<span class="menu-bar menu-bar--bottom"></span>
					</button>
				</div>
				<div class="nav__links-container">
					<ul class="nav__links clearfix">
						<li class="nav-link__item"><a href="/projects/1/" title="Link to Projects Page" class="nav-item__link js-admin-projects"><span class="screen-reader-text">Projects</span><i class="fa fa-list-ul"></i></a></li>
						<li class="nav-link__item"><a href="/project/new/" title="Link to New Project Form Page" class="nav-item__link js-admin-new-project"><span class="screen-reader-text">Add A Project</span><i class="fa fa-plus"></i></a></li>
					</ul>
				</div>
				<div class="nav__links-container nav__links-container--left">
					<ul class="nav__links clearfix">
						<li class="nav-link__item"><a href="/logout/" title="Link to Logout Page" class="nav-item__link js-admin-logout"><span class="screen-reader-text">Logoutt</span><i class="fa fa-times-circle"></i></a></li>
					</ul>
				</div>
			</div>
		</nav>

		<main class="main-content">
			<div class="container">
				<div class="project-select">

					<div class="project-select__form">
						<div ng-repeat="project in projects" class="project-select__option styled-checkbox">
							<label ng-click="selectProject(project)" for="{{project.ID}}">{{project.Name}}<input type="radio" id="{{project.ID}}" name="project" value="{{project.ID}}" class="input"><span class="styled-checkbox__pseudo js-styled-checkout"></span></label>
						</div>
					</div>

					<p class="feedback feedback--error project-select__feedback" ng-show="selectProjectFeedback">{{selectProjectFeedback}}</p>

					<div>
						<a href="/project/{{ selectedProject.ID }}/edit/" title="Link to Edit Project Form Page" ng-show="projects.length > 0" ng-disabled="!selectedProject.ID" class="btn btn--blue project-select__edit-button js-admin-edit-project" tabindex="3"><span class="screen-reader-text">Edit</span><i class="fa fa-edit"></i></a>
						<button ng-show="projects.length > 0" ng-click="checkAuthStatus(deleteProject)" type="button" value="Delete" class="btn btn--red project-select__delete-button" tabindex="4"><span class="screen-reader-text">Delete</span><i class="fa fa-trash"></i></button>
						<a href="/project/new/" title="Link to New Project Form Page" class="btn btn--green project-select__add-button js-admin-new-project" tabindex="5"><span class="screen-reader-text">Add A Project</span><i class="fa fa-plus"></i></a>
					</div>

					<ul class="pagination pagination--admin" ng-show="pages.length > 1">
						<li ng-repeat="page in pages" class="pagination__item"><a href="/projects/{{ page }}/" title="Link to Projects Page" class="pagination__item-link js-admin-projects" ng-class="{'active': page == currentPage}" data-page="{{ page }}">{{ page }}</a></li>
					</ul>
				</div>

				<div class="project-view">
					<p class="feedback project__feedback hide"><span>{{projectFormFeedback}}</span><button class="project__hide-error" ng-click="hideProjectError()">X</button></p>

					<a href="/projects/" title="Link to Projects Page" class="btn btn--orange project__back-button js-admin-projects" tabindex="6"><span class="screen-reader-text">Back</span><i class="fa fa-arrow-circle-left"></i></a>

					<form id="projectForm" class="project__form" ng-submit="checkAuthStatus(submitProject)">
						<label for="projectName">Project Name <span class="required">*</span></label>
						<input ng-model="selectedProject.Name" type="text" name="projectName" id="projectName" class="input" placeholder="myproject" tabindex="7" oninput="jpi.helpers.checkInputField(this);" required>

						<label for="skill-input">Skills <span class="required">*</span></label>

						<div ng-model="selectedProject.Skills" ui-sortable class="ui-state-default">
							<p ng-repeat="skill in selectedProject.Skills" class="project__skill project__skill--{{selectedProject.Colour}}">{{skill}}<button class="btn project__skill-delete-button" ng-click="deleteSkill(skill)" type="button">x</button></p>
						</div>

						<div class="project__skill-input-container">
							<label for="skill-input" class="screen-reader-text">Add skills for project.</label>
							<input type="text" class="input project__skill-input" id="skill-input" placeholder="HTML5" ng-model="skillInput">
							<button class="btn btn--green project__skill-add-button" type="button" id="skill-add" ng-click="addSkill()" type="button"><span class="screen-reader-text">Add</span><i class="fa fa-plus"></i></button>
						</div>

						<label for="longDescription">Long Description <span class="required">*</span></label>
						<textarea ng-model="selectedProject.LongDescription" name="description" id="longDescription" class="input" placeholder="description" tabindex="9" oninput="jpi.helpers.checkInputField(this);" required rows="10"></textarea>

						<label for="shortDescription">Short Description <span class="required">*</span></label>
						<textarea ng-model="selectedProject.ShortDescription" name="description" id="shortDescription" class="input" placeholder="description" tabindex="9" oninput="jpi.helpers.checkInputField(this);" required rows="10"></textarea>

						<label for="link">Link</label>
						<input ng-model="selectedProject.Link" type="text" name="link" id="link" class="input" placeholder="link" tabindex="10">

						<label for="github">GitHub <span class="required">*</span></label>
						<input ng-model="selectedProject.GitHub" type="url" name="github" id="github" class="input" placeholder="github" tabindex="11" oninput="jpi.helpers.checkInputField(this);" required>

						<label for="download">Download</label>
						<input ng-model="selectedProject.Download" type="text" name="download" id="download" class="input" placeholder="download" tabindex="12">

						<label for="date">Date <span class="required">*</span></label>
						<input ng-model="selectedProject.Date" type="date" name="date" id="date" class="input" placeholder="2016-01-30" tabindex="13" oninput="jpi.helpers.checkInputField(this);" required>

						<label for="colour">Colour </label>
						<select ng-model="selectedProject.Colour" name="colour" id="colour" class="input" tabindex="14">
							<option value="">Default</option>
							<option value="blue">Blue</option>
							<option value="red">Red</option>
							<option value="orange">Orange</option>
							<option value="lime-green">Lime green</option>
							<option value="green">Green</option>
							<option value="purple">Purple</option>
						</select>

						<!-- Div containing all the project images -->
						<ul ui-sortable ng-model="selectedProject.Images" class="project__images-container ui-state-default">
							<li class="project__image-container" ng-repeat="image in selectedProject.Images" id="{{image.File}}">
								<img class="project__image" src="<?php echo rtrim(JPI_API_ENDPOINT, "/"); ?>{{image.File}}">
								<button ng-click="deleteProjectImage(image)" class="btn btn--red project__image-delete-button" type="button">X</button>
							</li>
						</ul>

						<button type="submit" value="Add Project" class="btn btn--green project__save-button" tabindex="14"><span class="screen-reader-text">{{selectedProject.ID ? "Update Project" : "Add Project"}}</span><i class="fa fa-upload"></i></button>

						<input ng-if="selectedProject.ID" data-file-Upload type="file" name="imageUpload" id="imageUpload" class="input" multiple accept="image/*" tabindex="15">

						<!-- Div containing the project image uploads -->
						<div class="project__uploads">
							<div ng-repeat="upload in uploads" class="project__upload" ng-class="upload.ok == true ? 'project__upload--success' : 'project__upload--failed'">
								<p>{{upload.text}}</p>
								<img ng-if="upload.ok == true" src="{{upload.image}}">
								<button ng-if="upload.ok == true" ng-click="sendImage(upload)" class="btn btn--blue" type="button"><span class="screen-reader-text">Upload This Image</span><i class="fa fa-upload"></i></button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</main>

		<!-- The drag and drop area -->
		<section class="js-drop-zone fixed-overlay"><h1 class="fixed-overlay__text">Drag And Drop Image Here To Upload A Slide for Project</h1></section>

		<!-- The login area -->
		<section class="login">
			<div class="container">
				<form class="login__form" ng-submit="logIn()">
					<label for="username">Username</label>
					<input ng-model="username" type="text" name="username" id="username" placeholder="myusername" autofocus class="input" tabindex="1" oninput="jpi.helpers.checkInputField(this);" required>
					<label for="password">Password</label>
					<input ng-model="password" type="password" name="password" id="password" placeholder="mypassword" class="input" tabindex="2" oninput="jpi.helpers.checkInputField(this);" required>
					<!-- Where the feedback will go if any error -->
					<p class="feedback feedback--error login__feedback" ng-show="userFormFeedback">{{userFormFeedback}}</p>
					<button type="submit" value="Log In" class="btn btn--green">Log In</button>
				</form>
			</div>
		</section>

		<!-- The loading area -->
		<section class="js-loading fixed-overlay fixed-overlay--loading"><h1 class="fixed-overlay__text"><i class='fa fa-spinner fa-spin'></i></h1></section>

		<!-- The API endpoint is configured per environment and stored in a PHP constant, so echo here into global js variable -->
		<script>
			window.jpi = window.jpi || {};
			window.jpi.config = window.jpi.config || {};
			window.jpi.config.jpiAPIEndpoint = "<?php echo JPI_API_ENDPOINT . JPI_API_VERSION; ?>";
		</script>

		<!-- All the JS's needed for the page  -->
		<?php // Either output a compiled js file for all project & libraries js files, or include individual files if debug is specified ?>
		<?php if (!isset($_GET["debug"])): ?>
			<!-- Compiled project & libraries js files -->
			<script src="/assets/js/admin.min.js?v=1" type="text/javascript"></script>
		<?php else: ?>
			<!-- All individual js files for site as debug is specified -->
			<!-- The third party scripts needed for the page for the app e.g. sorting of images etc. -->
			<script src="/assets/js/third-party/jquery.min.js?v=1" type="text/javascript"></script>
			<script src="/assets/js/third-party/jquery-ui.min.js?v=1" type="text/javascript"></script>
			<script src="/assets/js/third-party/angular.min.js?v=1" type="text/javascript"></script>
			<script src="/assets/js/third-party/sortable.js?v=1" type="text/javascript"></script>

			<script src="/assets/js/jpi/helpers.js?v=1" type="text/javascript"></script>
			<script src="/assets/js/jpi/dragNDrop.js?v=1" type="text/javascript"></script>
			<script src="/assets/js/jpi/nav.js?v=1" type="text/javascript"></script>
		<?php endif; ?>

		<!-- The AngularJS script for the admin page -->
		<script src="/assets/js/jpi/admin.js?v=1" type="text/javascript"></script>
	</body>
</html>