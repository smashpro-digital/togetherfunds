import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { FormField } from "../components/FormField";
import { Screen } from "../components/Screen";
import { RootStackParamList } from "../navigation/types";
import { useFunds } from "../state/FundsContext";
import { spacing } from "../theme";
import { parseMoney } from "../utils/format";

type Props = NativeStackScreenProps<RootStackParamList, "PiggyBankForm">;

export function PiggyBankFormScreen({ navigation, route }: Props) {
  const { addPiggyBank, deletePiggyBank, piggyBanks, updatePiggyBank } = useFunds();
  const piggyBankId = route.params?.piggyBankId;
  const existing = useMemo(() => piggyBanks.find((bank) => bank.id === piggyBankId), [piggyBankId, piggyBanks]);
  const [name, setName] = useState(existing?.name ?? "");
  const [targetAmount, setTargetAmount] = useState(existing ? String(existing.targetAmount) : "");
  const [savedAmount, setSavedAmount] = useState(existing ? String(existing.savedAmount) : "");
  const [dueDate, setDueDate] = useState(existing?.dueDate ?? "");
  const [partnerAContribution, setPartnerAContribution] = useState(
    existing ? String(existing.partnerAContribution) : ""
  );
  const [partnerBContribution, setPartnerBContribution] = useState(
    existing ? String(existing.partnerBContribution) : ""
  );

  function save() {
    if (!name.trim()) {
      Alert.alert("Name required", "Add a name for this piggy bank.");
      return;
    }

    const input = {
      name: name.trim(),
      targetAmount: parseMoney(targetAmount),
      savedAmount: parseMoney(savedAmount),
      dueDate: dueDate.trim() || "2026-12-31",
      partnerAContribution: parseMoney(partnerAContribution),
      partnerBContribution: parseMoney(partnerBContribution)
    };

    if (existing) {
      updatePiggyBank(existing.id, input);
    } else {
      addPiggyBank(input);
    }

    navigation.goBack();
  }

  function remove() {
    if (!existing) {
      return;
    }

    deletePiggyBank(existing.id);
    navigation.goBack();
  }

  return (
    <Screen
      title={existing ? "Edit Piggy Bank" : "Add Piggy Bank"}
      subtitle="Create a virtual cash envelope for a shared savings goal."
    >
      <View style={styles.form}>
        <FormField label="Goal name" value={name} onChangeText={setName} placeholder="Car Service" />
        <FormField label="Target amount" value={targetAmount} onChangeText={setTargetAmount} keyboardType="decimal-pad" />
        <FormField label="Saved amount" value={savedAmount} onChangeText={setSavedAmount} keyboardType="decimal-pad" />
        <FormField label="Due date" value={dueDate} onChangeText={setDueDate} placeholder="2026-06-20" />
        <FormField
          label="Partner A saved"
          value={partnerAContribution}
          onChangeText={setPartnerAContribution}
          keyboardType="decimal-pad"
        />
        <FormField
          label="Partner B saved"
          value={partnerBContribution}
          onChangeText={setPartnerBContribution}
          keyboardType="decimal-pad"
        />
      </View>
      <AppButton label={existing ? "Save changes" : "Create piggy bank"} onPress={save} />
      {existing ? <AppButton label="Delete piggy bank" variant="danger" onPress={remove} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md
  }
});
