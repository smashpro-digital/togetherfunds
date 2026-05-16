import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme";
import { AppButton } from "./AppButton";

type EmptyStateProps = {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <Text selectable style={styles.title}>
        {title}
      </Text>
      <Text selectable style={styles.body}>
        {body}
      </Text>
      {actionLabel && onAction ? <AppButton label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center"
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center"
  },
  wrap: {
    alignItems: "center",
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.line,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl
  }
});
