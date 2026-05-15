import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { BodyText } from "../components/BrandText";
import { PrimaryButton } from "../components/PrimaryButton";
import { Section } from "../components/Section";
import { colors } from "../theme";
import type { RootTabParamList } from "../navigation/AppNavigator";

type RitualsScreenProps = BottomTabScreenProps<RootTabParamList, "Rituals">;

const rituals = [
  {
    title: "Return to Balance",
    body: "For clients seeking detox, hydration, and a reset after a demanding week.",
    action: "Book detox",
    tab: "Services" as const
  },
  {
    title: "Rooted in Ritual",
    body: "For daily skincare and body care that feels quiet, elevated, and repeatable.",
    action: "Shop essentials",
    tab: "Shop" as const
  },
  {
    title: "Restore From Within",
    body: "For a recurring plan with consistent appointments, savings, and priority access.",
    action: "View plans",
    tab: "Membership" as const
  }
];

export function RitualsScreen({ navigation }: RitualsScreenProps) {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.screen}>
      <Section
        eyebrow="Ritual discovery"
        title="Start with the intention, then choose the care."
        body="This is not a crowded product shelf. Each path is designed around how the client wants to feel."
      />
      <View style={styles.list}>
        {rituals.map((ritual) => (
          <View key={ritual.title} style={styles.card}>
            <Text style={styles.title}>{ritual.title}</Text>
            <BodyText style={styles.body}>{ritual.body}</BodyText>
            <PrimaryButton label={ritual.action} onPress={() => navigation.navigate(ritual.tab)} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.forest
  },
  list: {
    gap: 14,
    paddingHorizontal: 20,
    paddingBottom: 34
  },
  card: {
    gap: 14,
    padding: 18,
    borderRadius: 8,
    backgroundColor: colors.mist
  },
  title: {
    color: colors.forest,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "500"
  },
  body: {
    color: "#586059"
  }
});
