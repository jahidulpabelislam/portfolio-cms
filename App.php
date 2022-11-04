<?php

use JPI\Utils\Singleton;
use JPI\Utils\URL;

class App {

    use Singleton;

    private const DEFAULT_ASSET_VERSION = "1";

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
     * Get a version number of a asset file.
     *
     * The number to use can be passed as a param.
     * Else it tries to get the last modified date string from file.
     * And if that fails it fall backs to global default version number
     *
     * @param $src string The relative path to a asset
     * @param bool $ver string A version number to use
     * @param $root string The root location of where the file should be if not the default
     * @return string The version number found
     */
    public static function getAssetVersion(string $src, $ver = false, string $root = ROOT): string {
        if (!$ver) {
            $ver = self::DEFAULT_ASSET_VERSION;

            $file = URL::addTrailingSlash($root) . URL::removeLeadingSlash($src);
            if (file_exists($file)) {
                $ver = date("mdYHi", filemtime($file));
            }
        }

        return $ver;
    }

    /**
     * Wrapper around Site::getAssetVersion() to generate the full relative URL for the asset
     * including a version number
     */
    public static function addAssetVersion(string $src, $ver = false, string $root = ROOT): string {
        $ver = self::getAssetVersion($src, $ver, $root);

        return "{$src}?v={$ver}";
    }

    /**
     * Wrapper around Site::getAssetVersion() & Site::getAssetVersion()
     * Used to echo the full relative URL for the asset including a version number
     */
    public static function echoWithAssetVersion(string $src, $ver = false, string $root = ROOT) {
        echo self::addAssetVersion($src, $ver, $root);
    }

    /**
     * @return bool Whether or not the debug was set by user on page view
     */
    public static function isDebug(): bool {
        $isDebug = (isset($_GET["debug"]) && !($_GET["debug"] === "false" || $_GET["debug"] === "0"));

        return $isDebug;
    }

    public function getEnvironment(): string {
        return getenv("APPLICATION_ENV") ?? "production";
    }

    /**
     * Include the config files for app.
     */
    public function addConfig() {
        if (file_exists(ROOT . "/config.local.php")) {
            include_once(ROOT . "/config.local.php");
        }

        $environment = $this->getEnvironment();

        if ($environment !== 'production') {
            if (file_exists(ROOT . "/config.$environment.php")) {
                include_once(ROOT . "/config.$environment.php");
            }
        }

        include_once(ROOT . "/config.php");
    }
}

App::get();
