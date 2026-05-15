import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "gold" | "outline";
};

export function PrimaryButton({ label, onPress, variant = "gold" }: PrimaryButtonProps) {
  const outline = variant === "outline";
  return (
    <Pressable onPress={onPress} style={[styles.button, outline && styles.outline]}>
      <Text style={[styles.label, outline && styles.outlineLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    backgroundColor: colors.gold
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.gold
  },
  label: {
    color: colors.forest,
    fontSize: 14,
    fontWeight: "700"
  },
  outlineLabel: {
    color: colors.gold
  }
});
