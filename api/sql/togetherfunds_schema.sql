CREATE TABLE IF NOT EXISTS spd_apps (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key VARCHAR(80) NOT NULL,
  name VARCHAR(160) NOT NULL,
  description TEXT NULL,
  client_type VARCHAR(60) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_spd_apps_app_key (app_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS spd_app_tenants (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key VARCHAR(80) NOT NULL,
  tenant_key VARCHAR(120) NOT NULL,
  display_name VARCHAR(180) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  metadata_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_spd_app_tenants_key (app_key, tenant_key),
  KEY idx_spd_app_tenants_app (app_key, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS spd_app_features (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key VARCHAR(80) NOT NULL,
  feature_key VARCHAR(120) NOT NULL,
  name VARCHAR(160) NOT NULL,
  description TEXT NULL,
  enabled_by_default TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_spd_app_features_key (app_key, feature_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS spd_app_feature_flags (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key VARCHAR(80) NOT NULL,
  tenant_key VARCHAR(120) NOT NULL,
  feature_key VARCHAR(120) NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_spd_app_feature_flags_key (app_key, tenant_key, feature_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS spd_app_component_registry (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key VARCHAR(80) NOT NULL,
  component_key VARCHAR(120) NOT NULL,
  component_type VARCHAR(80) NOT NULL,
  name VARCHAR(160) NOT NULL,
  description TEXT NULL,
  reusable_scope VARCHAR(80) NOT NULL DEFAULT 'app_type',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_spd_component_registry_key (app_key, component_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS spd_app_component_configs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key VARCHAR(80) NOT NULL,
  tenant_key VARCHAR(120) NOT NULL,
  component_key VARCHAR(120) NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  config_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_spd_component_configs_key (app_key, tenant_key, component_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS spd_tf_couples (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key VARCHAR(80) NOT NULL,
  tenant_key VARCHAR(120) NOT NULL,
  display_name VARCHAR(160) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_spd_tf_couples_tenant (app_key, tenant_key),
  KEY idx_spd_tf_couples_tenant (app_key, tenant_key, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS spd_tf_partners (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key VARCHAR(80) NOT NULL,
  tenant_key VARCHAR(120) NOT NULL,
  couple_id BIGINT UNSIGNED NOT NULL,
  display_name VARCHAR(160) NOT NULL,
  role_key VARCHAR(60) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  KEY idx_spd_tf_partners_tenant (app_key, tenant_key, couple_id, deleted_at),
  CONSTRAINT fk_spd_tf_partners_couple FOREIGN KEY (couple_id) REFERENCES spd_tf_couples(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS spd_tf_budget_periods (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key VARCHAR(80) NOT NULL,
  tenant_key VARCHAR(120) NOT NULL,
  couple_id BIGINT UNSIGNED NOT NULL,
  period_key VARCHAR(40) NOT NULL,
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_spd_tf_budget_period (app_key, tenant_key, couple_id, period_key),
  CONSTRAINT fk_spd_tf_budget_periods_couple FOREIGN KEY (couple_id) REFERENCES spd_tf_couples(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS spd_tf_categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key VARCHAR(80) NOT NULL,
  tenant_key VARCHAR(120) NULL,
  category_key VARCHAR(120) NOT NULL,
  name VARCHAR(160) NOT NULL,
  category_type VARCHAR(60) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_spd_tf_category (app_key, tenant_key, category_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS spd_tf_envelope_templates (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key VARCHAR(80) NOT NULL,
  template_key VARCHAR(120) NOT NULL,
  name VARCHAR(160) NOT NULL,
  category_key VARCHAR(120) NULL,
  default_target_amount DECIMAL(12,2) NULL,
  config_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_spd_tf_template (app_key, template_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS spd_tf_expenses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key VARCHAR(80) NOT NULL,
  tenant_key VARCHAR(120) NOT NULL,
  couple_id BIGINT UNSIGNED NOT NULL,
  budget_period_id BIGINT UNSIGNED NULL,
  name VARCHAR(180) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_day TINYINT UNSIGNED NOT NULL,
  category_key VARCHAR(120) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  KEY idx_spd_tf_expenses_tenant (app_key, tenant_key, couple_id, deleted_at),
  CONSTRAINT fk_spd_tf_expenses_couple FOREIGN KEY (couple_id) REFERENCES spd_tf_couples(id),
  CONSTRAINT fk_spd_tf_expenses_period FOREIGN KEY (budget_period_id) REFERENCES spd_tf_budget_periods(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS spd_tf_piggy_banks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key VARCHAR(80) NOT NULL,
  tenant_key VARCHAR(120) NOT NULL,
  couple_id BIGINT UNSIGNED NOT NULL,
  template_key VARCHAR(120) NULL,
  name VARCHAR(180) NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  saved_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  due_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  KEY idx_spd_tf_piggy_banks_tenant (app_key, tenant_key, couple_id, deleted_at),
  CONSTRAINT fk_spd_tf_piggy_banks_couple FOREIGN KEY (couple_id) REFERENCES spd_tf_couples(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS spd_tf_contributions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key VARCHAR(80) NOT NULL,
  tenant_key VARCHAR(120) NOT NULL,
  couple_id BIGINT UNSIGNED NOT NULL,
  partner_id BIGINT UNSIGNED NULL,
  expense_id BIGINT UNSIGNED NULL,
  piggy_bank_id BIGINT UNSIGNED NULL,
  amount DECIMAL(12,2) NOT NULL,
  contributed_at DATETIME NULL,
  note VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  KEY idx_spd_tf_contributions_tenant (app_key, tenant_key, couple_id, deleted_at),
  CONSTRAINT fk_spd_tf_contributions_couple FOREIGN KEY (couple_id) REFERENCES spd_tf_couples(id),
  CONSTRAINT fk_spd_tf_contributions_partner FOREIGN KEY (partner_id) REFERENCES spd_tf_partners(id),
  CONSTRAINT fk_spd_tf_contributions_expense FOREIGN KEY (expense_id) REFERENCES spd_tf_expenses(id),
  CONSTRAINT fk_spd_tf_contributions_piggy_bank FOREIGN KEY (piggy_bank_id) REFERENCES spd_tf_piggy_banks(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS spd_tf_bank_accounts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key VARCHAR(80) NOT NULL,
  tenant_key VARCHAR(120) NOT NULL,
  couple_id BIGINT UNSIGNED NOT NULL,
  institution_name VARCHAR(180) NOT NULL,
  account_name VARCHAR(180) NOT NULL,
  account_type VARCHAR(60) NOT NULL,
  last4 CHAR(4) NOT NULL,
  balance DECIMAL(12,2) NULL,
  last_synced_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  KEY idx_spd_tf_bank_accounts_tenant (app_key, tenant_key, couple_id, deleted_at),
  CONSTRAINT fk_spd_tf_bank_accounts_couple FOREIGN KEY (couple_id) REFERENCES spd_tf_couples(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS spd_tf_transactions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key VARCHAR(80) NOT NULL,
  tenant_key VARCHAR(120) NOT NULL,
  couple_id BIGINT UNSIGNED NOT NULL,
  bank_account_id BIGINT UNSIGNED NULL,
  merchant VARCHAR(180) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  transaction_date DATE NOT NULL,
  category_key VARCHAR(120) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  KEY idx_spd_tf_transactions_tenant (app_key, tenant_key, couple_id, transaction_date, deleted_at),
  CONSTRAINT fk_spd_tf_transactions_couple FOREIGN KEY (couple_id) REFERENCES spd_tf_couples(id),
  CONSTRAINT fk_spd_tf_transactions_bank_account FOREIGN KEY (bank_account_id) REFERENCES spd_tf_bank_accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS spd_tf_transaction_assignments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key VARCHAR(80) NOT NULL,
  tenant_key VARCHAR(120) NOT NULL,
  couple_id BIGINT UNSIGNED NOT NULL,
  transaction_id BIGINT UNSIGNED NOT NULL,
  assigned_to_type ENUM('monthlyExpense','piggyBank','partnerContribution') NOT NULL,
  assigned_to_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_spd_tf_assignment_transaction (app_key, tenant_key, transaction_id),
  KEY idx_spd_tf_assignments_tenant (app_key, tenant_key, couple_id),
  CONSTRAINT fk_spd_tf_assignments_couple FOREIGN KEY (couple_id) REFERENCES spd_tf_couples(id),
  CONSTRAINT fk_spd_tf_assignments_transaction FOREIGN KEY (transaction_id) REFERENCES spd_tf_transactions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS spd_tf_api_errors (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  correlation_id VARCHAR(64) NULL,
  endpoint VARCHAR(160) NULL,
  method VARCHAR(16) NULL,
  error_type VARCHAR(120) NULL,
  message TEXT NULL,
  stack_trace MEDIUMTEXT NULL,
  request_headers MEDIUMTEXT NULL,
  request_body MEDIUMTEXT NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_spd_tf_api_errors_correlation (correlation_id),
  KEY idx_spd_tf_api_errors_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
