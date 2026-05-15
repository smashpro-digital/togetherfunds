import type React from "react";
import { StyleSheet, View } from "react-native";
import { BodyText, Eyebrow, Headline } from "./BrandText";

type SectionProps = {
  eyebrow?: string;
  title: string;
  body?: string;
  children?: React.ReactNode;
};

export function Section({ eyebrow, title, body, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.copy}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <Headline style={styles.title}>{title}</Headline>
        {body ? <BodyText>{body}</BodyText> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 18,
    paddingHorizontal: 20,
    paddingVertical: 28
  },
  copy: {
    gap: 10
  },
  title: {
    fontSize: 28,
    lineHeight: 34
  }
});
