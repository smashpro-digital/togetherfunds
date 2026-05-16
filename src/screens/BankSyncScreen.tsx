import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { MoneyRow } from "../components/MoneyRow";
import { Screen } from "../components/Screen";
import { RootStackParamList } from "../navigation/types";
import {
  assignBankTransaction,
  connectSandboxBankAccounts,
  disconnectBankAccount,
  refreshConnectedBankData,
  useBankStore
} from "../store/bankStore";
import { useFunds } from "../state/FundsContext";
import { colors, radii, spacing } from "../theme";
import { BankTransaction, TransactionAssignmentType } from "../types/bank";

type Props = NativeStackScreenProps<RootStackParamList, "BankSync">;

const contributionTargetId = "partnerA";

export function BankSyncScreen({ navigation }: Props) {
  const { accounts, transactions, isHydrated, isSyncing, lastError } = useBankStore();
  const { expenses, piggyBanks } = useFunds();

  function confirmDisconnect(accountId: string) {
    Alert.alert("Disconnect account?", "This removes the sandbox account metadata and its mock transactions from this device.", [
      { text: "Cancel", style: "cancel" },
      { text: "Disconnect", style: "destructive", onPress: () => disconnectBankAccount(accountId) }
    ]);
  }

  function assignTransaction(transaction: BankTransaction, type: TransactionAssignmentType) {
    if (type === "piggyBank") {
      const target = piggyBanks[0];
      if (!target) {
        Alert.alert("No piggy bank", "Create a piggy bank before assigning this transaction.");
        return;
      }
      assignBankTransaction(transaction.id, "piggyBank", target.id);
      return;
    }

    if (type === "monthlyExpense") {
      const target = expenses[0];
      if (!target) {
        Alert.alert("No expense", "Create a monthly expense before assigning this transaction.");
        return;
      }
      assignBankTransaction(transaction.id, "monthlyExpense", target.id);
      return;
    }

    assignBankTransaction(transaction.id, "partnerContribution", contributionTargetId);
  }

  return (
    <Screen
      title="Bank Sync"
      subtitle="Sandbox bank syncing for TogetherFunds. Plaid Link and token exchange must move to a secure backend before production."
    >
      <Card>
        <Text selectable style={styles.title}>
          Plaid Sandbox
        </Text>
        <Text selectable style={styles.body}>
          This MVP stores only sandbox account metadata and mock transactions locally. It never asks for bank credentials
          and does not store Plaid tokens on device.
        </Text>
        <View style={styles.actions}>
          <AppButton
            label={accounts.length ? "Reconnect Sandbox Bank" : "Connect Sandbox Bank"}
            onPress={connectSandboxBankAccounts}
          />
          <AppButton label={isSyncing ? "Refreshing..." : "Refresh balances"} variant="secondary" onPress={refreshConnectedBankData} />
        </View>
        {lastError ? (
          <Text selectable style={styles.error}>
            {lastError}
          </Text>
        ) : null}
      </Card>

      <View style={styles.sectionHeader}>
        <Text selectable style={styles.sectionTitle}>
          Connected accounts
        </Text>
      </View>

      {!isHydrated ? (
        <Card>
          <Text selectable style={styles.body}>
            Loading sandbox bank state...
          </Text>
        </Card>
      ) : accounts.length === 0 ? (
        <EmptyState
          title="No bank connected"
          body="Connect the Plaid Sandbox mock bank to preview linked accounts and imported transactions."
          actionLabel="Connect Sandbox Bank"
          onAction={connectSandboxBankAccounts}
        />
      ) : (
        accounts.map((account) => (
          <Card key={account.id}>
            <View style={styles.accountHeader}>
              <View style={styles.flex}>
                <Text selectable style={styles.accountName}>
                  {account.institutionName} {account.accountName}
                </Text>
                <Text selectable style={styles.meta}>
                  {account.accountType} ending {account.last4}
                </Text>
              </View>
              <Text selectable style={styles.balance}>
                {formatCurrencyWithCents(account.currentBalance)}
              </Text>
            </View>
            <MoneyRow label="Available" value={formatCurrencyWithCents(account.availableBalance)} />
            <MoneyRow label="Last synced" value={formatDateTime(account.lastSyncedAt)} />
            <AppButton label="Disconnect" variant="danger" onPress={() => confirmDisconnect(account.id)} />
          </Card>
        ))
      )}

      <View style={styles.sectionHeader}>
        <Text selectable style={styles.sectionTitle}>
          Recent bank transactions
        </Text>
      </View>

      {transactions.length === 0 ? (
        <EmptyState
          title="No imported transactions"
          body="Connect or refresh the sandbox bank to import recent mock transactions."
          actionLabel="Refresh balances"
          onAction={refreshConnectedBankData}
        />
      ) : (
        transactions.map((transaction) => (
          <Card key={transaction.id}>
            <View style={styles.accountHeader}>
              <View style={styles.flex}>
                <Text selectable style={styles.accountName}>
                  {transaction.merchant}
                </Text>
                <Text selectable style={styles.meta}>
                  {transaction.category} / {formatDate(transaction.date)}
                </Text>
              </View>
              <Text selectable style={[styles.balance, transaction.amount > 0 && styles.credit]}>
                {formatCurrencyWithCents(transaction.amount)}
              </Text>
            </View>
            <Text selectable style={styles.assignment}>
              {describeAssignment(transaction, expenses, piggyBanks)}
            </Text>
            <View style={styles.transactionActions}>
              <AssignmentButton label="Assign to Piggy Bank" onPress={() => assignTransaction(transaction, "piggyBank")} />
              <AssignmentButton label="Assign to Expense" onPress={() => assignTransaction(transaction, "monthlyExpense")} />
              <AssignmentButton label="Mark as Contribution" onPress={() => assignTransaction(transaction, "partnerContribution")} />
            </View>
          </Card>
        ))
      )}

      <AppButton label="Back to Settings" variant="secondary" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

function AssignmentButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.assignmentButton, pressed && styles.pressed]}>
      <Text style={styles.assignmentButtonText}>{label}</Text>
    </Pressable>
  );
}

