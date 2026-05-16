<?php
declare(strict_types=1);

function require_api_key(): void {
  $expected = (string)get_config_value("api.key", "");
  $provided = (string)($_SERVER["HTTP_X_SMASHPRO_API_KEY"] ?? "");

  if ($provided === "") {
    fail_json("Unauthorized", 401);
  }

  $authorized = false;

  if ($expected !== "" && hash_equals($expected, $provided)) {
    $authorized = true;
  }

  if (!$authorized) {
    try {
      $stmt = db()->prepare("
        SELECT id
        FROM spd_api_keys
        WHERE key_hash = UNHEX(SHA2(:api_key, 256))
          AND is_active = 1
        LIMIT 1
      ");
      $stmt->execute([":api_key" => $provided]);
      $row = $stmt->fetch();
      if ($row) {
        $authorized = true;
        $update = db()->prepare("UPDATE spd_api_keys SET last_used_at = NOW() WHERE id = :id");
        $update->execute([":id" => $row["id"]]);
      }
    } catch (Throwable $e) {
      if ($expected === "") {
        fail_json("API key auth unavailable", 500, ["stage" => "auth.api_keys"]);
      }
    }
  }

  if (!$authorized) {
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
