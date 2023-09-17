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
     * Get a version number of an asset file.
     *
     * The number to use can be passed as a param.
     * Else it tries to get the last modified date string from file.
     * And if that fails it fall backs to global default version number
     *
     * @param $src string The relative path to an asset
     * @param $ver string|null A version number to use
     * @param $root string The root location of where the file should be if not the default
     * @return string The version number found
     */
    public static function getAssetVersion(string $src, ?string $ver = null, string $root = ROOT): string {
        if (!$ver) {
            $ver = self::DEFAULT_ASSET_VERSION;

            $file = URL::removeTrailingSlash($root) . URL::addLeadingSlash($src);
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
    public static function addAssetVersion(string $src, ?string $ver = null, string $root = ROOT): string {
        $ver = self::getAssetVersion($src, $ver, $root);

        return "{$src}?v={$ver}";
    }

    /**
     * Wrapper around Site::getAssetVersion() & Site::getAssetVersion()
     * Used to echo the full relative URL for the asset including a version number
     */
    public static function echoWithAssetVersion(string $src, ?string $ver = null, string $root = ROOT): void {
        echo self::addAssetVersion($src, $ver, $root);
    }

    public function getEnvironment(): string {
        return getenv("APPLICATION_ENV") ?? "production";
    }

    /**
     * Include the config files for app.
     */
    public function addConfig(): void {
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
