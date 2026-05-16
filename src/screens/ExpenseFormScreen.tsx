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

type Props = NativeStackScreenProps<RootStackParamList, "ExpenseForm">;

export function ExpenseFormScreen({ navigation, route }: Props) {
  const { addExpense, deleteExpense, expenses, updateExpense } = useFunds();
  const expenseId = route.params?.expenseId;
  const existing = useMemo(() => expenses.find((expense) => expense.id === expenseId), [expenseId, expenses]);
  const [name, setName] = useState(existing?.name ?? "");
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "");
  const [dueDay, setDueDay] = useState(existing ? String(existing.dueDay) : "");
  const [category, setCategory] = useState(existing?.category ?? "");
  const [partnerAContribution, setPartnerAContribution] = useState(
    existing ? String(existing.partnerAContribution) : ""
  );
  const [partnerBContribution, setPartnerBContribution] = useState(
    existing ? String(existing.partnerBContribution) : ""
  );

  function save() {
    if (!name.trim()) {
      Alert.alert("Name required", "Add a name for this expense.");
      return;
    }

    const input = {
      name: name.trim(),
      amount: parseMoney(amount),
      dueDay: Math.min(31, Math.max(1, Number(dueDay) || 1)),
      category: category.trim() || "Shared",
      partnerAContribution: parseMoney(partnerAContribution),
      partnerBContribution: parseMoney(partnerBContribution)
    };

    if (existing) {
      updateExpense(existing.id, input);
    } else {
      addExpense(input);
    }

    navigation.goBack();
  }

  function remove() {
    if (!existing) {
      return;
    }

    deleteExpense(existing.id);
    navigation.goBack();
  }

  return (
    <Screen
      title={existing ? "Edit Expense" : "Add Expense"}
      subtitle="Add a recurring bill and track how much each partner has already set aside."
    >
      <View style={styles.form}>
        <FormField label="Expense name" value={name} onChangeText={setName} placeholder="Rent" />
        <FormField label="Monthly amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
        <FormField label="Due day" value={dueDay} onChangeText={setDueDay} keyboardType="number-pad" />
        <FormField label="Category" value={category} onChangeText={setCategory} placeholder="Housing" />
        <FormField
          label="Partner A contribution"
          value={partnerAContribution}
          onChangeText={setPartnerAContribution}
          keyboardType="decimal-pad"
        />
        <FormField
          label="Partner B contribution"
          value={partnerBContribution}
          onChangeText={setPartnerBContribution}
          keyboardType="decimal-pad"
        />
      </View>
      <AppButton label={existing ? "Save changes" : "Create expense"} onPress={save} />
      {existing ? <AppButton label="Delete expense" variant="danger" onPress={remove} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md
  }
});
