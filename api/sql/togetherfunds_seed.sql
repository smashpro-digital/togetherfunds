INSERT INTO spd_apps (app_key, name, description, client_type)
VALUES (
  'togetherfunds',
  'TogetherFunds',
  'Couples expense planning and virtual envelope budgeting app',
  'mobile'
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  client_type = VALUES(client_type),
  deleted_at = NULL;

INSERT INTO spd_app_tenants (app_key, tenant_key, display_name, status, metadata_json)
VALUES ('togetherfunds', 'demo-couple', 'Demo Couple', 'active', JSON_OBJECT('environment', 'demo'))
ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name),
  status = VALUES(status),
  metadata_json = VALUES(metadata_json),
  deleted_at = NULL;

INSERT INTO spd_app_features (app_key, feature_key, name, description, enabled_by_default)
VALUES
  ('togetherfunds', 'monthly_expense_planner', 'Monthly Expense Planner', 'Recurring bill planning and funding progress.', 1),
  ('togetherfunds', 'budget_envelopes', 'Budget Envelopes', 'Virtual piggy banks and reusable envelope templates.', 1),
  ('togetherfunds', 'partner_contributions', 'Partner Contributions', 'Track partner funding activity.', 1),
  ('togetherfunds', 'bank_sync_mock', 'Bank Sync Mock', 'Sandbox bank metadata and transaction import.', 1),
  ('togetherfunds', 'transaction_assignment', 'Transaction Assignment', 'Assign bank transactions to app objects.', 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  enabled_by_default = VALUES(enabled_by_default),
  deleted_at = NULL;

INSERT INTO spd_app_feature_flags (app_key, tenant_key, feature_key, enabled)
VALUES
  ('togetherfunds', 'demo-couple', 'monthly_expense_planner', 1),
  ('togetherfunds', 'demo-couple', 'budget_envelopes', 1),
  ('togetherfunds', 'demo-couple', 'partner_contributions', 1),
  ('togetherfunds', 'demo-couple', 'bank_sync_mock', 1),
  ('togetherfunds', 'demo-couple', 'transaction_assignment', 1)
ON DUPLICATE KEY UPDATE enabled = VALUES(enabled), deleted_at = NULL;

INSERT INTO spd_app_component_registry (app_key, component_key, component_type, name, description, reusable_scope)
VALUES
  ('togetherfunds', 'dashboard_cards', 'dashboard', 'Dashboard Cards', 'Reusable financial dashboard summary cards.', 'finance'),
  ('togetherfunds', 'monthly_expense_planner', 'planner', 'Monthly Expenses', 'Recurring expense list and progress.', 'finance'),
  ('togetherfunds', 'budget_envelopes', 'envelopes', 'Piggy Banks', 'Reusable savings envelope component.', 'finance'),
  ('togetherfunds', 'partner_contributions', 'tracking', 'Partner Summary', 'Partner contribution breakdown component.', 'finance'),
  ('togetherfunds', 'bank_sync', 'integration', 'Bank Sync', 'Plaid-ready bank metadata component.', 'finance'),
  ('togetherfunds', 'settings', 'settings', 'Settings', 'App settings and sync mode controls.', 'mobile')
ON DUPLICATE KEY UPDATE
  component_type = VALUES(component_type),
  name = VALUES(name),
  description = VALUES(description),
  reusable_scope = VALUES(reusable_scope),
  deleted_at = NULL;

INSERT INTO spd_app_component_configs (app_key, tenant_key, component_key, enabled, config_json)
VALUES
  ('togetherfunds', 'demo-couple', 'dashboard_cards', 1, JSON_OBJECT('screen', 'dashboard', 'order', 10)),
  ('togetherfunds', 'demo-couple', 'monthly_expense_planner', 1, JSON_OBJECT('screen', 'expenses', 'order', 20)),
  ('togetherfunds', 'demo-couple', 'budget_envelopes', 1, JSON_OBJECT('screen', 'piggy_banks', 'order', 30)),
  ('togetherfunds', 'demo-couple', 'partner_contributions', 1, JSON_OBJECT('screen', 'partner_summary', 'order', 40)),
  ('togetherfunds', 'demo-couple', 'settings', 1, JSON_OBJECT('screen', 'settings', 'order', 50)),
  ('togetherfunds', 'demo-couple', 'bank_sync', 1, JSON_OBJECT('screen', 'bank_sync', 'order', 60, 'mode', 'sandbox_mock'))
ON DUPLICATE KEY UPDATE
  enabled = VALUES(enabled),
  config_json = VALUES(config_json),
  deleted_at = NULL;

INSERT INTO spd_tf_couples (app_key, tenant_key, display_name, currency)
VALUES ('togetherfunds', 'demo-couple', 'Demo Couple', 'USD')
ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name),
  currency = VALUES(currency),
  deleted_at = NULL;

INSERT INTO spd_tf_categories (app_key, tenant_key, category_key, name, category_type)
VALUES
  ('togetherfunds', 'demo-couple', 'housing', 'Housing', 'expense'),
  ('togetherfunds', 'demo-couple', 'groceries', 'Groceries', 'expense'),
  ('togetherfunds', 'demo-couple', 'transportation', 'Transportation', 'expense'),
  ('togetherfunds', 'demo-couple', 'savings', 'Savings', 'envelope')
ON DUPLICATE KEY UPDATE name = VALUES(name), category_type = VALUES(category_type), deleted_at = NULL;

INSERT INTO spd_tf_envelope_templates (app_key, template_key, name, category_key, default_target_amount, config_json)
VALUES
  ('togetherfunds', 'emergency_fund', 'Emergency Fund', 'savings', 1000.00, JSON_OBJECT('icon', 'shield')),
  ('togetherfunds', 'car_service', 'Car Service', 'transportation', 600.00, JSON_OBJECT('icon', 'car')),
  ('togetherfunds', 'vacation', 'Vacation', 'savings', 1500.00, JSON_OBJECT('icon', 'plane'))
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  category_key = VALUES(category_key),
  default_target_amount = VALUES(default_target_amount),
  config_json = VALUES(config_json),
  deleted_at = NULL;
