import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { MoneyRow } from "../components/MoneyRow";
import { ProgressBar } from "../components/ProgressBar";
import { Screen } from "../components/Screen";
import { RootStackParamList, TabParamList } from "../navigation/types";
import { useFunds } from "../state/FundsContext";
import { colors, spacing } from "../theme";
import { formatCurrency } from "../utils/format";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Expenses">,
  NativeStackScreenProps<RootStackParamList>
>;

export function ExpensesScreen({ navigation }: Props) {
  const { expenses } = useFunds();

  return (
    <Screen
      title="Monthly Expenses"
      subtitle="Keep the big recurring bills visible so both partners know what is due and what is already funded."
    >
      <AppButton label="Add monthly expense" onPress={() => navigation.navigate("ExpenseForm")} />

      {expenses.length === 0 ? (
        <EmptyState
          title="No expenses yet"
          body="Add rent, utilities, groceries, insurance, or any shared monthly bill."
          actionLabel="Create expense"
          onAction={() => navigation.navigate("ExpenseForm")}
        />
      ) : (
        expenses.map((expense) => {
          const contributed = expense.partnerAContribution + expense.partnerBContribution;
          const remaining = Math.max(0, expense.amount - contributed);

          return (
            <Card key={expense.id}>
              <View style={styles.header}>
                <View style={styles.titleWrap}>
                  <Text selectable style={styles.title}>
                    {expense.name}
                  </Text>
                  <Text selectable style={styles.meta}>
                    {expense.category} / due on the {expense.dueDay}
                  </Text>
                </View>
                <Text selectable style={styles.amount}>
                  {formatCurrency(expense.amount)}
                </Text>
              </View>
              <ProgressBar progress={expense.amount ? contributed / expense.amount : 0} />
              <MoneyRow label="Partner A" value={formatCurrency(expense.partnerAContribution)} />
              <MoneyRow label="Partner B" value={formatCurrency(expense.partnerBContribution)} />
              <MoneyRow label="Remaining" value={formatCurrency(remaining)} />
              <AppButton
                label="Edit expense"
                variant="secondary"
                onPress={() => navigation.navigate("ExpenseForm", { expenseId: expense.id })}
              />
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  amount: {
    color: colors.ink,
    fontSize: 18,
    fontVariant: ["tabular-nums"],
    fontWeight: "900"
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  meta: {
    color: colors.muted,
    fontSize: 14
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  titleWrap: {
    flex: 1,
    gap: spacing.xs
  }
});
