<?php
declare(strict_types=1);

/**
 * logger.php
 * Best-effort logging of API errors to shared spd_api_error_logs.
 * Never breaks the API response if logging fails.
 */

function redact_headers(array $headers): array {
  $redactKeys = ["authorization", "x-api-key", "cookie"];

  $out = [];
  foreach ($headers as $k => $v) {
    $lk = strtolower((string)$k);
    if (in_array($lk, $redactKeys, true)) {
      $out[$k] = "[REDACTED]";
    } else {
      $out[$k] = is_array($v) ? json_encode($v) : (string)$v;
    }
  }
  return $out;
}

function ensure_api_error_logs_table(PDO $pdo): void {
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS spd_api_error_logs (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      correlation_id CHAR(36) NOT NULL,
      occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      method VARCHAR(10) NOT NULL,
      path VARCHAR(255) NOT NULL,
      query_string TEXT NULL,
      http_status INT NULL,
      error_type VARCHAR(100) NULL,
      error_message TEXT NULL,
      error_file VARCHAR(255) NULL,
      error_line INT NULL,
      stack_trace MEDIUMTEXT NULL,
      request_headers JSON NULL,
      request_body MEDIUMTEXT NULL,
      ip_address VARCHAR(45) NULL,
      user_agent VARCHAR(255) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_correlation (correlation_id),
      KEY idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  ");
}

function log_api_error(?PDO $pdo, array $row): void {
  try {
    if (!$pdo) return;

    // Optional: create table only if explicitly allowed
    $cfg = $GLOBALS["config"] ?? [];
    $create = (bool)($cfg["debug"]["create_log_tables"] ?? false);
    if ($create) ensure_api_error_logs_table($pdo);

    $stmt = $pdo->prepare("
      INSERT INTO spd_api_error_logs
        (correlation_id, method, path, query_string, http_status, error_type,
         error_message, error_file, error_line, stack_trace, request_headers,
         request_body, ip_address, user_agent)
      VALUES
        (:correlation_id, :method, :path, :query_string, :http_status, :error_type,
         :error_message, :error_file, :error_line, :stack_trace, :request_headers,
         :request_body, :ip_address, :user_agent)
    ");

    $stmt->execute([
      ":correlation_id" => $row["correlation_id"] ?? null,
      ":method" => $row["method"] ?? ($_SERVER["REQUEST_METHOD"] ?? ""),
      ":path" => $row["endpoint"] ?? ($_SERVER["REQUEST_URI"] ?? ""),
      ":query_string" => $_SERVER["QUERY_STRING"] ?? null,
      ":http_status" => $row["http_status"] ?? null,
      ":error_type" => $row["error_type"] ?? null,
      ":error_message" => $row["message"] ?? null,
      ":error_file" => $row["error_file"] ?? null,
      ":error_line" => $row["error_line"] ?? null,
      ":stack_trace" => $row["stack_trace"] ?? null,
      ":request_headers" => json_encode($row["request_headers"] ?? [], JSON_UNESCAPED_SLASHES),
      ":request_body" => $row["request_body"] ?? null,
      ":ip_address" => $row["ip_address"] ?? null,
      ":user_agent" => $row["user_agent"] ?? null,
    ]);
  } catch (Throwable $e) {
    error_log("[spd_api_error_logs] insert failed: " . $e->getMessage());
  }
}
