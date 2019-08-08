<?php
include_once($_SERVER["DOCUMENT_ROOT"] . "/App.php");

$app = App::get();
$app::echoConfig();

$isDebug = $app::isDebug();
?>

<!DOCTYPE html>
<html lang="en-gb" ng-app="portfolioCMS">
    <head>
        <meta charset="UTF-8" />
        <meta name="author" content="Jahidul Pabel Islam" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>JPI Portfolio CMS</title>

        <link href="<?php $app::echoWithAssetVersion("/assets/css/third-party/font-awesome.min.css", "5.10.0"); ?>" rel="stylesheet" title="style" media="all" type="text/css" />

        <!-- The custom styling for this page -->
        <?php
        if ($isDebug) {
            ?>
            <link href="<?php $app::echoWithAssetVersion("/assets/css/jpi/main.css"); ?>" rel="stylesheet" title="style" media="all" type="text/css" />
            <?php
        }
        else {
            ?>
            <link href="<?php $app::echoWithAssetVersion("/assets/css/jpi/main.min.css"); ?>" rel="stylesheet" title="style" media="all" type="text/css" />
            <?php
        }
        ?>

        <?php include_once(ROOT . "/partials/favicons.php"); ?>
    </head>

    <body ng-controller="portfolioCMSController" class="cms-page">

        <?php include_once(ROOT . "/partials/nav.php"); ?>

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
        <div class="js-drop-zone fixed-overlay">
            <h1 class="fixed-overlay__text">Drag And Drop Image Here To Upload A Slide for Project</h1>
        </div>

        <!-- The loading area -->
        <div class="js-loading fixed-overlay fixed-overlay--loading">
            <h1 class="fixed-overlay__text">
                <i class="fas fa-spinner fa-spin"></i>
            </h1>
        </div>

        <!-- The API endpoint is configured per environment and stored in a PHP constant, so echo here into global js variable -->
        <script type="application/javascript">
            window.jpi = window.jpi || {};
            window.jpi.config = {
                jpiAPIEndpoint: "<?php echo trim(JPI_API_ENDPOINT, "/") . "/v" . trim(JPI_API_VERSION, "/") . "/"; ?>"
            };
        </script>

        <script src="https://cloud.tinymce.com/5/tinymce.min.js?apiKey=hci3sc80vemjpp1nnhl817vewvfm9vbg59omb77vfmur5sts" type="text/javascript"></script>

        <!-- All the JS's needed for the page  -->
        <?php
        // Either output a compiled js file for all project & libraries js files, or include individual files if debug is specified
        if ($isDebug) {
            ?>
            <!-- All individual js files for site as debug is specified -->
            <!-- The third party scripts needed for the page for the app e.g. sorting of images etc. -->
            <script src="<?php $app::echoWithAssetVersion("/assets/js/third-party/jquery.min.js", "1.11.3"); ?>" type="text/javascript"></script>
            <script src="<?php $app::echoWithAssetVersion("/assets/js/third-party/jquery-ui.min.js", "1.12.1"); ?>" type="text/javascript"></script>
            <script src="<?php $app::echoWithAssetVersion("/assets/js/third-party/angular.min.js", "1.6.4"); ?>" type="text/javascript"></script>
            <script src="<?php $app::echoWithAssetVersion("/assets/js/third-party/sortable.js", "0.17.2"); ?>" type="text/javascript"></script>
            <script src="<?php $app::echoWithAssetVersion("/assets/js/third-party/angular-ui-tinymce.min.js", "0.0.19"); ?>" type="text/javascript"></script>

            <script src="<?php $app::echoWithAssetVersion("/assets/js/jpi/helpers.js"); ?>" type="text/javascript"></script>
            <script src="<?php $app::echoWithAssetVersion("/assets/js/jpi/drag-n-drop.js"); ?>" type="text/javascript"></script>
            <script src="<?php $app::echoWithAssetVersion("/assets/js/jpi/nav.js"); ?>" type="text/javascript"></script>
            <?php
        }
        else {
            ?>
            <!-- Compiled project & libraries js files -->
            <script src="<?php $app::echoWithAssetVersion("/assets/js/main.min.js"); ?>" type="text/javascript"></script>
            <?php
        }
        ?>

        <script src="https://cdn.jsdelivr.net/gh/jahidulpabelislam/sticky-footer.js@1.1.0/src/sticky-footer.min.js" type="application/javascript"></script>

        <!-- The AngularJS script for the CMS page -->
        <script src="<?php $app::echoWithAssetVersion("/assets/js/jpi/controller.js"); ?>" type="text/javascript"></script>
    </body>
</html>
