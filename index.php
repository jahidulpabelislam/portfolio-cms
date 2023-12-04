<?php
include_once("vendor/autoload.php");

$app = App::get();
$app->addConfig();

$colourOptions = [
    "" => "Default",
    "light-blue" => "Light Blue",
    "dark-blue" => "Dark Blue",
    "purple" => "Purple",
    "pink" => "Pink",
    "red" => "Red",
    "orange" => "Orange",
    "yellow" => "Yellow",
    "light-green" => "Light Green",
    "lime-green" => "Lime Green",
    "dark-green" => "Dark Green",
    "grey" => "Grey",
    "black" => "Black",
];
?>

<!DOCTYPE html>
<html lang="en-gb">
    <head>
        <meta charset="UTF-8" />
        <meta name="author" content="Jahidul Pabel Islam" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>JPI Portfolio CMS</title>

        <link href="<?php $app::echoWithAssetVersion("/assets/css/jpi/main.css"); ?>" rel="stylesheet" title="style" media="all" type="text/css" />

        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" title="style" media="all" type="text/css" />

        <?php include_once(ROOT . "/partials/favicons.php"); ?>
    </head>

    <body>
        <div class="fixed-overlay fixed-overlay--loading fixed-overlay--active js-loading">
            <h1 class="fixed-overlay__text"><i class="fas fa-spinner fa-spin"></i></h1>
        </div>

        <?php include_once(ROOT . "/partials/login.php"); ?>

        <?php include_once(ROOT . "/partials/nav.php"); ?>

        <main class="main-content">
            <div class="container">
                <?php
                include_once(ROOT . "/partials/projects-listing.php");

                include_once(ROOT . "/partials/project-edit.php");
                ?>
            </div>
        </main>

        <script type="application/javascript">
            window.jpi = window.jpi || {};
            window.jpi.config = {
                jpiAPIBaseURL: "<?php echo \JPI\Utils\URL::removeTrailingSlash(JPI_API_ENDPOINT) . "/v" . JPI_API_VERSION; ?>",
                colours: <?php echo json_encode($colourOptions); ?>,
            };
        </script>

        <script src="<?php $app::echoWithAssetVersion("/assets/js/tinymce/tinymce.min.js"); ?>" type="application/javascript"></script>
        <script src="<?php $app::echoWithAssetVersion("/assets/js/app.js"); ?>" type="module"></script>
    </body>
</html>
