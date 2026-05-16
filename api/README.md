# TogetherFunds API

This folder is a PHP/MySQL API scaffold for TogetherFunds, organized to match the SmashPro API style used by Deeper Than Skin.

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
3. Copy `config.example.php` to `config.local.php` on the server.
4. Put real database credentials and a long random API key in `config.local.php`.
5. Upload `.htaccess.example` as `.htaccess` if the host supports Apache overrides.

Do not commit `config.local.php`, `.env`, logs, or any production secrets.

## Endpoint Naming

Routes are explicit files under `v1/routes`:

- `health.get.php`
- `couples.get.php`, `couples.post.php`
- `expenses.get.php`, `expenses.post.php`, `expenses.put.php`, `expenses.delete.php`
- `piggy-banks.get.php`, `piggy-banks.post.php`, `piggy-banks.put.php`, `piggy-banks.delete.php`
- `contributions.get.php`, `contributions.post.php`, `contributions.put.php`, `contributions.delete.php`
- `bank-accounts.get.php`, `bank-accounts.post.php`, `bank-accounts.delete.php`
- `transactions.get.php`, `transactions.post.php`, `transactions.assign.post.php`

All endpoints return JSON and require:

```text
X-SmashPro-Api-Key: your-server-api-key
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
```

The client has local AsyncStorage fallback so Expo Go testing can continue when the server is not reachable.
