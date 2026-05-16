import { Alert, StyleSheet, Text } from "react-native";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { MoneyRow } from "../components/MoneyRow";
import { Screen } from "../components/Screen";
import { useFunds } from "../state/FundsContext";
import { colors } from "../theme";

export function SettingsScreen() {
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
      <AppButton label="Reset demo data" variant="danger" onPress={confirmReset} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  }
});
