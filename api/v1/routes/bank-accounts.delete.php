<?php
declare(strict_types=1);
require_once __DIR__ . "/../../bootstrap/bootstrap.php";
route_bootstrap("DELETE");
handle_bank_accounts_delete();
