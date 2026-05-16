import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { MoneyRow } from "../components/MoneyRow";
import { appConfig } from "../config/appConfig";
import { RootStackParamList } from "../navigation/types";
import { Screen } from "../components/Screen";
import { getApiHealth, getAppContext, getAppFeatures, getAuthDebug } from "../services/togetherFundsApi";
import { useFunds } from "../state/FundsContext";
import { useAuthStore } from "../store/authStore";
import { setSyncMode, useSyncMode } from "../store/syncModeStore";
import { colors, radii, spacing } from "../theme";

type Navigation = NativeStackScreenProps<RootStackParamList>["navigation"];

export function SettingsScreen() {
  const navigation = useNavigation<Navigation>();
  const { mode } = useSyncMode();
  const { activeAppKey, tenantKey, user, preferences, appSettings, logout } = useAuthStore();
  const { expenses, piggyBanks, resetDemoData } = useFunds();
  const [apiStatus, setApiStatus] = useState("Not checked");
  const [authDebug, setAuthDebug] = useState("Not checked");
  const [features, setFeatures] = useState<string[]>([]);

  function confirmReset() {
    Alert.alert("Reset demo data?", "This restores the sample TogetherFunds expenses and piggy bank.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: resetDemoData }
    ]);
  }

  async function checkApiHealth() {
    setApiStatus("Checking...");
    const health = await getApiHealth();
    const featureResult = await getAppFeatures();

    setApiStatus(health.data?.status ? `${health.data.status}${health.fromCache ? " (cached)" : ""}` : health.error ?? "Unavailable");
    setFeatures(
      featureResult.data?.features.map((feature) => `${feature.feature_key}: ${feature.enabled ? "on" : "off"}`) ?? []
    );
  }

  async function checkAuthDebug() {
    setAuthDebug("Checking...");
    const [health, debug, context] = await Promise.all([getApiHealth(), getAuthDebug(), getAppContext()]);
    const debugSummary = [
      `health: ${health.status ?? "n/a"} ${health.error ?? health.data?.status ?? ""}`,
      `auth.debug: ${debug.status ?? "n/a"} ${debug.error ?? ""}`,
      `app.context: ${context.status ?? "n/a"} ${context.error ?? ""}`,
      `base: ${appConfig.apiBaseUrl}`,
      `register: ${appConfig.apiBaseUrl.replace(/\/$/, "")}/auth.register.post.php`,
    ];

    if (debug.data?.auth_tables) {
      const missing = Object.entries(debug.data.auth_tables)
        .flatMap(([table, info]) => {
          if (!info.exists) return [`${table}: missing`];
          return Object.entries(info.columns)
            .filter(([, exists]) => !exists)
            .map(([column]) => `${table}.${column}: missing`);
        });
      debugSummary.push(missing.length ? `missing: ${missing.join(", ")}` : "auth tables: ok");
    }

    setAuthDebug(debugSummary.join("\n"));
  }

  return (
    <Screen title="Settings" subtitle="Manage local demo data stored on this device with AsyncStorage.">
      <Card>
        <Text selectable style={styles.title}>
          Local data
        </Text>
        <MoneyRow label="Expenses saved" value={String(expenses.length)} />
        <MoneyRow label="Piggy banks saved" value={String(piggyBanks.length)} />
        <Text selectable style={styles.body}>
          TogetherFunds currently stores data locally for Expo Go testing. No accounts or bank connections are required.
        </Text>
      </Card>
      <Card>
        <Text selectable style={styles.title}>
          Sync mode
        </Text>
        <MoneyRow label="App Key" value={activeAppKey || appConfig.appKey} />
        <MoneyRow label="Tenant Key" value={tenantKey || appConfig.tenantKey} />
        <Text selectable style={styles.body}>
          Local Demo Mode keeps Expo Go fully offline. Server Sync Mode prepares the app to call the SmashPro PHP API.
        </Text>
        <View style={styles.segment}>
          <ModeOption label="Local Demo Mode" selected={mode === "local"} onPress={() => setSyncMode("local")} />
          <ModeOption label="Server Sync Mode" selected={mode === "server"} onPress={() => setSyncMode("server")} />
        </View>
        <MoneyRow label="API Health Check" value={apiStatus} />
        {features.length > 0 ? (
          <View style={styles.featureList}>
            {features.map((feature) => (
              <Text selectable key={feature} style={styles.feature}>
                {feature}
              </Text>
            ))}
          </View>
        ) : null}
        <AppButton label="Check API health" variant="secondary" onPress={checkApiHealth} />
        <AppButton label="Auth Debug" variant="secondary" onPress={checkAuthDebug} />
        <Text selectable style={styles.debugText}>
          {authDebug}
        </Text>
      </Card>
      <Card>
        <Text selectable style={styles.title}>
          SmashPro account
        </Text>
        <MoneyRow label="User" value={user?.name || preferences?.display_name || "Not set"} />
        <MoneyRow label="Email" value={user?.email || "Not set"} />
        <MoneyRow label="Username" value={user?.username || "Not set"} />
        <MoneyRow label="Couple workspace" value={tenantKey || "Not set"} />
        <MoneyRow label="Dashboard layout" value={appSettings?.dashboard_layout || "couple_overview"} />
        <MoneyRow label="Envelope style" value={appSettings?.envelope_style || "classic"} />
        <AppButton label="Profile" variant="secondary" onPress={() => navigation.navigate("Profile")} />
        <AppButton label="App customization" variant="secondary" onPress={() => navigation.navigate("AppCustomization")} />
        <AppButton label="Log out" variant="danger" onPress={logout} />
      </Card>
      <Card>
        <Text selectable style={styles.title}>
          Bank Sync
        </Text>
        <Text selectable style={styles.body}>
          Connect a Plaid Sandbox bank to preview account syncing and transaction assignment without storing bank
          credentials or Plaid tokens on this device.
        </Text>
        <AppButton label="Open Bank Sync" variant="secondary" onPress={() => navigation.navigate("BankSync")} />
      </Card>
      <AppButton label="Reset demo data" variant="danger" onPress={confirmReset} />
    </Screen>
  );
}

function ModeOption({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.option, selected && styles.optionActive]}>
      <Text style={[styles.optionText, selected && styles.optionTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  },
  option: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md
  },
  optionActive: {
    backgroundColor: colors.teal,
    borderColor: colors.gold
  },
  optionText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center"
  },
  optionTextActive: {
    color: "#FFFFFF"
  },
  segment: {
    flexDirection: "row",
    gap: spacing.sm
  },
  feature: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19
  },
  featureList: {
    gap: spacing.xs
  },
  debugText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  }
});
