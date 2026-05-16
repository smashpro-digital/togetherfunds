# TogetherFunds API

This folder is a PHP/MySQL API scaffold for TogetherFunds, organized to match the SmashPro API style used by Deeper Than Skin. It uses SmashPro-style tenant routing with shared `spd_*` app tables and app-specific `spd_tf_*` finance tables.

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
3. Run `sql/togetherfunds_seed.sql` to register `app_key = togetherfunds`, the `demo-couple` tenant, default features, and default component configs.
4. Copy `config.example.php` to `config.local.php` on the server.
5. Put real database credentials and a long random API key in `config.local.php`.
6. Upload `.htaccess.example` as `.htaccess` if the host supports Apache overrides.

Do not commit `config.local.php`, `.env`, logs, or any production secrets.

## Endpoint Naming

Routes are explicit files under `v1/routes`:

- `health.get.php`
- `app.context.get.php`
- `app.features.get.php`
- `app.components.get.php`
- `togetherfunds.couples.get.php`, `togetherfunds.couples.post.php`
- `togetherfunds.expenses.get.php`, `togetherfunds.expenses.post.php`, `togetherfunds.expenses.put.php`, `togetherfunds.expenses.delete.php`
- `togetherfunds.piggy-banks.get.php`, `togetherfunds.piggy-banks.post.php`, `togetherfunds.piggy-banks.put.php`, `togetherfunds.piggy-banks.delete.php`
- `togetherfunds.contributions.get.php`, `togetherfunds.contributions.post.php`, `togetherfunds.contributions.put.php`, `togetherfunds.contributions.delete.php`
- `togetherfunds.bank-accounts.get.php`, `togetherfunds.bank-accounts.post.php`, `togetherfunds.bank-accounts.delete.php`
- `togetherfunds.transactions.get.php`, `togetherfunds.transactions.post.php`, `togetherfunds.transactions.assign.post.php`

All endpoints return JSON and require:

```text
X-SmashPro-Api-Key: your-server-api-key
X-SmashPro-App-Key: togetherfunds
X-SmashPro-Tenant-Key: demo-couple
```

## Tenant Model

`spd_apps` owns reusable app registration. `spd_app_tenants` scopes each deployed customer, couple, or workspace under an `app_key`. TogetherFunds uses `app_key = togetherfunds` and `tenant_key = demo-couple` for the seed tenant.

Every TogetherFunds table is prefixed with `spd_tf_` and filters by `app_key` plus `tenant_key`. Tables that hold couple-owned records also include `couple_id`. This lets SmashPro reuse component and feature infrastructure across future finance, couples, or budgeting apps without turning TogetherFunds into a one-off schema.

Reusable components live in:

- `spd_app_component_registry`
- `spd_app_component_configs`

Feature controls live in:

- `spd_app_features`
- `spd_app_feature_flags`

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
