# TogetherFunds API

This folder is a PHP/MySQL API scaffold for TogetherFunds, organized to match the SmashPro API style used by Deeper Than Skin. It uses the existing SmashPro schema conventions: `spd_apps.app_key`, `spd_app_features.app_slug/code`, hashed `spd_api_keys`, shared `spd_api_error_logs`, and app-specific `spd_tf_*` finance tables.

## Upload Path

Upload the contents of this `api/` folder to the SmashPro server so route files are available at:

```text
/public_html/smashpro.app/api/v1/routes
```

The Expo app should call endpoints by filename, for example:

```text
https://smashpro.app/api/v1/routes/expenses.get.php?couple_id=1
```

## Server Setup

1. Create a MySQL database for TogetherFunds.
2. Run `sql/togetherfunds_schema.sql` in phpMyAdmin or the MySQL client.
3. Run `sql/togetherfunds_seed.sql` to register `app_key = togetherfunds`, the `demo-couple` tenant, default features, default component configs, and demo couple data.
4. If auth tables or user compatibility columns are missing on an existing database, run `sql/togetherfunds_auth_migration.sql`. It is rerunnable and import-safe.
5. Copy `config.example.php` to `config.local.php` on the server.
6. Put real database credentials and a long random API key in `config.local.php`.
7. Upload `.htaccess.example` as `.htaccess` if the host supports Apache overrides.

Do not commit `config.local.php`, `.env`, logs, or any production secrets.

## Endpoint Naming

Routes are explicit files under `v1/routes`:

- `health.get.php`
- `app.context.get.php`
- `app.features.get.php`
- `app.components.get.php`
- `auth.register.post.php`, `auth.login.post.php`, `auth.me.get.php`, `auth.logout.post.php`, `auth.refresh.post.php`
- `auth.debug.get.php`
- `user.preferences.get.php`, `user.preferences.put.php`
- `user.app-settings.get.php`, `user.app-settings.put.php`
- `togetherfunds.couples.get.php`, `togetherfunds.couples.post.php`
- `togetherfunds.expenses.get.php`, `togetherfunds.expenses.post.php`, `togetherfunds.expenses.put.php`, `togetherfunds.expenses.delete.php`
- `togetherfunds.piggy-banks.get.php`, `togetherfunds.piggy-banks.post.php`, `togetherfunds.piggy-banks.put.php`, `togetherfunds.piggy-banks.delete.php`
- `togetherfunds.contributions.get.php`, `togetherfunds.contributions.post.php`, `togetherfunds.contributions.put.php`, `togetherfunds.contributions.delete.php`
- `togetherfunds.bank-accounts.get.php`, `togetherfunds.bank-accounts.post.php`, `togetherfunds.bank-accounts.delete.php`
- `togetherfunds.transactions.get.php`, `togetherfunds.transactions.post.php`, `togetherfunds.transactions.assign.post.php`
- `togetherfunds.invites.create.post.php`, `togetherfunds.invites.accept.post.php`

All endpoints return JSON and require:

```text
X-SmashPro-Api-Key: your-server-api-key
X-SmashPro-App-Key: togetherfunds
X-SmashPro-Tenant-Key: demo-couple
Authorization: Bearer session-token-for-user-routes
```

## Tenant Model

`spd_apps` owns reusable app registration. `spd_app_tenants` scopes each deployed customer, couple, or workspace under an `app_key`. TogetherFunds uses `app_key = togetherfunds` and `tenant_key = demo-couple` for the seed tenant.

Every TogetherFunds table is prefixed with `spd_tf_` and filters by `app_key` plus `tenant_key`. Tables that hold couple-owned records also include `couple_id`. Shared registry/auth/logging data stays in the existing SmashPro tables: `spd_apps`, `spd_app_features`, `spd_api_keys`, and `spd_api_error_logs`.

Reusable components live in:

- `spd_app_component_registry`
- `spd_app_component_configs`

Feature controls live in:

- `spd_app_features`
- `spd_app_feature_flags`

## Shared Identity

TogetherFunds uses one SmashPro identity across apps:

- `spd_users` stores the shared user profile.
- `spd_user_credentials` stores local email/username password hashes when the shared schema does not already provide credential storage.
- `spd_user_app_memberships` links one user to one or more SmashPro apps and tenants.
- `spd_user_sessions` stores hashed session and refresh tokens only.
- `spd_user_preferences` stores cross-app display preferences.
- `spd_user_app_settings` stores TogetherFunds-specific customization such as dashboard layout, envelope style, and default budget period.
- `spd_tf_user_couple_links` links users to TogetherFunds couple workspaces.
- `spd_tf_couple_invites` supports invite-code joins.

Login endpoints still require `X-SmashPro-Api-Key` and `X-SmashPro-App-Key`. Authenticated user routes also require `Authorization: Bearer <session_token>`. Rate limiting for login/register should be added at the server or WAF layer before production.

## Auth Debugging

Use this endpoint after uploading API files:

```text
https://smashpro.app/api/v1/routes/auth.debug.get.php
```

Required headers:

```text
X-SmashPro-Api-Key: your-server-api-key
X-SmashPro-App-Key: togetherfunds
X-SmashPro-Tenant-Key: demo-couple
```

The response confirms bootstrap loading, DB connectivity, app key recognition, auth table presence, and required auth columns. If it reports missing auth tables or columns, import:

```text
api/sql/togetherfunds_auth_migration.sql
```

## Plaid Security Notes

The mobile app must use Plaid Link and send only the `public_token` to a secure backend. The backend exchanges `public_token` for `access_token` and stores that token server-side only.

TogetherFunds should never store bank usernames, bank passwords, or Plaid access tokens on the device. The database stores only safe bank metadata:

- institution name
- account name
- account type
- last 4 digits
- balance
- last synced time

## Expo Connection

Set Expo client placeholders in the app environment:

```text
EXPO_PUBLIC_TOGETHERFUNDS_API_BASE_URL=https://smashpro.app/api/v1/routes
EXPO_PUBLIC_TOGETHERFUNDS_API_KEY=replace-with-non-production-key
EXPO_PUBLIC_TOGETHERFUNDS_APP_KEY=togetherfunds
EXPO_PUBLIC_TOGETHERFUNDS_TENANT_KEY=demo-couple
```

The client has local AsyncStorage fallback so Expo Go testing can continue when the server is not reachable.
