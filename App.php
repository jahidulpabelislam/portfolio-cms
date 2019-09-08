<?php

class App {

    private const DEFAULT_ASSET_VERSION = "1";

    private static $instance;

    public function __construct() {
        if (!defined("ROOT")) {
            define("ROOT", self::getProjectRoot());
        }
    }

    public static function get(): App {
        if (!self::$instance) {
            self::$instance = new self();
        }

        return self::$instance;
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
     * Include the common config file for page/site
     */
    public static function echoConfig() {
        include_once(ROOT . "/config.php");
    }

    /**
     * @param $url string The url to add slash to
     * @return string The new url
     */
    public static function addTrailingSlash(string $url): string {
        $url = rtrim($url, " /");
        $url = "{$url}/";

        return $url;
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

            $src = ltrim($src, " /");
            $file = self::addTrailingSlash($root) . $src;
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
}

App::get();
