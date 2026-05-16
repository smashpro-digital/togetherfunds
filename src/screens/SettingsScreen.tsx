import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { MoneyRow } from "../components/MoneyRow";
import { RootStackParamList } from "../navigation/types";
import { Screen } from "../components/Screen";
import { useFunds } from "../state/FundsContext";
import { setSyncMode, useSyncMode } from "../store/syncModeStore";
import { colors, radii, spacing } from "../theme";

type Navigation = NativeStackScreenProps<RootStackParamList>["navigation"];

export function SettingsScreen() {
  const navigation = useNavigation<Navigation>();
  const { mode } = useSyncMode();
  const { expenses, piggyBanks, resetDemoData } = useFunds();

  function confirmReset() {
    Alert.alert("Reset demo data?", "This restores the sample TogetherFunds expenses and piggy bank.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: resetDemoData }
    ]);
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
        <Text selectable style={styles.body}>
          Local Demo Mode keeps Expo Go fully offline. Server Sync Mode prepares the app to call the SmashPro PHP API.
        </Text>
        <View style={styles.segment}>
          <ModeOption label="Local Demo Mode" selected={mode === "local"} onPress={() => setSyncMode("local")} />
          <ModeOption label="Server Sync Mode" selected={mode === "server"} onPress={() => setSyncMode("server")} />
        </View>
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
  title: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  }
});
