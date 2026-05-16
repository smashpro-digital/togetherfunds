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
  client_type = VALUES(client_type);

INSERT INTO spd_app_tenants (app_key, tenant_key, display_name, status, metadata_json)
VALUES ('togetherfunds', 'demo-couple', 'Demo Couple', 'active', JSON_OBJECT('environment', 'demo'))
ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name),
  status = VALUES(status),
  metadata_json = VALUES(metadata_json),
  deleted_at = NULL;

INSERT INTO spd_app_features (app_slug, code, name, description)
VALUES
  ('togetherfunds', 'monthly_expense_planner', 'Monthly Expense Planner', 'Recurring bill planning and funding progress.'),
  ('togetherfunds', 'budget_envelopes', 'Budget Envelopes', 'Virtual piggy banks and reusable envelope templates.'),
  ('togetherfunds', 'partner_contributions', 'Partner Contributions', 'Track partner funding activity.'),
  ('togetherfunds', 'bank_sync_mock', 'Bank Sync Mock', 'Sandbox bank metadata and transaction import.'),
  ('togetherfunds', 'transaction_assignment', 'Transaction Assignment', 'Assign bank transactions to app objects.')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description);

INSERT INTO spd_app_feature_flags (app_slug, tenant_key, feature_code, enabled)
VALUES
  ('togetherfunds', 'demo-couple', 'monthly_expense_planner', 1),
  ('togetherfunds', 'demo-couple', 'budget_envelopes', 1),
  ('togetherfunds', 'demo-couple', 'partner_contributions', 1),
  ('togetherfunds', 'demo-couple', 'bank_sync_mock', 1),
  ('togetherfunds', 'demo-couple', 'transaction_assignment', 1)
ON DUPLICATE KEY UPDATE enabled = VALUES(enabled), deleted_at = NULL;

INSERT INTO spd_app_component_registry (app_slug, component_key, component_type, name, description, reusable_scope)
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

INSERT INTO spd_app_component_configs (app_slug, tenant_key, component_key, enabled, config_json)
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

SET @demo_couple_id = (
  SELECT id FROM spd_tf_couples
  WHERE app_key = 'togetherfunds' AND tenant_key = 'demo-couple'
  LIMIT 1
);

INSERT INTO spd_tf_partners (app_key, tenant_key, couple_id, display_name, role_key)
VALUES
  ('togetherfunds', 'demo-couple', @demo_couple_id, 'Partner A', 'partnerA'),
  ('togetherfunds', 'demo-couple', @demo_couple_id, 'Partner B', 'partnerB')
ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name),
  deleted_at = NULL;

INSERT INTO spd_tf_categories (app_key, tenant_key, category_key, name, category_type, sort_order)
VALUES
  ('togetherfunds', 'demo-couple', 'housing', 'Housing', 'expense', 10),
  ('togetherfunds', 'demo-couple', 'groceries', 'Groceries', 'expense', 20),
  ('togetherfunds', 'demo-couple', 'transportation', 'Transportation', 'expense', 30),
  ('togetherfunds', 'demo-couple', 'savings', 'Savings', 'envelope', 40)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  category_type = VALUES(category_type),
  sort_order = VALUES(sort_order),
  deleted_at = NULL;

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

INSERT INTO spd_tf_expenses (app_key, tenant_key, couple_id, name, amount, due_day, category_key)
VALUES
  ('togetherfunds', 'demo-couple', @demo_couple_id, 'Rent', 1800.00, 1, 'housing'),
  ('togetherfunds', 'demo-couple', @demo_couple_id, 'Utilities', 260.00, 15, 'housing'),
  ('togetherfunds', 'demo-couple', @demo_couple_id, 'Groceries', 700.00, 5, 'groceries')
ON DUPLICATE KEY UPDATE
  amount = VALUES(amount),
  due_day = VALUES(due_day),
  category_key = VALUES(category_key),
  deleted_at = NULL;

INSERT INTO spd_tf_piggy_banks (app_key, tenant_key, couple_id, template_key, name, target_amount, saved_amount, due_date)
VALUES
  ('togetherfunds', 'demo-couple', @demo_couple_id, 'car_service', 'Car Service', 600.00, 250.00, '2026-06-20'),
  ('togetherfunds', 'demo-couple', @demo_couple_id, 'emergency_fund', 'Emergency Fund', 1000.00, 125.00, NULL)
ON DUPLICATE KEY UPDATE
  template_key = VALUES(template_key),
  target_amount = VALUES(target_amount),
  saved_amount = VALUES(saved_amount),
  due_date = VALUES(due_date),
  deleted_at = NULL;
