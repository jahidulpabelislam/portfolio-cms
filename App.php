<?php

class App {

    const DEFAULT_ASSET_VERSION = "1";

    private static $instance = null;

    public function __construct() {
        if (!defined("ROOT")) {
            define("ROOT", self::getProjectRoot());
        }
    }

    public static function get() {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * Return this projects root directory
     *
     * @return string
     */
    private static function getProjectRoot() {
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
    public static function addTrailingSlash($url) {
        $url = rtrim($url, " /");
        $url .= "/";

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
     * @param bool $root string The root location of where the file should be if not the default
     * @return string The version number found
     */
    public static function getAssetVersion(string $src, $ver = false, $root = false) {
        if (!$ver) {
            if (!$root) {
                $root = self::getProjectRoot();
            }

            $src = ltrim($src, " /");
            $file = self::addTrailingSlash($root) . $src;
            if (file_exists($file)) {
                $ver = date("mdYHi", filemtime($file));
            }
            else {
                $ver = self::DEFAULT_ASSET_VERSION;
            }
        }

        return $ver;
    }

    /**
     * Wrapper around Site::getAssetVersion() to generate the full relative URL for the asset
     * including a version number
     */
    public static function getWithAssetVersion($src, $ver = false, $root = false) {
        $ver = self::getAssetVersion($src, $ver, $root);

        return "{$src}?v={$ver}";
    }

    /**
     * Wrapper around Site::getWithAssetVersion() & Site::getAssetVersion()
     * Used to echo the full relative URL for the asset including a version number
     */
    public static function echoWithAssetVersion($src, $ver = false, $root = false) {
        echo self::getWithAssetVersion($src, $ver, $root);
    }

    /**
     * @return bool Whether or not the debug was set by user on page view
     */
    public static function isDebug() {
        return (isset($_GET["debug"]) && !($_GET["debug"] == "false" || $_GET["debug"] == "0"));
    }
}

App::get();
