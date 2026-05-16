# TogetherFunds

TogetherFunds is a warm, mobile-first Expo app for couples who want to plan shared expenses, monthly bills, savings goals, and virtual cash-envelope piggy banks.

## Local Setup

```bash
npm install
npx expo start --tunnel
```

Open Expo Go on your phone and scan the QR code shown by Expo.

## Included Areas

- Dashboard summary
- Monthly expenses
- Virtual piggy banks
- Add and edit expense forms
- Add and edit piggy bank forms
- Partner contribution tracking
- Partner summary
- Plaid Sandbox-ready bank sync mock
- Recent transaction assignment mock
- AsyncStorage persistence
- Demo data reset

## Plaid Sandbox Bank Sync

The Bank Sync screen is a sandbox-ready architecture for Plaid integration. The current MVP uses mock data only so Expo Go remains runnable with:

```bash
npm install
npx expo start --tunnel
```

Security rules for production:

- Plaid Link must be used on the client. Do not ask users for bank usernames or passwords directly.
- The Plaid `public_token` must be exchanged for an `access_token` on a secure backend.
- The Plaid `access_token` must never be stored in AsyncStorage or on the device.
- Backend services should handle all Plaid API calls and return only safe account metadata and app-ready transaction data.
- Add a Firebase, Supabase, or Node backend before connecting real financial institutions.

The local mock stores only sandbox account metadata and mock transactions:

- Institution name
- Account name and type
- Last 4 digits
- Current/available balances when provided
- Last synced time

## SmashPro Tenant API

TogetherFunds is scaffolded to fit the SmashPro shared app architecture. The backend API uses:

- `spd_apps` for reusable app registration with `app_key = togetherfunds`
- `spd_app_tenants` for tenant/workspace scope with `tenant_key = demo-couple`
- `spd_app_features` and `spd_app_feature_flags` for reusable feature gating
- `spd_app_component_registry` and `spd_app_component_configs` for reusable app components
- `spd_tf_*` tables for TogetherFunds-specific couples, expenses, envelopes, contributions, bank metadata, and transaction assignments

The Expo client sends these headers on server requests:

```text
X-SmashPro-Api-Key
X-SmashPro-App-Key: togetherfunds
X-SmashPro-Tenant-Key: demo-couple
```

Server Sync Mode in Settings shows the app key, tenant key, API health, and feature flags returned by the server.

## Sample Data

- Car Service: $600 target, $250 saved
- Rent: $1,800 due on the 1st
- Utilities: $260 due on the 15th
- Groceries: $700 monthly
- Partner A contributes $400
- Partner B contributes $350

## Project Structure

```text
App.tsx
app.json
src/
  components/
  data/
  navigation/
  screens/
  state/
  types/
  utils/
assets/
```
