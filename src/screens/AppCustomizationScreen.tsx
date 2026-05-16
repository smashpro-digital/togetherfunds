import { useState } from "react";
import { Alert } from "react-native";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { FormField } from "../components/FormField";
import { Screen } from "../components/Screen";
import { useAuthStore } from "../store/authStore";

export function AppCustomizationScreen() {
  const { preferences, appSettings, savePreferences, saveAppSettings } = useAuthStore();
  const [displayName, setDisplayName] = useState(preferences?.display_name ?? "");
  const [currency, setCurrency] = useState(preferences?.preferred_currency ?? "USD");
  const [themeMode, setThemeMode] = useState(preferences?.theme_mode ?? "system");
  const [accentColor, setAccentColor] = useState(preferences?.accent_color ?? "#C6A96B");
  const [dashboardLayout, setDashboardLayout] = useState(appSettings?.dashboard_layout ?? "couple_overview");
  const [envelopeStyle, setEnvelopeStyle] = useState(appSettings?.envelope_style ?? "classic");
  const [defaultBudgetPeriod, setDefaultBudgetPeriod] = useState(appSettings?.default_budget_period ?? "monthly");

  async function save() {
    const savedPreferences = await savePreferences({
      display_name: displayName,
      preferred_currency: currency,
      theme_mode: themeMode,
      accent_color: accentColor,
      notification_preferences: preferences?.notification_preferences ?? { budget_reminders: true }
    });
    const savedSettings = await saveAppSettings({
      dashboard_layout: dashboardLayout,
      envelope_style: envelopeStyle,
      default_budget_period: defaultBudgetPeriod,
      settings_json: appSettings?.settings_json ?? {}
    });

    Alert.alert(savedPreferences && savedSettings ? "Saved" : "Not saved", savedPreferences && savedSettings ? "Customization updated." : "The server did not save every setting.");
  }

  return (
    <Screen title="App Customization" subtitle="Personalize how TogetherFunds works for you.">
      <Card>
        <FormField label="Display name" value={displayName} onChangeText={setDisplayName} />
        <FormField label="Preferred currency" value={currency} onChangeText={setCurrency} autoCapitalize="characters" />
        <FormField label="Theme mode" value={themeMode} onChangeText={setThemeMode} autoCapitalize="none" />
        <FormField label="Accent color" value={accentColor} onChangeText={setAccentColor} autoCapitalize="none" />
        <FormField label="Dashboard layout" value={dashboardLayout} onChangeText={setDashboardLayout} autoCapitalize="none" />
        <FormField label="Envelope style" value={envelopeStyle} onChangeText={setEnvelopeStyle} autoCapitalize="none" />
        <FormField label="Default budget period" value={defaultBudgetPeriod} onChangeText={setDefaultBudgetPeriod} autoCapitalize="none" />
        <AppButton label="Save customization" onPress={save} />
      </Card>
    </Screen>
  );
}
