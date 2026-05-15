import { StyleSheet, Text, TextProps } from "react-native";
import { colors } from "../theme";

export function Eyebrow({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.eyebrow, style]} />;
}

export function Headline({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.headline, style]} />;
}

export function BodyText({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.body, style]} />;
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  headline: {
    color: colors.cream,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "500"
  },
  body: {
    color: colors.stone,
    fontSize: 15,
    lineHeight: 23
  }
});
