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
  $appKey = trim((string)($_SERVER["HTTP_X_SMASHPRO_APP_KEY"] ?? ""));
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
  $id = tf_insert("spd_tf_couples", [
    "app_key" => $context["app_key"],
    "tenant_key" => $context["tenant_key"],
    "display_name" => body_string($context, "display_name"),
    "currency" => body_string($context, "currency", false) ?? "USD",
  ]);
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
