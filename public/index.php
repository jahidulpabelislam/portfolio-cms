<?php

declare(strict_types=1);

include_once __DIR__ . "/../vendor/autoload.php";

$app = \JPI\App::get();
?>

<!DOCTYPE html>
<html lang="en-gb">
    <head>
        <meta charset="UTF-8" />
        <meta name="author" content="Jahidul Pabel Islam" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>JPI Portfolio CMS</title>

        <link href="<?php echo $app::asset("/assets/css/main.css"); ?>" rel="stylesheet" title="style" media="all" type="text/css" />

        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" title="style" media="all" type="text/css" />

        <?php $app->renderFavicons(); ?>
    </head>

    <body>
        <div class="fixed-overlay fixed-overlay--loading fixed-overlay--active js-loading">
            <h1 class="fixed-overlay__text"><i class="fas fa-spinner fa-spin"></i></h1>
        </div>

        <?php include_once(APP_ROOT . "/partials/login.php"); ?>

        <?php include_once(APP_ROOT . "/partials/nav.php"); ?>

        <main class="main-content">
            <div class="container">
                <?php
                include_once(APP_ROOT . "/partials/projects-listing.php");

                include_once(APP_ROOT . "/partials/project-edit.php");
                ?>
            </div>
        </main>

        <script type="application/javascript">
            window.jpi = window.jpi || {};
            window.jpi.config = {
                jpiAPIBaseURL: "<?php echo \JPI\Utils\URL::removeTrailingSlash($app->config()->api_endpoint) . "/v" . $app->config()->api_version; ?>",
            };
        </script>

        <script src="<?php echo $app::asset("/assets/js/tinymce/tinymce.min.js"); ?>" type="application/javascript"></script>
        <script src="<?php echo $app::asset("/assets/js/app.js"); ?>" type="module"></script>
    </body>
</html>
