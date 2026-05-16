-- TogetherFunds tenant-aware schema for SmashPro.
-- This file is migration-safe for a shared SmashPro database: shared spd_* tables
-- are created only when missing and use the existing export's column conventions.

CREATE TABLE IF NOT EXISTS spd_apps (
  app_key varchar(30) NOT NULL,
  name varchar(100) NOT NULL,
  description text,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  client_type enum('mobile','web','admin','watch','service') NOT NULL DEFAULT 'mobile',
  PRIMARY KEY (app_key),
  UNIQUE KEY uq_spd_apps_app_key (app_key)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS spd_app_features (
  id int(11) NOT NULL AUTO_INCREMENT,
  app_slug varchar(32) NOT NULL,
  code varchar(64) NOT NULL,
  name varchar(128) NOT NULL,
  description varchar(255) DEFAULT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_app_feature (app_slug, code),
  KEY idx_app (app_slug)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS spd_api_keys (
  id int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  key_hash varbinary(32) NOT NULL,
  label varchar(100) NOT NULL,
  is_active tinyint(1) NOT NULL DEFAULT '1',
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_spd_api_keys_hash (key_hash)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS spd_api_error_logs (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  correlation_id char(36) NOT NULL,
  occurred_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  method varchar(10) NOT NULL,
  path varchar(255) NOT NULL,
  query_string text,
  http_status int(11) DEFAULT NULL,
  error_type varchar(100) DEFAULT NULL,
  error_message text,
  error_file varchar(255) DEFAULT NULL,
  error_line int(11) DEFAULT NULL,
  stack_trace mediumtext,
  request_headers json DEFAULT NULL,
  request_body mediumtext,
  ip_address varchar(45) DEFAULT NULL,
  user_agent varchar(255) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_spd_api_error_logs_correlation (correlation_id),
  KEY idx_spd_api_error_logs_occurred (occurred_at)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS spd_app_tenants (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key varchar(30) NOT NULL,
  tenant_key varchar(120) NOT NULL,
  display_name varchar(180) NOT NULL,
  status varchar(40) NOT NULL DEFAULT 'active',
  metadata_json json DEFAULT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_spd_app_tenants_key (app_key, tenant_key),
  KEY idx_spd_app_tenants_app (app_key, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS spd_app_feature_flags (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  app_slug varchar(32) NOT NULL,
  tenant_key varchar(120) NOT NULL,
  feature_code varchar(64) NOT NULL,
  enabled tinyint(1) NOT NULL DEFAULT '1',
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_spd_app_feature_flags_key (app_slug, tenant_key, feature_code),
  KEY idx_spd_app_feature_flags_tenant (app_slug, tenant_key, enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS spd_app_component_registry (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  app_slug varchar(32) NOT NULL,
  component_key varchar(120) NOT NULL,
  component_type varchar(80) NOT NULL,
  name varchar(160) NOT NULL,
  description text,
  reusable_scope varchar(80) NOT NULL DEFAULT 'app_type',
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_spd_component_registry_key (app_slug, component_key),
  KEY idx_spd_component_registry_app (app_slug, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS spd_app_component_configs (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  app_slug varchar(32) NOT NULL,
  tenant_key varchar(120) NOT NULL,
  component_key varchar(120) NOT NULL,
  enabled tinyint(1) NOT NULL DEFAULT '1',
  config_json json DEFAULT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_spd_component_configs_key (app_slug, tenant_key, component_key),
  KEY idx_spd_component_configs_tenant (app_slug, tenant_key, enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS spd_tf_couples (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key varchar(30) NOT NULL,
  tenant_key varchar(120) NOT NULL,
  user_id int(11) DEFAULT NULL,
  display_name varchar(160) NOT NULL,
  currency char(3) NOT NULL DEFAULT 'USD',
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_spd_tf_couples_tenant (app_key, tenant_key),
  KEY idx_spd_tf_couples_tenant (app_key, tenant_key, deleted_at),
  KEY idx_spd_tf_couples_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS spd_tf_partners (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key varchar(30) NOT NULL,
  tenant_key varchar(120) NOT NULL,
  couple_id bigint(20) UNSIGNED NOT NULL,
  user_id int(11) DEFAULT NULL,
  display_name varchar(160) NOT NULL,
  role_key varchar(60) DEFAULT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_spd_tf_partners_role (app_key, tenant_key, couple_id, role_key),
  KEY idx_spd_tf_partners_tenant (app_key, tenant_key, couple_id, deleted_at),
  KEY idx_spd_tf_partners_user (user_id),
  CONSTRAINT fk_spd_tf_partners_couple FOREIGN KEY (couple_id) REFERENCES spd_tf_couples(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS spd_tf_budget_periods (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key varchar(30) NOT NULL,
  tenant_key varchar(120) NOT NULL,
  couple_id bigint(20) UNSIGNED NOT NULL,
  period_key varchar(40) NOT NULL,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  status varchar(40) NOT NULL DEFAULT 'open',
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_spd_tf_budget_period (app_key, tenant_key, couple_id, period_key),
  KEY idx_spd_tf_budget_period_dates (app_key, tenant_key, starts_on, ends_on),
  CONSTRAINT fk_spd_tf_budget_periods_couple FOREIGN KEY (couple_id) REFERENCES spd_tf_couples(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS spd_tf_categories (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key varchar(30) NOT NULL,
  tenant_key varchar(120) DEFAULT NULL,
  category_key varchar(120) NOT NULL,
  name varchar(160) NOT NULL,
  category_type varchar(60) NOT NULL,
  sort_order int(11) NOT NULL DEFAULT '0',
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_spd_tf_category (app_key, tenant_key, category_key),
  KEY idx_spd_tf_category_type (app_key, tenant_key, category_type, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS spd_tf_envelope_templates (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key varchar(30) NOT NULL,
  template_key varchar(120) NOT NULL,
  name varchar(160) NOT NULL,
  category_key varchar(120) DEFAULT NULL,
  default_target_amount decimal(12,2) DEFAULT NULL,
  config_json json DEFAULT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_spd_tf_template (app_key, template_key),
  KEY idx_spd_tf_template_category (app_key, category_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS spd_tf_expenses (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key varchar(30) NOT NULL,
  tenant_key varchar(120) NOT NULL,
  couple_id bigint(20) UNSIGNED NOT NULL,
  budget_period_id bigint(20) UNSIGNED DEFAULT NULL,
  name varchar(180) NOT NULL,
  amount decimal(12,2) NOT NULL,
  due_day tinyint(3) UNSIGNED NOT NULL,
  category_key varchar(120) DEFAULT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_spd_tf_expense_name (app_key, tenant_key, couple_id, name),
  KEY idx_spd_tf_expenses_tenant (app_key, tenant_key, couple_id, deleted_at),
  KEY idx_spd_tf_expenses_due_day (app_key, tenant_key, due_day),
  CONSTRAINT fk_spd_tf_expenses_couple FOREIGN KEY (couple_id) REFERENCES spd_tf_couples(id),
  CONSTRAINT fk_spd_tf_expenses_period FOREIGN KEY (budget_period_id) REFERENCES spd_tf_budget_periods(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS spd_tf_piggy_banks (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key varchar(30) NOT NULL,
  tenant_key varchar(120) NOT NULL,
  couple_id bigint(20) UNSIGNED NOT NULL,
  template_key varchar(120) DEFAULT NULL,
  name varchar(180) NOT NULL,
  target_amount decimal(12,2) NOT NULL,
  saved_amount decimal(12,2) NOT NULL DEFAULT '0.00',
  due_date date DEFAULT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_spd_tf_piggy_bank_name (app_key, tenant_key, couple_id, name),
  KEY idx_spd_tf_piggy_banks_tenant (app_key, tenant_key, couple_id, deleted_at),
  KEY idx_spd_tf_piggy_banks_due_date (app_key, tenant_key, due_date),
  CONSTRAINT fk_spd_tf_piggy_banks_couple FOREIGN KEY (couple_id) REFERENCES spd_tf_couples(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS spd_tf_contributions (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key varchar(30) NOT NULL,
  tenant_key varchar(120) NOT NULL,
  couple_id bigint(20) UNSIGNED NOT NULL,
  partner_id bigint(20) UNSIGNED DEFAULT NULL,
  expense_id bigint(20) UNSIGNED DEFAULT NULL,
  piggy_bank_id bigint(20) UNSIGNED DEFAULT NULL,
  amount decimal(12,2) NOT NULL,
  contributed_at datetime DEFAULT NULL,
  note varchar(255) DEFAULT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_spd_tf_contributions_tenant (app_key, tenant_key, couple_id, deleted_at),
  KEY idx_spd_tf_contributions_partner (partner_id),
  CONSTRAINT fk_spd_tf_contributions_couple FOREIGN KEY (couple_id) REFERENCES spd_tf_couples(id),
  CONSTRAINT fk_spd_tf_contributions_partner FOREIGN KEY (partner_id) REFERENCES spd_tf_partners(id),
  CONSTRAINT fk_spd_tf_contributions_expense FOREIGN KEY (expense_id) REFERENCES spd_tf_expenses(id),
  CONSTRAINT fk_spd_tf_contributions_piggy_bank FOREIGN KEY (piggy_bank_id) REFERENCES spd_tf_piggy_banks(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS spd_tf_bank_accounts (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key varchar(30) NOT NULL,
  tenant_key varchar(120) NOT NULL,
  couple_id bigint(20) UNSIGNED NOT NULL,
  provider varchar(32) NOT NULL DEFAULT 'plaid',
  institution_name varchar(180) NOT NULL,
  account_name varchar(180) NOT NULL,
  account_type varchar(60) NOT NULL,
  last4 char(4) NOT NULL,
  balance decimal(12,2) DEFAULT NULL,
  last_synced_at datetime DEFAULT NULL,
  metadata_json json DEFAULT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_spd_tf_bank_accounts_tenant (app_key, tenant_key, couple_id, deleted_at),
  KEY idx_spd_tf_bank_accounts_provider (provider, last_synced_at),
  CONSTRAINT fk_spd_tf_bank_accounts_couple FOREIGN KEY (couple_id) REFERENCES spd_tf_couples(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS spd_tf_transactions (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key varchar(30) NOT NULL,
  tenant_key varchar(120) NOT NULL,
  couple_id bigint(20) UNSIGNED NOT NULL,
  bank_account_id bigint(20) UNSIGNED DEFAULT NULL,
  merchant varchar(180) NOT NULL,
  amount decimal(12,2) NOT NULL,
  transaction_date date NOT NULL,
  category_key varchar(120) DEFAULT NULL,
  raw_payload json DEFAULT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_spd_tf_transactions_tenant (app_key, tenant_key, couple_id, transaction_date, deleted_at),
  KEY idx_spd_tf_transactions_account (bank_account_id, transaction_date),
  CONSTRAINT fk_spd_tf_transactions_couple FOREIGN KEY (couple_id) REFERENCES spd_tf_couples(id),
  CONSTRAINT fk_spd_tf_transactions_bank_account FOREIGN KEY (bank_account_id) REFERENCES spd_tf_bank_accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS spd_tf_transaction_assignments (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key varchar(30) NOT NULL,
  tenant_key varchar(120) NOT NULL,
  couple_id bigint(20) UNSIGNED NOT NULL,
  transaction_id bigint(20) UNSIGNED NOT NULL,
  assigned_to_type enum('monthlyExpense','piggyBank','partnerContribution') NOT NULL,
  assigned_to_id bigint(20) UNSIGNED DEFAULT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_spd_tf_assignment_transaction (app_key, tenant_key, transaction_id),
  KEY idx_spd_tf_assignments_tenant (app_key, tenant_key, couple_id),
  CONSTRAINT fk_spd_tf_assignments_couple FOREIGN KEY (couple_id) REFERENCES spd_tf_couples(id),
  CONSTRAINT fk_spd_tf_assignments_transaction FOREIGN KEY (transaction_id) REFERENCES spd_tf_transactions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
