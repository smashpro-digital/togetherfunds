import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { FormField } from "../components/FormField";
import { ProgressBar } from "../components/ProgressBar";
import { Screen } from "../components/Screen";
import { RootStackParamList } from "../navigation/types";
import { useFunds } from "../state/FundsContext";
import { colors, radii, spacing } from "../theme";
import { Partner } from "../types/funds";
import { formatCurrency, parseMoney } from "../utils/format";

type Props = NativeStackScreenProps<RootStackParamList, "Contribution">;

export function ContributionScreen({ navigation, route }: Props) {
  const { addContribution, piggyBanks } = useFunds();
  const selectedBank = useMemo(
    () => piggyBanks.find((bank) => bank.id === route.params?.piggyBankId) ?? piggyBanks[0],
    [piggyBanks, route.params?.piggyBankId]
  );
  const [partner, setPartner] = useState<Partner>("partnerA");
  const [amount, setAmount] = useState("");

  function save() {
    if (!selectedBank) {
      Alert.alert("No piggy bank", "Create a piggy bank before adding a contribution.");
      return;
    }

    const parsed = parseMoney(amount);
    if (parsed <= 0) {
      Alert.alert("Amount required", "Enter a contribution amount.");
      return;
    }

    addContribution(selectedBank.id, partner, parsed);
    navigation.goBack();
  }

  if (!selectedBank) {
    return (
      <Screen title="Add Contribution" subtitle="Create a piggy bank first.">
        <AppButton label="Back" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  return (
    <Screen title="Add Contribution" subtitle={`Add money to ${selectedBank.name}.`}>
      <Card>
        <Text selectable style={styles.bankName}>
          {selectedBank.name}
        </Text>
        <ProgressBar progress={selectedBank.targetAmount ? selectedBank.savedAmount / selectedBank.targetAmount : 0} />
        <Text selectable style={styles.meta}>
          {formatCurrency(selectedBank.savedAmount)} saved of {formatCurrency(selectedBank.targetAmount)}
        </Text>
      </Card>

      <View style={styles.segment}>
        <PartnerOption label="Partner A" selected={partner === "partnerA"} onPress={() => setPartner("partnerA")} />
        <PartnerOption label="Partner B" selected={partner === "partnerB"} onPress={() => setPartner("partnerB")} />
      </View>

      <FormField label="Contribution amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
      <AppButton label="Save contribution" onPress={save} />
    </Screen>
  );
}

function PartnerOption({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.option, selected && styles.optionActive]}>
      <Text style={[styles.optionText, selected && styles.optionTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bankName: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "900"
  },
  meta: {
    color: colors.muted,
    fontSize: 15
  },
  option: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md
  },
  optionActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal
  },
  optionText: {
    color: colors.ink,
    fontWeight: "900"
  },
  optionTextActive: {
    color: "#FFFFFF"
  },
  segment: {
    flexDirection: "row",
    gap: spacing.sm
  }
});
