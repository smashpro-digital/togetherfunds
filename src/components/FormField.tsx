import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radii, spacing } from "../theme";

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
};

export function FormField({ label, value, onChangeText, placeholder, keyboardType = "default" }: FormFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text selectable style={styles.label}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: 13
  },
  label: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800"
  },
  wrap: {
    gap: spacing.xs
  }
});
