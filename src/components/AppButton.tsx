import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radii, spacing } from "../theme";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
};

export function AppButton({ label, onPress, variant = "primary" }: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.secondary,
        variant === "danger" && styles.danger,
        pressed && styles.pressed
      ]}
    >
      <Text style={[styles.label, variant === "secondary" && styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13
  },
  danger: {
    backgroundColor: colors.danger
  },
  label: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800"
  },
  pressed: {
    opacity: 0.78
  },
  secondary: {
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.line,
    borderWidth: 1
  },
  secondaryLabel: {
    color: colors.ink
  }
});
