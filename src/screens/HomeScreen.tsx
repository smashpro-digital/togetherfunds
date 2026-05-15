import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { BodyText, Eyebrow, Headline } from "../components/BrandText";
import { PrimaryButton } from "../components/PrimaryButton";
import { Section } from "../components/Section";
import { bundles, products } from "../data/catalog";
import { colors } from "../theme";
import type { RootTabParamList } from "../navigation/AppNavigator";

type HomeScreenProps = BottomTabScreenProps<RootTabParamList, "Home">;

export function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.screen}>
      <View style={styles.hero}>
        <Eyebrow>Deeper Than Skin</Eyebrow>
        <Headline>Luxury begins within.</Headline>
        <BodyText>
          Return to balance through botanical skincare, restorative detox services, and rituals built for slower living.
        </BodyText>
        <View style={styles.actions}>
          <PrimaryButton label="Explore rituals" onPress={() => navigation.navigate("Rituals")} />
          <PrimaryButton label="Book detox" variant="outline" onPress={() => navigation.navigate("Services")} />
        </View>
      </View>

      <Section
        eyebrow="Discover by ritual"
        title="Choose the way you want to restore."
        body="Browse by intention instead of category: morning renewal, body balance, evening recovery, and full reset."
      >
        <View style={styles.ritualGrid}>
          {["Morning Renewal", "Body Balance", "Evening Recovery", "Full Reset"].map((ritual) => (
            <View key={ritual} style={styles.ritualTile}>
              <Text style={styles.ritualText}>{ritual}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section eyebrow="Best sellers" title="Botanical essentials for daily care.">
        {products.slice(0, 2).map((product) => (
          <View key={product.id} style={styles.previewRow}>
            <Text style={styles.previewName}>{product.name}</Text>
            <Text style={styles.previewPrice}>${product.price}</Text>
          </View>
        ))}
      </Section>

      <Section eyebrow="Signature bundles" title="Rooted in ritual, ready as a set.">
        {bundles.map((bundle) => (
          <View key={bundle.id} style={styles.bundle}>
            <Text style={styles.bundleName}>{bundle.name}</Text>
            <BodyText style={styles.bundleBody}>{bundle.description}</BodyText>
          </View>
        ))}
      </Section>

      <Section
        eyebrow="Philosophy"
        title="High-touch care without the noise."
        body="Every offer is designed to feel calm, intentional, and complete: less clutter, more restoration."
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.forest
  },
  hero: {
    minHeight: 470,
    gap: 16,
    justifyContent: "flex-end",
    paddingHorizontal: 22,
    paddingBottom: 42,
    backgroundColor: colors.forestSoft
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    paddingTop: 8
  },
  ritualGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  ritualTile: {
    width: "48%",
    minHeight: 86,
    justifyContent: "flex-end",
    padding: 14,
    borderRadius: 8,
    backgroundColor: "rgba(245, 241, 232, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(198, 169, 107, 0.26)"
  },
  ritualText: {
    color: colors.cream,
    fontSize: 16,
    fontWeight: "600"
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(245, 241, 232, 0.14)"
  },
  previewName: {
    flex: 1,
    color: colors.cream,
    fontSize: 18
  },
  previewPrice: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: "700"
  },
  bundle: {
    gap: 8,
    padding: 18,
    borderRadius: 8,
    backgroundColor: colors.mist
  },
  bundleName: {
    color: colors.forest,
    fontSize: 20,
    fontWeight: "600"
  },
  bundleBody: {
    color: "#586059"
  }
});
