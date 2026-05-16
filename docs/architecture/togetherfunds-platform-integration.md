# TogetherFunds Platform Integration

TogetherFunds is modeled as a tenant-aware SmashPro app, not a standalone database island.

## Schema Patterns Found

The SmashPro schema export uses these platform conventions:

- Tables use the `spd_` prefix.
- App registration lives in `spd_apps` with `app_key`, `name`, `description`, `created_at`, and `client_type`.
- Feature registration lives in `spd_app_features` with `app_slug`, `code`, `name`, `description`, and timestamps.
- API keys live in `spd_api_keys` as SHA-256 binary hashes in `key_hash`; raw keys are not stored.
- API error logging uses shared `spd_api_error_logs` with `correlation_id`, request metadata, stack trace, headers, and body.
- User-facing cross-app records reuse `spd_users`, `spd_notifications`, `spd_rewards_ledger`, and finance/provider event tables where appropriate.
- Commerce and storefront tables generally scope by `app_slug`.
- Mobile/user profile tables frequently use `app_slug`, `app_key`, JSON payload/config columns, and `created_at` / `updated_at`.
- Deletion is mixed across the platform: some tables use `is_deleted`, some use no soft delete, and newer app-owned tables can use nullable `deleted_at`.

## Tenant Model

TogetherFunds uses:

- `app_key = togetherfunds`
- `tenant_key = demo-couple` for the seed tenant
- `couple_id` for finance records owned by a specific couple inside the tenant

Every TogetherFunds-specific table uses the `spd_tf_` prefix and includes `app_key`, `tenant_key` where tenant-scoped, timestamps, and nullable `deleted_at` where soft deletion is useful.

## Shared Tables Reused

TogetherFunds reuses existing shared architecture instead of duplicating it:

- `spd_apps`: app registry
- `spd_app_features`: reusable feature registry
- `spd_api_keys`: API key authentication
- `spd_api_error_logs`: API exception/audit logging
- `spd_users`: future partner/user ownership
- `spd_notifications`: future reminders and sync notifications
- `spd_rewards_ledger`: future reward/badge events
- `spd_finance_events`: future Plaid/backend financial event logging
- `spd_mercury_accounts` / `spd_mercury_transactions`: reference pattern for external finance provider cache tables

## TogetherFunds Tables

- `spd_tf_couples`
- `spd_tf_partners`
- `spd_tf_budget_periods`
- `spd_tf_categories`
- `spd_tf_envelope_templates`
- `spd_tf_expenses`
- `spd_tf_piggy_banks`
- `spd_tf_contributions`
- `spd_tf_bank_accounts`
- `spd_tf_transactions`
- `spd_tf_transaction_assignments`

Bank accounts are metadata-only. Plaid access tokens belong on the backend later and must not be stored in the Expo app.

## API Context

All protected API routes require:

```text
X-SmashPro-Api-Key
X-SmashPro-App-Key: togetherfunds
X-SmashPro-Tenant-Key: demo-couple
```

`api/bootstrap/auth.php` validates raw API keys against `spd_api_keys.key_hash` using `UNHEX(SHA2(:api_key, 256))`, with a `config.local.php` fallback for local/dev deployments.

`api/bootstrap/app_context.php` resolves app and tenant context, exposes feature checks, and ensures TogetherFunds queries filter by `app_key`, `tenant_key`, and `couple_id` where needed.

## Deployment

1. Import `api/sql/togetherfunds_schema.sql` in phpMyAdmin.
2. Import `api/sql/togetherfunds_seed.sql`.
3. Upload API files to `/public_html/smashpro.app/api/` so route files are under `/public_html/smashpro.app/api/v1/routes`.
4. Configure server-only `api/config.local.php`.
5. Set Expo public placeholders for base URL, app key, tenant key, and non-production API key during testing.
