import { StyleSheet, Text, View } from "react-native";
import { Card } from "../components/Card";
import { MoneyRow } from "../components/MoneyRow";
import { ProgressBar } from "../components/ProgressBar";
import { Screen } from "../components/Screen";
import { useFunds } from "../state/FundsContext";
import { colors, spacing } from "../theme";
import { formatCurrency } from "../utils/format";

export function PartnerSummaryScreen() {
  const { expenses, piggyBanks } = useFunds();
  const partnerA =
    expenses.reduce((sum, expense) => sum + expense.partnerAContribution, 0) +
    piggyBanks.reduce((sum, bank) => sum + bank.partnerAContribution, 0);
  const partnerB =
    expenses.reduce((sum, expense) => sum + expense.partnerBContribution, 0) +
    piggyBanks.reduce((sum, bank) => sum + bank.partnerBContribution, 0);
  const total = partnerA + partnerB;

  return (
    <Screen
      title="Partner Summary"
      subtitle="See how each partner is contributing across bills and savings goals."
    >
      <Card>
        <Text selectable style={styles.title}>
          Shared contributions
        </Text>
        <ProgressBar progress={total ? partnerA / total : 0.5} />
        <MoneyRow label="Partner A" value={formatCurrency(partnerA)} />
        <MoneyRow label="Partner B" value={formatCurrency(partnerB)} />
        <MoneyRow label="Household total" value={formatCurrency(total)} />
      </Card>

      <View style={styles.grid}>
        <Card>
          <Text selectable style={styles.metric}>
            {total ? Math.round((partnerA / total) * 100) : 0}%
          </Text>
          <Text selectable style={styles.label}>
            Partner A share
          </Text>
        </Card>
        <Card>
          <Text selectable style={styles.metric}>
            {total ? Math.round((partnerB / total) * 100) : 0}%
          </Text>
          <Text selectable style={styles.label}>
            Partner B share
          </Text>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: spacing.md
  },
  label: {
    color: colors.muted,
    fontSize: 14
  },
  metric: {
    color: colors.ink,
    fontSize: 34,
    fontVariant: ["tabular-nums"],
    fontWeight: "900"
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  }
});
