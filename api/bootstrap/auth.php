<?php
declare(strict_types=1);

function require_api_key(): void {
  $expected = (string)get_config_value("api.key", "");
  $provided = (string)($_SERVER["HTTP_X_SMASHPRO_API_KEY"] ?? "");

  if ($expected === "") {
    fail_json("API key not configured", 500, ["stage" => "auth.config"]);
  }

  if ($provided === "" || !hash_equals($expected, $provided)) {
    fail_json("Unauthorized", 401);
  }
}

function require_method(string $method): void {
  $actual = strtoupper((string)($_SERVER["REQUEST_METHOD"] ?? "GET"));
  $expected = strtoupper($method);

  if ($actual === "OPTIONS") {
    http_response_code(204);
    exit;
  }

  if ($actual !== $expected) {
    fail_json("Method Not Allowed", 405, ["method" => $actual]);
  }
}
