<?php
include_once("vendor/autoload.php");

include_once($_SERVER["DOCUMENT_ROOT"] . "/App.php");

$app = App::get();
$app->addConfig();

$isDebug = $app::isDebug();
?>

<!DOCTYPE html>
<html lang="en-gb">
    <head>
        <meta charset="UTF-8" />
        <meta name="author" content="Jahidul Pabel Islam" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>JPI Portfolio CMS</title>

        <link href="<?php $app::echoWithAssetVersion("/assets/css/third-party/font-awesome.min.css", "5.10.0"); ?>" rel="stylesheet" title="style" media="all" type="text/css" />

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

    <body class="cms-page">
        <div class="fixed-overlay fixed-overlay--loading fixed-overlay--active js-loading">
            <h1 class="fixed-overlay__text">
                <i class="fas fa-spinner fa-spin"></i>
            </h1>
        </div>

        <?php include_once(ROOT . "/partials/login.php"); ?>

        <?php include_once(ROOT . "/partials/nav.php"); ?>

        <main class="main-content">
            <div class="container">
                <?php
                include_once(ROOT . "/partials/projects-select.php");

                include_once(ROOT . "/partials/project-edit.php");
                ?>
            </div>
        </main>

        <script type="application/javascript">
            window.jpi = window.jpi || {};
            window.jpi.config = {
                jpiAPIBaseURL: "<?php echo \JPI\Utils\URL::removeTrailingSlash(JPI_API_ENDPOINT) . "/v" . JPI_API_VERSION; ?>"
            };
        </script>

        <?php
        if ($isDebug) {
            ?>
            <script src="<?php $app::echoWithAssetVersion("/assets/js/third-party/tinymce/tinymce.min.js", "1.1.0"); ?>" type="text/javascript"></script>
            <script src="<?php $app::echoWithAssetVersion("/assets/js/third-party/Sortable.min.js", "1.1.0"); ?>" type="text/javascript"></script>
            <script src="<?php $app::echoWithAssetVersion("/assets/js/jpi/helpers.js"); ?>" type="text/javascript"></script>
            <script src="<?php $app::echoWithAssetVersion("/assets/js/jpi/drag-n-drop.js"); ?>" type="text/javascript"></script>
            <script src="<?php $app::echoWithAssetVersion("/assets/js/jpi/nav.js"); ?>" type="text/javascript"></script>
            <script src="<?php $app::echoWithAssetVersion("/assets/js/jpi/router.js"); ?>" type="text/javascript"></script>
            <script src="<?php $app::echoWithAssetVersion("/assets/js/jpi/app.js"); ?>" type="text/javascript"></script>
            <?php
        }
        else {
            ?>
            <script src="<?php $app::echoWithAssetVersion("/assets/js/main.min.js"); ?>" type="text/javascript"></script>
            <?php
        }
        ?>
    </body>
</html>
