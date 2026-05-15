import { ScrollView, StyleSheet, Text, View } from "react-native";
import { BodyText } from "../components/BrandText";
import { PrimaryButton } from "../components/PrimaryButton";
import { Section } from "../components/Section";
import { services } from "../data/catalog";
import { colors } from "../theme";

export function ServicesScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.screen}>
      <Section
        eyebrow="Services"
        title="Ionic foot detox, delivered as a restorative ritual."
        body="Support booking, memberships, and mobile service options with a calm high-touch experience."
      />
      <View style={styles.list}>
        {services.map((service) => (
          <View key={service.id} style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.name}>{service.name}</Text>
              <Text style={styles.price}>{service.price}</Text>
            </View>
            <BodyText style={styles.body}>{service.description}</BodyText>
            <Text style={styles.duration}>{service.duration}</Text>
            {service.includes.map((item) => (
              <Text key={item} style={styles.include}>
                {item}
              </Text>
            ))}
            <PrimaryButton label="Request booking" onPress={() => undefined} />
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
    padding: 18,
    borderRadius: 8,
    backgroundColor: colors.mist
  },
  header: {
    flexDirection: "row",
    gap: 14,
    justifyContent: "space-between"
  },
  name: {
    flex: 1,
    color: colors.forest,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600"
  },
  price: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: "800"
  },
  body: {
    color: "#586059"
  },
  duration: {
    color: colors.forest,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  include: {
    color: "#566057",
    fontSize: 14,
    lineHeight: 21
  }
});
