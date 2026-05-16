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
import { formatCurrency, formatDate } from "../utils/format";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "PiggyBanks">,
  NativeStackScreenProps<RootStackParamList>
>;

export function PiggyBanksScreen({ navigation }: Props) {
  const { piggyBanks } = useFunds();

  return (
    <Screen
      title="Piggy Banks"
      subtitle="Use virtual cash envelopes for car repairs, trips, gifts, emergency savings, and short-term goals."
    >
      <AppButton label="Add piggy bank" onPress={() => navigation.navigate("PiggyBankForm")} />

      {piggyBanks.length === 0 ? (
        <EmptyState
          title="No piggy banks yet"
          body="Create a goal and add partner contributions as money is set aside."
          actionLabel="Create piggy bank"
          onAction={() => navigation.navigate("PiggyBankForm")}
        />
      ) : (
        piggyBanks.map((bank) => {
          const remaining = Math.max(0, bank.targetAmount - bank.savedAmount);

          return (
            <Card key={bank.id}>
              <View style={styles.header}>
                <View style={styles.titleWrap}>
                  <Text selectable style={styles.title}>
                    {bank.name}
                  </Text>
                  <Text selectable style={styles.meta}>
                    Goal date {formatDate(bank.dueDate)}
                  </Text>
                </View>
                <Text selectable style={styles.amount}>
                  {formatCurrency(bank.savedAmount)}
                </Text>
              </View>
              <ProgressBar progress={bank.targetAmount ? bank.savedAmount / bank.targetAmount : 0} />
              <MoneyRow label="Target" value={formatCurrency(bank.targetAmount)} />
              <MoneyRow label="Remaining" value={formatCurrency(remaining)} />
              <MoneyRow label="Partner A saved" value={formatCurrency(bank.partnerAContribution)} />
              <MoneyRow label="Partner B saved" value={formatCurrency(bank.partnerBContribution)} />
              <View style={styles.actions}>
                <AppButton
                  label="Add contribution"
                  onPress={() => navigation.navigate("Contribution", { piggyBankId: bank.id })}
                />
                <AppButton
                  label="Edit"
                  variant="secondary"
                  onPress={() => navigation.navigate("PiggyBankForm", { piggyBankId: bank.id })}
                />
              </View>
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm
  },
  amount: {
    color: colors.teal,
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
