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

function bearer_token(): ?string {
  $header = (string)($_SERVER["HTTP_AUTHORIZATION"] ?? "");
  if ($header === "" && function_exists("apache_request_headers")) {
    $headers = apache_request_headers();
    $header = (string)($headers["Authorization"] ?? $headers["authorization"] ?? "");
  }

  if (stripos($header, "Bearer ") !== 0) return null;
  $token = trim(substr($header, 7));
  return $token !== "" ? $token : null;
}

function token_hash_hex(string $token): string {
  return hash("sha256", $token);
}

function generate_session_token(): string {
  return bin2hex(random_bytes(32));
}

function session_expires_at(): string {
  return gmdate("Y-m-d H:i:s", time() + (60 * 60 * 24 * 30));
}

function require_session_user(array $context): array {
  $token = bearer_token();
  if (!$token) fail_json("Authentication required", 401);

  $stmt = db()->prepare("
    SELECT s.id AS session_id, s.user_id, s.tenant_key, u.email, u.name, u.first_name, u.last_name, c.username
    FROM spd_user_sessions s
    JOIN spd_users u ON u.id = s.user_id
    LEFT JOIN spd_user_credentials c ON c.user_id = u.id AND c.deleted_at IS NULL
    WHERE s.token_hash = UNHEX(:token_hash)
      AND s.app_key = :app_key
      AND (s.tenant_key = :tenant_key OR s.tenant_key IS NULL)
      AND s.revoked_at IS NULL
      AND s.expires_at > NOW()
    LIMIT 1
  ");
  $stmt->execute([
    ":token_hash" => token_hash_hex($token),
    ":app_key" => $context["app_key"],
    ":tenant_key" => $context["tenant_key"],
  ]);
  $session = $stmt->fetch();
  if (!$session) fail_json("Invalid session", 401);

  $update = db()->prepare("UPDATE spd_user_sessions SET last_seen_at = NOW() WHERE id = :id");
  $update->execute([":id" => $session["session_id"]]);

  return $session;
}
