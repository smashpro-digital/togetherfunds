import { ScrollView, StyleSheet, Text, View } from "react-native";
import { BodyText } from "../components/BrandText";
import { PrimaryButton } from "../components/PrimaryButton";
import { Section } from "../components/Section";
import { memberships } from "../data/catalog";
import { colors } from "../theme";

export function MembershipScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.screen}>
      <Section
        eyebrow="Membership"
        title="Recurring care for clients who want consistency."
        body="Plans support priority booking, recurring billing, member savings, and access to early product releases."
      />
      <View style={styles.list}>
        {memberships.map((plan) => (
          <View key={plan.id} style={styles.card}>
            <Text style={styles.name}>{plan.name}</Text>
            <Text style={styles.price}>{plan.price}</Text>
            <Text style={styles.cadence}>{plan.cadence}</Text>
            <BodyText style={styles.body}>{plan.description}</BodyText>
            {plan.perks.map((perk) => (
              <Text key={perk} style={styles.perk}>
                {perk}
              </Text>
            ))}
            <PrimaryButton label="Choose plan" onPress={() => undefined} />
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
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 34
  },
  card: {
    gap: 12,
    padding: 20,
    borderRadius: 8,
    backgroundColor: colors.mist
  },
  name: {
    color: colors.forest,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "600"
  },
  price: {
    color: colors.gold,
    fontSize: 28,
    fontWeight: "800"
  },
  cadence: {
    color: colors.forest,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  body: {
    color: "#586059"
  },
  perk: {
    color: "#566057",
    fontSize: 14,
    lineHeight: 21
  }
});
