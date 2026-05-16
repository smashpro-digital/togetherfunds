CREATE TABLE IF NOT EXISTS tf_couples (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  display_name VARCHAR(160) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  KEY idx_tf_couples_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tf_partners (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  couple_id BIGINT UNSIGNED NOT NULL,
  display_name VARCHAR(160) NOT NULL,
  role_key VARCHAR(60) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  KEY idx_tf_partners_couple (couple_id),
  CONSTRAINT fk_tf_partners_couple FOREIGN KEY (couple_id) REFERENCES tf_couples(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tf_expenses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  couple_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_day TINYINT UNSIGNED NOT NULL,
  category VARCHAR(120) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  KEY idx_tf_expenses_couple (couple_id, deleted_at),
  CONSTRAINT fk_tf_expenses_couple FOREIGN KEY (couple_id) REFERENCES tf_couples(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tf_piggy_banks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  couple_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  saved_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  due_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  KEY idx_tf_piggy_banks_couple (couple_id, deleted_at),
  CONSTRAINT fk_tf_piggy_banks_couple FOREIGN KEY (couple_id) REFERENCES tf_couples(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tf_contributions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
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
  KEY idx_tf_contributions_couple (couple_id, deleted_at),
  KEY idx_tf_contributions_partner (partner_id),
  CONSTRAINT fk_tf_contributions_couple FOREIGN KEY (couple_id) REFERENCES tf_couples(id),
  CONSTRAINT fk_tf_contributions_partner FOREIGN KEY (partner_id) REFERENCES tf_partners(id),
  CONSTRAINT fk_tf_contributions_expense FOREIGN KEY (expense_id) REFERENCES tf_expenses(id),
  CONSTRAINT fk_tf_contributions_piggy_bank FOREIGN KEY (piggy_bank_id) REFERENCES tf_piggy_banks(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tf_bank_accounts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
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
  KEY idx_tf_bank_accounts_couple (couple_id, deleted_at),
  CONSTRAINT fk_tf_bank_accounts_couple FOREIGN KEY (couple_id) REFERENCES tf_couples(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tf_transactions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  couple_id BIGINT UNSIGNED NOT NULL,
  bank_account_id BIGINT UNSIGNED NULL,
  merchant VARCHAR(180) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  transaction_date DATE NOT NULL,
  category VARCHAR(120) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  KEY idx_tf_transactions_couple (couple_id, transaction_date, deleted_at),
  CONSTRAINT fk_tf_transactions_couple FOREIGN KEY (couple_id) REFERENCES tf_couples(id),
  CONSTRAINT fk_tf_transactions_bank_account FOREIGN KEY (bank_account_id) REFERENCES tf_bank_accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tf_transaction_assignments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  couple_id BIGINT UNSIGNED NOT NULL,
  transaction_id BIGINT UNSIGNED NOT NULL,
  assigned_to_type ENUM('monthlyExpense','piggyBank','partnerContribution') NOT NULL,
  assigned_to_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_tf_assignment_transaction (transaction_id),
  KEY idx_tf_assignments_couple (couple_id),
  CONSTRAINT fk_tf_assignments_couple FOREIGN KEY (couple_id) REFERENCES tf_couples(id),
  CONSTRAINT fk_tf_assignments_transaction FOREIGN KEY (transaction_id) REFERENCES tf_transactions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tf_api_errors (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  correlation_id VARCHAR(64) NULL,
  endpoint VARCHAR(160) NULL,
  method VARCHAR(16) NULL,
  error_type VARCHAR(120) NULL,
  message TEXT NULL,
  request_headers MEDIUMTEXT NULL,
  request_body MEDIUMTEXT NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tf_api_errors_correlation (correlation_id),
  KEY idx_tf_api_errors_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
