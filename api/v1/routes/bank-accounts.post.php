<?php
declare(strict_types=1);
require_once __DIR__ . "/../../bootstrap/bootstrap.php";
route_bootstrap("POST");
handle_bank_accounts_post();
