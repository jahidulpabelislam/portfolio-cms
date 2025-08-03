<?php

declare(strict_types=1);

$config->api_endpoint = "https://api." . \JPI\App::get()::DOMAINS[$environment];
$config->api_version = "4";
