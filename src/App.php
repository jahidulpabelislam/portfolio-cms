<?php

declare(strict_types=1);

use JPI\Site;

class App extends Site {

    protected function __construct() {
        if (!defined("ROOT")) {
            define("ROOT", self::getProjectRoot());
        }
    }

    /**
     * Return this projects root directory
     */
    private static function getProjectRoot(): string {
        if (defined("ROOT")) {
            return ROOT;
        }

        return $_SERVER["DOCUMENT_ROOT"];
    }

    /**
     * Include the config files for app.
     */
    public function addConfig(): void {
        if (file_exists(ROOT . "/config.local.php")) {
            include_once(ROOT . "/config.local.php");
        }

        $environment = $this->getEnvironment();

        if ($environment !== "production") {
            if (file_exists(ROOT . "/config.$environment.php")) {
                include_once(ROOT . "/config.$environment.php");
            }
        }

        include_once(ROOT . "/config.php");
    }
}
