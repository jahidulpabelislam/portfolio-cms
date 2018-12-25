<?php include_once($_SERVER["DOCUMENT_ROOT"] . "/config.php"); ?>

<!DOCTYPE html>
<html lang="en" ng-app="portfolioCMS">
	<head>
		<meta charset="UTF-8"/>
		<meta name="author" content="Jahidul Pabel Islam"/>
		<meta name="viewport" content="width=device-width, initial-scale=1"/>
		<title>JPI Portfolio CMS</title>

		<?php $isDebug = (isset($_GET["debug"]) && !($_GET["debug"] == "false" || $_GET["debug"] == "0")); ?>
		<!-- The custom styling for this page -->
		<?php if (!$isDebug): ?>
			<link href="/assets/css/main.min.css?v=1" rel="stylesheet" title="style" media="all" type="text/css">
		<?php else: ?>
			<link href="/assets/css/style.css?v=1" rel="stylesheet" title="style" media="all" type="text/css">
		<?php endif; ?>

		<link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet" title="style" media="all" type="text/css">

		<?php
		include_once(ROOT . "/partials/favicons.php");
		?>
	</head>

	<body ng-controller="portfolioCMSController" class="cms-page">

		<?php
		include_once(ROOT . "/partials/nav.php");
		?>

		<main class="main-content">
			<div class="container">
				<?php
				include_once(ROOT . "/partials/projects-select.php");

				include_once(ROOT . "/partials/project-view.php");
				?>
			</div>
		</main>

		<?php include_once(ROOT . "/partials/login.php"); ?>

		<!-- The drag and drop area -->
		<div class="js-drop-zone fixed-overlay"><h1 class="fixed-overlay__text">Drag And Drop Image Here To Upload A Slide for Project</h1></div>

		<!-- The loading area -->
		<div class="js-loading fixed-overlay fixed-overlay--loading"><h1 class="fixed-overlay__text"><i class='fa fa-spinner fa-spin'></i></h1></div>

		<!-- The API endpoint is configured per environment and stored in a PHP constant, so echo here into global js variable -->
		<script>
			window.jpi = window.jpi || {};
			window.jpi.config = window.jpi.config || {};
			window.jpi.config.jpiAPIEndpoint = "<?php echo trim(JPI_API_ENDPOINT, "/") .  "/v" . trim(JPI_API_VERSION, "/") . "/"; ?>";
		</script>

		<!-- All the JS's needed for the page  -->
		<?php // Either output a compiled js file for all project & libraries js files, or include individual files if debug is specified ?>
		<?php if (!$isDebug): ?>
			<!-- Compiled project & libraries js files -->
			<script src="/assets/js/main.min.js?v=1" type="text/javascript"></script>
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

		<!-- The AngularJS script for the CMS page -->
		<script src="/assets/js/jpi/controller.js?v=1" type="text/javascript"></script>
	</body>
</html>