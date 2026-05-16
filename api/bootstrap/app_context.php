<?php
declare(strict_types=1);

function read_json_body(): array {
  $raw = file_get_contents("php://input");
  if (!$raw) return [];
  $decoded = json_decode($raw, true);
  if (!is_array($decoded)) fail_json("Invalid JSON body", 400);
  return $decoded;
}

function route_bootstrap(string $method, bool $tenantRequired = true, ?string $featureKey = null): array {
  require_method($method);
  require_api_key();
  $context = $tenantRequired ? require_tenant_context() : resolve_app_context(false);
  if ($featureKey !== null) require_feature_enabled($featureKey, $context);
  return $context;
}

function require_app_key(): string {
  $appKey = trim((string)($_SERVER["HTTP_X_SMASHPRO_APP_KEY"] ?? ($_SERVER["HTTP_X_APP_KEY"] ?? ($_SERVER["HTTP_X_APP_SLUG"] ?? ""))));
  if ($appKey === "") fail_json("X-SmashPro-App-Key is required", 400);
  return $appKey;
}

function resolve_app_context(bool $tenantRequired = true): array {
  $appKey = require_app_key();
  $stmt = db()->prepare("SELECT * FROM spd_apps WHERE app_key = :app_key LIMIT 1");
  $stmt->execute([":app_key" => $appKey]);
  $app = $stmt->fetch();
  if (!$app) fail_json("Unknown app", 404, ["app_key" => $appKey]);

  $method = strtoupper((string)($_SERVER["REQUEST_METHOD"] ?? "GET"));
  $body = in_array($method, ["POST", "PUT", "DELETE"], true) ? read_json_body() : [];
  $GLOBALS["json_body"] = $body;

  $tenantKey = trim((string)($_SERVER["HTTP_X_SMASHPRO_TENANT_KEY"] ?? ($_GET["tenant_key"] ?? ($body["tenant_key"] ?? ""))));
  $coupleId = (int)($_GET["couple_id"] ?? ($body["couple_id"] ?? 0));
  $tenant = null;

  if ($tenantKey === "" && $coupleId > 0) {
    $stmt = db()->prepare("SELECT tenant_key FROM spd_tf_couples WHERE app_key = :app_key AND id = :id AND deleted_at IS NULL");
    $stmt->execute([":app_key" => $appKey, ":id" => $coupleId]);
    $couple = $stmt->fetch();
    $tenantKey = $couple ? (string)$couple["tenant_key"] : "";
  }

  if ($tenantKey !== "") {
    $stmt = db()->prepare("
      SELECT * FROM spd_app_tenants
      WHERE app_key = :app_key AND tenant_key = :tenant_key AND deleted_at IS NULL
      LIMIT 1
    ");
    $stmt->execute([":app_key" => $appKey, ":tenant_key" => $tenantKey]);
    $tenant = $stmt->fetch();
  }

  if ($tenantRequired && (!$tenant || $tenantKey === "")) {
    fail_json("Tenant context is required", 400);
  }

  return [
    "app" => $app,
    "app_key" => $appKey,
    "tenant" => $tenant,
    "tenant_key" => $tenantKey,
    "couple_id" => $coupleId,
    "body" => $body,
  ];
}

function require_tenant_context(): array {
  return resolve_app_context(true);
}

function require_feature_enabled(string $featureKey, ?array $context = null): void {
  $context = $context ?? require_tenant_context();
  $stmt = db()->prepare("
    SELECT COALESCE(ff.enabled, 1) AS enabled
    FROM spd_app_features f
    LEFT JOIN spd_app_feature_flags ff
      ON ff.app_slug = f.app_slug AND ff.tenant_key = :tenant_key AND ff.feature_code = f.code
    WHERE f.app_slug = :app_key AND f.code = :feature_key
    LIMIT 1
  ");
  $stmt->execute([
    ":app_key" => $context["app_key"],
    ":tenant_key" => $context["tenant_key"],
    ":feature_key" => $featureKey,
  ]);
  $row = $stmt->fetch();
  if ($row && (int)$row["enabled"] === 0) fail_json("Feature disabled", 403, ["feature_key" => $featureKey]);
}

function body_value(array $context, string $key, $default = null) {
  return $context["body"][$key] ?? $default;
}

function body_string(array $context, string $key, bool $required = true): ?string {
  $value = body_value($context, $key);
  if ($value === null || trim((string)$value) === "") {
    if ($required) fail_json("{$key} is required", 400);
    return null;
  }
  return trim((string)$value);
}

function body_float(array $context, string $key, bool $required = true): ?float {
  $value = body_value($context, $key);
  if ($value === null || $value === "") {
    if ($required) fail_json("{$key} is required", 400);
    return null;
  }
  return (float)$value;
}

function body_int(array $context, string $key, bool $required = true): ?int {
  $value = body_value($context, $key);
  if ($value === null || $value === "") {
    if ($required) fail_json("{$key} is required", 400);
    return null;
  }
  return (int)$value;
}

function tf_couple_id(array $context): int {
  $coupleId = (int)($context["couple_id"] ?? 0);
  if ($coupleId > 0) return $coupleId;
  $stmt = db()->prepare("
    SELECT id FROM spd_tf_couples
    WHERE app_key = :app_key AND tenant_key = :tenant_key AND deleted_at IS NULL
    ORDER BY id ASC LIMIT 1
  ");
  $stmt->execute([":app_key" => $context["app_key"], ":tenant_key" => $context["tenant_key"]]);
  $row = $stmt->fetch();
  if (!$row) fail_json("Couple not found for tenant", 404);
  return (int)$row["id"];
}

function tf_insert(string $table, array $data): int {
  $columns = array_keys($data);
  $stmt = db()->prepare("INSERT INTO {$table} (" . implode(", ", $columns) . ") VALUES (:" . implode(", :", $columns) . ")");
  foreach ($data as $key => $value) $stmt->bindValue(":{$key}", $value);
  $stmt->execute();
  return (int)db()->lastInsertId();
}

function tf_update(string $table, int $id, array $context, array $data): void {
  $sets = array_map(fn($key) => "{$key} = :{$key}", array_keys($data));
  $stmt = db()->prepare("UPDATE {$table} SET " . implode(", ", $sets) . " WHERE id = :id AND app_key = :app_key AND tenant_key = :tenant_key");
  foreach ($data as $key => $value) $stmt->bindValue(":{$key}", $value);
  $stmt->bindValue(":id", $id, PDO::PARAM_INT);
  $stmt->bindValue(":app_key", $context["app_key"]);
  $stmt->bindValue(":tenant_key", $context["tenant_key"]);
  $stmt->execute();
}

function tf_soft_delete(string $table, int $id, array $context): void {
  $stmt = db()->prepare("UPDATE {$table} SET deleted_at = NOW() WHERE id = :id AND app_key = :app_key AND tenant_key = :tenant_key");
  $stmt->execute([":id" => $id, ":app_key" => $context["app_key"], ":tenant_key" => $context["tenant_key"]]);
}

function tf_list(string $table, array $context, ?int $coupleId = null): array {
  $sql = "SELECT * FROM {$table} WHERE app_key = :app_key AND tenant_key = :tenant_key AND deleted_at IS NULL";
  $params = [":app_key" => $context["app_key"], ":tenant_key" => $context["tenant_key"]];
  if ($coupleId !== null) {
    $sql .= " AND couple_id = :couple_id";
    $params[":couple_id"] = $coupleId;
  }
  $stmt = db()->prepare($sql . " ORDER BY id DESC");
  $stmt->execute($params);
  return $stmt->fetchAll() ?: [];
}

function user_public_row(array $row): array {
  return [
    "id" => (int)$row["id"],
    "email" => $row["email"] ?? null,
    "username" => $row["username"] ?? null,
    "name" => $row["name"] ?? null,
    "first_name" => $row["first_name"] ?? null,
    "last_name" => $row["last_name"] ?? null,
  ];
}

function load_preferences(int $userId): array {
  $stmt = db()->prepare("SELECT * FROM spd_user_preferences WHERE user_id = :user_id AND deleted_at IS NULL LIMIT 1");
  $stmt->execute([":user_id" => $userId]);
  return $stmt->fetch() ?: [];
}

function load_app_settings(int $userId, array $context): array {
  $stmt = db()->prepare("
    SELECT * FROM spd_user_app_settings
    WHERE user_id = :user_id AND app_key = :app_key AND tenant_key = :tenant_key AND deleted_at IS NULL
    LIMIT 1
  ");
  $stmt->execute([":user_id" => $userId, ":app_key" => $context["app_key"], ":tenant_key" => $context["tenant_key"]]);
  return $stmt->fetch() ?: [];
}

function create_session(int $userId, array $context): array {
  $token = generate_session_token();
  $refresh = generate_session_token();
  $expiresAt = session_expires_at();

  $stmt = db()->prepare("
    INSERT INTO spd_user_sessions
      (user_id, app_key, tenant_key, token_hash, refresh_token_hash, expires_at)
    VALUES
      (:user_id, :app_key, :tenant_key, UNHEX(:token_hash), UNHEX(:refresh_hash), :expires_at)
  ");
  $stmt->execute([
    ":user_id" => $userId,
    ":app_key" => $context["app_key"],
    ":tenant_key" => $context["tenant_key"],
    ":token_hash" => token_hash_hex($token),
    ":refresh_hash" => token_hash_hex($refresh),
    ":expires_at" => $expiresAt,
  ]);

  return ["session_token" => $token, "refresh_token" => $refresh, "expires_at" => $expiresAt];
}

function ensure_app_membership(int $userId, array $context, string $role = "member"): void {
  $stmt = db()->prepare("
    INSERT INTO spd_user_app_memberships (user_id, app_key, tenant_key, role, status)
    VALUES (:user_id, :app_key, :tenant_key, :role, 'active')
    ON DUPLICATE KEY UPDATE role = VALUES(role), status = 'active', deleted_at = NULL
  ");
  $stmt->execute([
    ":user_id" => $userId,
    ":app_key" => $context["app_key"],
    ":tenant_key" => $context["tenant_key"],
    ":role" => $role,
  ]);
}

function handle_auth_register_post(): void {
  $context = route_bootstrap("POST", true);
  $email = strtolower((string)body_string($context, "email"));
  $username = body_string($context, "username", false);
  $password = (string)body_string($context, "password");
  $displayName = body_string($context, "display_name", false) ?? $email;

  if (strlen($password) < 8) fail_json("Password must be at least 8 characters", 400);

  $existing = db()->prepare("SELECT id FROM spd_user_credentials WHERE email = :email OR (username IS NOT NULL AND username = :username) LIMIT 1");
  $existing->execute([":email" => $email, ":username" => $username]);
  if ($existing->fetch()) fail_json("Account already exists", 409);

  $stmt = db()->prepare("INSERT INTO spd_users (email, name, auth_provider, last_seen_app, app_source) VALUES (:email, :name, 'local', :app_key, 'mobile')");
  $stmt->execute([":email" => $email, ":name" => $displayName, ":app_key" => $context["app_key"]]);
  $userId = (int)db()->lastInsertId();

  $cred = db()->prepare("
    INSERT INTO spd_user_credentials (user_id, username, email, password_hash)
    VALUES (:user_id, :username, :email, :password_hash)
  ");
  $cred->execute([
    ":user_id" => $userId,
    ":username" => $username,
    ":email" => $email,
    ":password_hash" => password_hash($password, PASSWORD_DEFAULT),
  ]);

  ensure_app_membership($userId, $context, "member");
  $pref = db()->prepare("INSERT INTO spd_user_preferences (user_id, display_name, preferred_currency) VALUES (:user_id, :display_name, 'USD')");
  $pref->execute([":user_id" => $userId, ":display_name" => $displayName]);

  $session = create_session($userId, $context);
  json_ok(array_merge([
    "user" => user_public_row(["id" => $userId, "email" => $email, "username" => $username, "name" => $displayName]),
    "preferences" => load_preferences($userId),
    "app_settings" => load_app_settings($userId, $context),
    "tenant_key" => $context["tenant_key"],
  ], $session), 201);
}

function handle_auth_login_post(): void {
  $context = route_bootstrap("POST", true);
  $login = strtolower((string)body_string($context, "login"));
  $password = (string)body_string($context, "password");

  $stmt = db()->prepare("
    SELECT c.*, u.name, u.first_name, u.last_name
    FROM spd_user_credentials c
    JOIN spd_users u ON u.id = c.user_id
    WHERE c.deleted_at IS NULL AND (c.email = :login OR c.username = :login)
    LIMIT 1
  ");
  $stmt->execute([":login" => $login]);
  $cred = $stmt->fetch();
  if (!$cred || !password_verify($password, (string)$cred["password_hash"])) {
    fail_json("Invalid login", 401);
  }

  ensure_app_membership((int)$cred["user_id"], $context, "member");
  $session = create_session((int)$cred["user_id"], $context);
  json_ok(array_merge([
    "user" => user_public_row(["id" => $cred["user_id"], "email" => $cred["email"], "username" => $cred["username"], "name" => $cred["name"], "first_name" => $cred["first_name"], "last_name" => $cred["last_name"]]),
    "preferences" => load_preferences((int)$cred["user_id"]),
    "app_settings" => load_app_settings((int)$cred["user_id"], $context),
    "tenant_key" => $context["tenant_key"],
  ], $session));
}

function handle_auth_me_get(): void {
  $context = route_bootstrap("GET", true);
  $sessionUser = require_session_user($context);
  $userId = (int)$sessionUser["user_id"];
  json_ok([
    "user" => user_public_row(["id" => $userId, "email" => $sessionUser["email"], "username" => $sessionUser["username"] ?? null, "name" => $sessionUser["name"], "first_name" => $sessionUser["first_name"], "last_name" => $sessionUser["last_name"]]),
    "preferences" => load_preferences($userId),
    "app_settings" => load_app_settings($userId, $context),
    "tenant_key" => $context["tenant_key"],
    "app_key" => $context["app_key"],
  ]);
}

function handle_auth_logout_post(): void {
  $context = route_bootstrap("POST", true);
  $token = bearer_token();
  if ($token) {
    $stmt = db()->prepare("UPDATE spd_user_sessions SET revoked_at = NOW() WHERE token_hash = UNHEX(:token_hash) AND app_key = :app_key");
    $stmt->execute([":token_hash" => token_hash_hex($token), ":app_key" => $context["app_key"]]);
  }
  json_ok(["logged_out" => true]);
}

function handle_auth_refresh_post(): void {
  $context = route_bootstrap("POST", true);
  $body = $context["body"];
  $refresh = trim((string)($body["refresh_token"] ?? ""));
  if ($refresh === "") fail_json("refresh_token is required", 400);

  $stmt = db()->prepare("
    SELECT user_id FROM spd_user_sessions
    WHERE refresh_token_hash = UNHEX(:refresh_hash)
      AND app_key = :app_key
      AND revoked_at IS NULL
      AND expires_at > NOW()
    LIMIT 1
  ");
  $stmt->execute([":refresh_hash" => token_hash_hex($refresh), ":app_key" => $context["app_key"]]);
  $row = $stmt->fetch();
  if (!$row) fail_json("Invalid refresh token", 401);

  $session = create_session((int)$row["user_id"], $context);
  json_ok($session);
}

function table_exists(string $table): bool {
  $stmt = db()->prepare("
    SELECT COUNT(*) AS count
    FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = :table
  ");
  $stmt->execute([":table" => $table]);
  return (int)($stmt->fetch()["count"] ?? 0) > 0;
}

function column_exists(string $table, string $column): bool {
  $stmt = db()->prepare("
    SELECT COUNT(*) AS count
    FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = :table AND column_name = :column
  ");
  $stmt->execute([":table" => $table, ":column" => $column]);
  return (int)($stmt->fetch()["count"] ?? 0) > 0;
}

function handle_auth_debug_get(): void {
  $context = route_bootstrap("GET", false);
  $ping = db()->query("SELECT 1 AS connected")->fetch();

  $required = [
    "spd_users" => ["id", "email", "name"],
    "spd_user_credentials" => ["id", "user_id", "username", "email", "password_hash"],
    "spd_user_sessions" => ["id", "user_id", "app_key", "tenant_key", "token_hash", "refresh_token_hash", "expires_at", "revoked_at"],
    "spd_user_app_memberships" => ["id", "user_id", "app_key", "tenant_key", "role", "status"],
    "spd_user_preferences" => ["id", "user_id", "display_name", "preferred_currency", "theme_mode", "accent_color"],
    "spd_user_app_settings" => ["id", "user_id", "app_key", "tenant_key", "dashboard_layout", "envelope_style", "default_budget_period"],
    "spd_tf_user_couple_links" => ["id", "app_key", "tenant_key", "user_id", "couple_id", "role"],
    "spd_tf_couple_invites" => ["id", "app_key", "tenant_key", "couple_id", "invite_code", "role"],
  ];

  $tables = [];
  foreach ($required as $table => $columns) {
    $exists = table_exists($table);
    $columnStatus = [];
    foreach ($columns as $column) {
      $columnStatus[$column] = $exists ? column_exists($table, $column) : false;
    }
    $tables[$table] = [
      "exists" => $exists,
      "columns" => $columnStatus,
    ];
  }

  json_ok([
    "bootstrap_loaded" => true,
    "db_connected" => (bool)$ping,
    "app_key" => $context["app_key"],
    "app_recognized" => !empty($context["app"]),
    "tenant_key" => $context["tenant_key"] ?: null,
    "auth_tables" => $tables,
  ]);
}

function handle_user_preferences_get(): void {
  $context = route_bootstrap("GET", true);
  $user = require_session_user($context);
  json_ok(["preferences" => load_preferences((int)$user["user_id"])]);
}

function handle_user_preferences_put(): void {
  $context = route_bootstrap("PUT", true);
  $user = require_session_user($context);
  $userId = (int)$user["user_id"];
  $body = $context["body"];
  $stmt = db()->prepare("
    INSERT INTO spd_user_preferences
      (user_id, display_name, preferred_currency, theme_mode, accent_color, notification_preferences)
    VALUES
      (:user_id, :display_name, :preferred_currency, :theme_mode, :accent_color, :notification_preferences)
    ON DUPLICATE KEY UPDATE
      display_name = VALUES(display_name),
      preferred_currency = VALUES(preferred_currency),
      theme_mode = VALUES(theme_mode),
      accent_color = VALUES(accent_color),
      notification_preferences = VALUES(notification_preferences),
      deleted_at = NULL
  ");
  $stmt->execute([
    ":user_id" => $userId,
    ":display_name" => $body["display_name"] ?? null,
    ":preferred_currency" => $body["preferred_currency"] ?? "USD",
    ":theme_mode" => $body["theme_mode"] ?? "system",
    ":accent_color" => $body["accent_color"] ?? null,
    ":notification_preferences" => isset($body["notification_preferences"]) ? json_encode($body["notification_preferences"]) : null,
  ]);
  json_ok(["preferences" => load_preferences($userId)]);
}

function handle_user_app_settings_get(): void {
  $context = route_bootstrap("GET", true);
  $user = require_session_user($context);
  json_ok(["app_settings" => load_app_settings((int)$user["user_id"], $context)]);
}

function handle_user_app_settings_put(): void {
  $context = route_bootstrap("PUT", true);
  $user = require_session_user($context);
  $body = $context["body"];
  $stmt = db()->prepare("
    INSERT INTO spd_user_app_settings
      (user_id, app_key, tenant_key, dashboard_layout, envelope_style, default_budget_period, settings_json)
    VALUES
      (:user_id, :app_key, :tenant_key, :dashboard_layout, :envelope_style, :default_budget_period, :settings_json)
    ON DUPLICATE KEY UPDATE
      dashboard_layout = VALUES(dashboard_layout),
      envelope_style = VALUES(envelope_style),
      default_budget_period = VALUES(default_budget_period),
      settings_json = VALUES(settings_json),
      deleted_at = NULL
  ");
  $stmt->execute([
    ":user_id" => (int)$user["user_id"],
    ":app_key" => $context["app_key"],
    ":tenant_key" => $context["tenant_key"],
    ":dashboard_layout" => $body["dashboard_layout"] ?? "default",
    ":envelope_style" => $body["envelope_style"] ?? "classic",
    ":default_budget_period" => $body["default_budget_period"] ?? "monthly",
    ":settings_json" => isset($body["settings_json"]) ? json_encode($body["settings_json"]) : null,
  ]);
  json_ok(["app_settings" => load_app_settings((int)$user["user_id"], $context)]);
}

function handle_invites_create_post(): void {
  $context = route_bootstrap("POST", true);
  $user = require_session_user($context);
  $coupleId = body_int($context, "couple_id", false) ?? tf_couple_id($context);
  $code = strtoupper(substr(bin2hex(random_bytes(6)), 0, 10));
  $id = tf_insert("spd_tf_couple_invites", [
    "app_key" => $context["app_key"],
    "tenant_key" => $context["tenant_key"],
    "couple_id" => $coupleId,
    "invite_code" => $code,
    "role" => body_string($context, "role", false) ?? "partner",
    "created_by_user_id" => (int)$user["user_id"],
    "expires_at" => gmdate("Y-m-d H:i:s", time() + (60 * 60 * 24 * 7)),
  ]);
  json_ok(["id" => $id, "invite_code" => $code], 201);
}

function handle_invites_accept_post(): void {
  $context = route_bootstrap("POST", true);
  $user = require_session_user($context);
  $code = strtoupper((string)body_string($context, "invite_code"));
  $stmt = db()->prepare("
    SELECT * FROM spd_tf_couple_invites
    WHERE invite_code = :code
      AND app_key = :app_key
      AND deleted_at IS NULL
      AND accepted_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW())
    LIMIT 1
  ");
  $stmt->execute([":code" => $code, ":app_key" => $context["app_key"]]);
  $invite = $stmt->fetch();
  if (!$invite) fail_json("Invite not found", 404);

  $link = db()->prepare("
    INSERT INTO spd_tf_user_couple_links (app_key, tenant_key, user_id, couple_id, role, status)
    VALUES (:app_key, :tenant_key, :user_id, :couple_id, :role, 'active')
    ON DUPLICATE KEY UPDATE role = VALUES(role), status = 'active', deleted_at = NULL
  ");
  $link->execute([
    ":app_key" => $invite["app_key"],
    ":tenant_key" => $invite["tenant_key"],
    ":user_id" => (int)$user["user_id"],
    ":couple_id" => (int)$invite["couple_id"],
    ":role" => $invite["role"],
  ]);

  $update = db()->prepare("UPDATE spd_tf_couple_invites SET accepted_by_user_id = :user_id, accepted_at = NOW() WHERE id = :id");
  $update->execute([":user_id" => (int)$user["user_id"], ":id" => (int)$invite["id"]]);
  json_ok(["couple_id" => (int)$invite["couple_id"], "tenant_key" => $invite["tenant_key"], "role" => $invite["role"]]);
}

function handle_app_context_get(): void {
  $context = route_bootstrap("GET", false);
  json_ok(["app" => $context["app"], "tenant" => $context["tenant"]]);
}

function handle_app_features_get(): void {
  $context = route_bootstrap("GET", true);
  $stmt = db()->prepare("
    SELECT f.code AS feature_key, f.name, f.description, COALESCE(ff.enabled, 1) AS enabled
    FROM spd_app_features f
    LEFT JOIN spd_app_feature_flags ff
      ON ff.app_slug = f.app_slug AND ff.tenant_key = :tenant_key AND ff.feature_code = f.code
    WHERE f.app_slug = :app_key
    ORDER BY f.code
  ");
  $stmt->execute([":app_key" => $context["app_key"], ":tenant_key" => $context["tenant_key"]]);
  json_ok(["features" => $stmt->fetchAll() ?: []]);
}

function handle_app_components_get(): void {
  $context = route_bootstrap("GET", true);
  $stmt = db()->prepare("
    SELECT r.component_key, r.name, r.description, c.config_json, COALESCE(c.enabled, 1) AS enabled
    FROM spd_app_component_registry r
    LEFT JOIN spd_app_component_configs c
      ON c.app_slug = r.app_slug AND c.tenant_key = :tenant_key AND c.component_key = r.component_key
    WHERE r.app_slug = :app_key AND r.deleted_at IS NULL
    ORDER BY r.component_key
  ");
  $stmt->execute([":app_key" => $context["app_key"], ":tenant_key" => $context["tenant_key"]]);
  json_ok(["components" => $stmt->fetchAll() ?: []]);
}

function handle_couples_get(): void {
  $context = route_bootstrap("GET", true);
  json_ok(["couples" => tf_list("spd_tf_couples", $context)]);
}

function handle_couples_post(): void {
  $context = route_bootstrap("POST", true);
  $user = bearer_token() ? require_session_user($context) : null;
  $id = tf_insert("spd_tf_couples", [
    "app_key" => $context["app_key"],
    "tenant_key" => $context["tenant_key"],
    "display_name" => body_string($context, "display_name"),
    "currency" => body_string($context, "currency", false) ?? "USD",
  ]);
  if ($user) {
    $link = db()->prepare("
      INSERT INTO spd_tf_user_couple_links (app_key, tenant_key, user_id, couple_id, role, status)
      VALUES (:app_key, :tenant_key, :user_id, :couple_id, 'owner', 'active')
      ON DUPLICATE KEY UPDATE role = 'owner', status = 'active', deleted_at = NULL
    ");
    $link->execute([
      ":app_key" => $context["app_key"],
      ":tenant_key" => $context["tenant_key"],
      ":user_id" => (int)$user["user_id"],
      ":couple_id" => $id,
    ]);
  }
  json_ok(["id" => $id], 201);
}

function handle_expenses_get(): void {
  $context = route_bootstrap("GET", true, "monthly_expense_planner");
  json_ok(["expenses" => tf_list("spd_tf_expenses", $context, tf_couple_id($context))]);
}

function handle_expenses_post(): void {
  $context = route_bootstrap("POST", true, "monthly_expense_planner");
  $id = tf_insert("spd_tf_expenses", [
    "app_key" => $context["app_key"],
    "tenant_key" => $context["tenant_key"],
    "couple_id" => body_int($context, "couple_id", false) ?? tf_couple_id($context),
    "name" => body_string($context, "name"),
    "amount" => body_float($context, "amount"),
    "due_day" => body_int($context, "due_day"),
    "category_key" => body_string($context, "category", false),
  ]);
  json_ok(["id" => $id], 201);
}

function handle_expenses_put(): void {
  $context = route_bootstrap("PUT", true, "monthly_expense_planner");
  $id = body_int($context, "id");
  tf_update("spd_tf_expenses", $id, $context, [
    "name" => body_string($context, "name"),
    "amount" => body_float($context, "amount"),
    "due_day" => body_int($context, "due_day"),
    "category_key" => body_string($context, "category", false),
  ]);
  json_ok(["id" => $id]);
}

function handle_expenses_delete(): void {
  $context = route_bootstrap("DELETE", true, "monthly_expense_planner");
  $id = body_int($context, "id");
  tf_soft_delete("spd_tf_expenses", $id, $context);
  json_ok(["id" => $id]);
}

function handle_piggy_banks_get(): void {
  $context = route_bootstrap("GET", true, "budget_envelopes");
  json_ok(["piggy_banks" => tf_list("spd_tf_piggy_banks", $context, tf_couple_id($context))]);
}

function handle_piggy_banks_post(): void {
  $context = route_bootstrap("POST", true, "budget_envelopes");
  $id = tf_insert("spd_tf_piggy_banks", [
    "app_key" => $context["app_key"],
    "tenant_key" => $context["tenant_key"],
    "couple_id" => body_int($context, "couple_id", false) ?? tf_couple_id($context),
    "name" => body_string($context, "name"),
    "target_amount" => body_float($context, "target_amount"),
    "saved_amount" => body_float($context, "saved_amount", false) ?? 0,
    "due_date" => body_string($context, "due_date", false),
    "template_key" => body_string($context, "template_key", false),
  ]);
  json_ok(["id" => $id], 201);
}

function handle_piggy_banks_put(): void {
  $context = route_bootstrap("PUT", true, "budget_envelopes");
  $id = body_int($context, "id");
  tf_update("spd_tf_piggy_banks", $id, $context, [
    "name" => body_string($context, "name"),
    "target_amount" => body_float($context, "target_amount"),
    "saved_amount" => body_float($context, "saved_amount", false) ?? 0,
    "due_date" => body_string($context, "due_date", false),
    "template_key" => body_string($context, "template_key", false),
  ]);
  json_ok(["id" => $id]);
}

function handle_piggy_banks_delete(): void {
  $context = route_bootstrap("DELETE", true, "budget_envelopes");
  $id = body_int($context, "id");
  tf_soft_delete("spd_tf_piggy_banks", $id, $context);
  json_ok(["id" => $id]);
}

function handle_contributions_get(): void {
  $context = route_bootstrap("GET", true, "partner_contributions");
  json_ok(["contributions" => tf_list("spd_tf_contributions", $context, tf_couple_id($context))]);
}

function handle_contributions_post(): void {
  $context = route_bootstrap("POST", true, "partner_contributions");
  $id = tf_insert("spd_tf_contributions", [
    "app_key" => $context["app_key"],
    "tenant_key" => $context["tenant_key"],
    "couple_id" => body_int($context, "couple_id", false) ?? tf_couple_id($context),
    "partner_id" => body_int($context, "partner_id", false),
    "expense_id" => body_int($context, "expense_id", false),
    "piggy_bank_id" => body_int($context, "piggy_bank_id", false),
    "amount" => body_float($context, "amount"),
    "contributed_at" => body_string($context, "contributed_at", false),
    "note" => body_string($context, "note", false),
  ]);
  json_ok(["id" => $id], 201);
}

function handle_contributions_put(): void {
  $context = route_bootstrap("PUT", true, "partner_contributions");
  $id = body_int($context, "id");
  tf_update("spd_tf_contributions", $id, $context, [
    "partner_id" => body_int($context, "partner_id", false),
    "expense_id" => body_int($context, "expense_id", false),
    "piggy_bank_id" => body_int($context, "piggy_bank_id", false),
    "amount" => body_float($context, "amount"),
    "contributed_at" => body_string($context, "contributed_at", false),
    "note" => body_string($context, "note", false),
  ]);
  json_ok(["id" => $id]);
}

function handle_contributions_delete(): void {
  $context = route_bootstrap("DELETE", true, "partner_contributions");
  $id = body_int($context, "id");
  tf_soft_delete("spd_tf_contributions", $id, $context);
  json_ok(["id" => $id]);
}

function handle_bank_accounts_get(): void {
  $context = route_bootstrap("GET", true, "bank_sync_mock");
  json_ok(["bank_accounts" => tf_list("spd_tf_bank_accounts", $context, tf_couple_id($context))]);
}

function handle_bank_accounts_post(): void {
  $context = route_bootstrap("POST", true, "bank_sync_mock");
  $id = tf_insert("spd_tf_bank_accounts", [
    "app_key" => $context["app_key"],
    "tenant_key" => $context["tenant_key"],
    "couple_id" => body_int($context, "couple_id", false) ?? tf_couple_id($context),
    "institution_name" => body_string($context, "institution_name"),
    "account_name" => body_string($context, "account_name"),
    "account_type" => body_string($context, "account_type"),
    "last4" => body_string($context, "last4"),
    "balance" => body_float($context, "balance", false),
    "last_synced_at" => body_string($context, "last_synced_at", false),
  ]);
  json_ok(["id" => $id], 201);
}

function handle_bank_accounts_delete(): void {
  $context = route_bootstrap("DELETE", true, "bank_sync_mock");
  $id = body_int($context, "id");
  tf_soft_delete("spd_tf_bank_accounts", $id, $context);
  json_ok(["id" => $id]);
}

function handle_transactions_get(): void {
  $context = route_bootstrap("GET", true, "transaction_assignment");
  json_ok(["transactions" => tf_list("spd_tf_transactions", $context, tf_couple_id($context))]);
}

function handle_transactions_post(): void {
  $context = route_bootstrap("POST", true, "transaction_assignment");
  $id = tf_insert("spd_tf_transactions", [
    "app_key" => $context["app_key"],
    "tenant_key" => $context["tenant_key"],
    "couple_id" => body_int($context, "couple_id", false) ?? tf_couple_id($context),
    "bank_account_id" => body_int($context, "bank_account_id", false),
    "merchant" => body_string($context, "merchant"),
    "amount" => body_float($context, "amount"),
    "transaction_date" => body_string($context, "transaction_date"),
    "category_key" => body_string($context, "category", false),
  ]);
  json_ok(["id" => $id], 201);
}

function handle_transactions_assign_post(): void {
  $context = route_bootstrap("POST", true, "transaction_assignment");
  $id = tf_insert("spd_tf_transaction_assignments", [
    "app_key" => $context["app_key"],
    "tenant_key" => $context["tenant_key"],
    "couple_id" => body_int($context, "couple_id", false) ?? tf_couple_id($context),
    "transaction_id" => body_int($context, "transaction_id"),
    "assigned_to_type" => body_string($context, "assigned_to_type"),
    "assigned_to_id" => body_int($context, "assigned_to_id", false),
  ]);
  json_ok(["id" => $id], 201);
}
