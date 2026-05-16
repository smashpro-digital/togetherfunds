import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { MoneyRow } from "../components/MoneyRow";
import { ProgressBar } from "../components/ProgressBar";
import { Screen } from "../components/Screen";
import { RootStackParamList } from "../navigation/types";
import { colors, spacing } from "../theme";
import { useFunds } from "../state/FundsContext";
import { formatCurrency } from "../utils/format";

export function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { expenses, piggyBanks, isHydrated } = useFunds();
  const monthlyTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyFunded = expenses.reduce(
    (sum, expense) => sum + expense.partnerAContribution + expense.partnerBContribution,
    0
  );
  const savedTotal = piggyBanks.reduce((sum, bank) => sum + bank.savedAmount, 0);
  const targetTotal = piggyBanks.reduce((sum, bank) => sum + bank.targetAmount, 0);
  const remaining = Math.max(0, monthlyTotal - monthlyFunded);

  if (!isHydrated) {
    return (
      <Screen title="Loading TogetherFunds" subtitle="Getting your shared plan ready.">
        <Card>
          <Text selectable style={styles.loading}>
            Loading saved household numbers...
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen
      eyebrow="TogetherFunds"
      title="Plan the month together."
      subtitle="Track shared bills, savings goals, and cash-envelope piggy banks without losing who contributed what."
    >
      <Card>
        <View style={styles.heroRow}>
          <View>
            <Text selectable style={styles.label}>
              Monthly remaining
            </Text>
            <Text selectable style={styles.total}>
              {formatCurrency(remaining)}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text selectable style={styles.badgeText}>
              {expenses.length} bills
            </Text>
          </View>
        </View>
        <ProgressBar progress={monthlyTotal ? monthlyFunded / monthlyTotal : 0} />
        <MoneyRow label="Planned bills" value={formatCurrency(monthlyTotal)} />
        <MoneyRow label="Already contributed" value={formatCurrency(monthlyFunded)} />
      </Card>

      <View style={styles.grid}>
        <Card>
          <Text selectable style={styles.cardTitle}>
            Piggy banks
          </Text>
          <Text selectable style={styles.metric}>
            {formatCurrency(savedTotal)}
          </Text>
          <Text selectable style={styles.muted}>
            saved toward {formatCurrency(targetTotal)}
          </Text>
        </Card>
        <Card>
          <Text selectable style={styles.cardTitle}>
            Partners
          </Text>
          <Text selectable style={styles.metric}>
            50/50
          </Text>
          <Text selectable style={styles.muted}>
            flexible contribution tracking
          </Text>
        </Card>
      </View>

      <View style={styles.actions}>
        <AppButton label="Add expense" onPress={() => navigation.navigate("ExpenseForm")} />
        <AppButton label="Add piggy bank" variant="secondary" onPress={() => navigation.navigate("PiggyBankForm")} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm
  },
  badge: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  badgeText: {
    color: colors.primaryDark,
    fontWeight: "900"
  },
  cardTitle: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "800"
  },
  grid: {
    gap: spacing.md
  },
  heroRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  label: {
    color: colors.muted,
    fontSize: 14
  },
  loading: {
    color: colors.muted,
    fontSize: 16
  },
  metric: {
    color: colors.ink,
    fontSize: 28,
    fontVariant: ["tabular-nums"],
    fontWeight: "900"
  },
  muted: {
    color: colors.muted,
    fontSize: 14
  },
  total: {
    color: colors.ink,
    fontSize: 42,
    fontVariant: ["tabular-nums"],
    fontWeight: "900"
  }
});
