# Run And Test TogetherFunds

## 1. Install Dependencies

```bash
npm install
```

## 2. Start Expo

```bash
npx expo start --tunnel --clear
```

If the tunnel is slow or ngrok times out, use LAN mode while your phone and computer are on the same Wi-Fi:

```bash
npx expo start --lan --clear
```

## 3. Test With Expo Go

1. Install Expo Go on your phone.
2. Open the Expo Go app.
3. Scan the QR code from the terminal or Expo browser window.
4. Confirm the app opens to the TogetherFunds dashboard.

## 4. Smoke Test Checklist

- Dashboard loads with monthly remaining, bill count, and piggy bank totals.
- Monthly Expenses shows Rent, Utilities, and Groceries demo data.
- Piggy Banks shows Car Service with progress toward $600.
- Add/Edit Expense can create and update a monthly bill.
- Add/Edit Piggy Bank can create and update a savings goal.
- Add Contribution updates saved amount and partner contribution totals.
- Partner Summary shows Partner A and Partner B totals.
- Settings can reset demo data.

## 5. Future Android Preview Build

```bash
eas build --platform android --profile preview
```
