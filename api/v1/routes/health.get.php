<?php
declare(strict_types=1);
require_once __DIR__ . "/../../bootstrap/bootstrap.php";
route_bootstrap("GET", false);
json_ok(["status" => "healthy", "service" => "togetherfunds-api"]);