function describeAssignment(
  transaction: BankTransaction,
  expenses: { id: string; name: string }[],
  piggyBanks: { id: string; name: string }[]
) {
  if (transaction.assignedToType === "piggyBank") {
    const target = piggyBanks.find((bank) => bank.id === transaction.assignedToId);
    return `Assigned to piggy bank${target ? `: ${target.name}` : ""}`;
  }

  if (transaction.assignedToType === "monthlyExpense") {
    const target = expenses.find((expense) => expense.id === transaction.assignedToId);
    return `Assigned to expense${target ? `: ${target.name}` : ""}`;
  }

  if (transaction.assignedToType === "partnerContribution") {
    return "Marked as partner contribution";
  }

  return "Unassigned";
}

function formatCurrencyWithCents(value?: number) {
  if (typeof value !== "number") {
    return "Not provided";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not synced";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

const styles = StyleSheet.create({
  accountHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  accountName: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: "900"
  },
  actions: {
    gap: spacing.sm
  },
  assignment: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "800"
  },
  assignmentButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm
  },
  assignmentButtonText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800"
  },
  balance: {
    color: colors.primaryDark,
    fontSize: 18,
    fontVariant: ["tabular-nums"],
    fontWeight: "900"
  },
  body: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  },
  credit: {
    color: colors.sage
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "800"
  },
  flex: {
    flex: 1,
    gap: spacing.xs
  },
  meta: {
    color: colors.muted,
    fontSize: 14,
    textTransform: "capitalize"
  },
  pressed: {
    opacity: 0.78
  },
  sectionHeader: {
    marginBottom: -spacing.sm
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "900"
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  transactionActions: {
    gap: spacing.sm
  }
});
