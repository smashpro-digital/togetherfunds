-- TogetherFunds shared SmashPro auth migration
-- Import-safe and rerunnable. Does not include production secrets.

DELIMITER $$

DROP PROCEDURE IF EXISTS spd_tf_add_column_if_missing $$
CREATE PROCEDURE spd_tf_add_column_if_missing(
  IN p_table_name varchar(128),
  IN p_column_name varchar(128),
  IN p_column_definition text
)
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = p_table_name
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = p_table_name
      AND column_name = p_column_name
  ) THEN
    SET @spd_tf_sql = CONCAT('ALTER TABLE `', p_table_name, '` ADD COLUMN ', p_column_definition);
    PREPARE spd_tf_stmt FROM @spd_tf_sql;
    EXECUTE spd_tf_stmt;
    DEALLOCATE PREPARE spd_tf_stmt;
  END IF;
END $$

DELIMITER ;

CALL spd_tf_add_column_if_missing('spd_users', 'email', '`email` varchar(255) DEFAULT NULL');
CALL spd_tf_add_column_if_missing('spd_users', 'name', '`name` varchar(160) DEFAULT NULL');
CALL spd_tf_add_column_if_missing('spd_users', 'first_name', '`first_name` varchar(100) DEFAULT NULL');
CALL spd_tf_add_column_if_missing('spd_users', 'last_name', '`last_name` varchar(100) DEFAULT NULL');
CALL spd_tf_add_column_if_missing('spd_users', 'auth_provider', "`auth_provider` varchar(60) NOT NULL DEFAULT 'local'");
CALL spd_tf_add_column_if_missing('spd_users', 'last_seen_app', '`last_seen_app` varchar(60) DEFAULT NULL');
CALL spd_tf_add_column_if_missing('spd_users', 'app_source', '`app_source` varchar(60) DEFAULT NULL');
CALL spd_tf_add_column_if_missing('spd_users', 'password_hash', '`password_hash` varchar(255) DEFAULT NULL');

DROP PROCEDURE IF EXISTS spd_tf_add_column_if_missing;

CREATE TABLE IF NOT EXISTS spd_user_credentials (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL,
  username varchar(80) DEFAULT NULL,
  email varchar(255) NOT NULL,
  password_hash varchar(255) NOT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_spd_user_credentials_email (email),
  UNIQUE KEY uq_spd_user_credentials_username (username),
  KEY idx_spd_user_credentials_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS spd_user_app_memberships (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL,
  app_key varchar(30) NOT NULL,
  tenant_key varchar(120) DEFAULT NULL,
  role varchar(40) NOT NULL DEFAULT 'member',
  status varchar(40) NOT NULL DEFAULT 'active',
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_spd_user_app_membership (user_id, app_key, tenant_key),
  KEY idx_spd_user_app_memberships_app (app_key, tenant_key, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS spd_user_sessions (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL,
  app_key varchar(30) NOT NULL,
  tenant_key varchar(120) DEFAULT NULL,
  token_hash varbinary(32) NOT NULL,
  refresh_token_hash varbinary(32) DEFAULT NULL,
  expires_at datetime NOT NULL,
  last_seen_at datetime DEFAULT NULL,
  revoked_at datetime DEFAULT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_spd_user_sessions_token (token_hash),
  KEY idx_spd_user_sessions_user (user_id, app_key, tenant_key, revoked_at),
  KEY idx_spd_user_sessions_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS spd_user_preferences (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL,
  display_name varchar(160) DEFAULT NULL,
  preferred_currency char(3) NOT NULL DEFAULT 'USD',
  theme_mode varchar(40) NOT NULL DEFAULT 'system',
  accent_color varchar(32) DEFAULT NULL,
  notification_preferences json DEFAULT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_spd_user_preferences_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS spd_user_app_settings (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL,
  app_key varchar(30) NOT NULL,
  tenant_key varchar(120) DEFAULT NULL,
  dashboard_layout varchar(80) DEFAULT 'default',
  envelope_style varchar(80) DEFAULT 'classic',
  default_budget_period varchar(40) DEFAULT 'monthly',
  settings_json json DEFAULT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_spd_user_app_settings (user_id, app_key, tenant_key),
  KEY idx_spd_user_app_settings_app (app_key, tenant_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS spd_tf_user_couple_links (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key varchar(30) NOT NULL,
  tenant_key varchar(120) NOT NULL,
  user_id int(11) NOT NULL,
  couple_id bigint(20) UNSIGNED NOT NULL,
  role enum('owner','partner','viewer') NOT NULL DEFAULT 'partner',
  status varchar(40) NOT NULL DEFAULT 'active',
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_spd_tf_user_couple_link (app_key, tenant_key, user_id, couple_id),
  KEY idx_spd_tf_user_couple_links_user (user_id, app_key, tenant_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS spd_tf_couple_invites (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  app_key varchar(30) NOT NULL,
  tenant_key varchar(120) NOT NULL,
  couple_id bigint(20) UNSIGNED NOT NULL,
  invite_code varchar(32) NOT NULL,
  role enum('owner','partner','viewer') NOT NULL DEFAULT 'partner',
  created_by_user_id int(11) DEFAULT NULL,
  accepted_by_user_id int(11) DEFAULT NULL,
  accepted_at datetime DEFAULT NULL,
  expires_at datetime DEFAULT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_spd_tf_invite_code (invite_code),
  KEY idx_spd_tf_invites_tenant (app_key, tenant_key, couple_id, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
