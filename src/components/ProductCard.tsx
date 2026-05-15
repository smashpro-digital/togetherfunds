import { StyleSheet, Text, View } from "react-native";
import type { Product } from "../data/catalog";
import { colors, shadow } from "../theme";
import { BodyText, Eyebrow } from "./BrandText";
import { PrimaryButton } from "./PrimaryButton";

type ProductCardProps = {
  product: Product;
  onAdd: (product: Product) => void;
};

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <View style={styles.card}>
      <Eyebrow>{product.ritual}</Eyebrow>
      <Text style={styles.name}>{product.name}</Text>
      <BodyText style={styles.description}>{product.description}</BodyText>
      <View style={styles.metaRow}>
        <Text style={styles.price}>${product.price}</Text>
        <Text style={styles.ingredients}>{product.ingredients.join(" / ")}</Text>
      </View>
      <PrimaryButton label="Add to ritual" onPress={() => onAdd(product)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 18,
    borderRadius: 8,
    backgroundColor: colors.white,
    ...shadow
  },
  name: {
    color: colors.ink,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "500"
  },
  description: {
    color: "#5B6259"
  },
  metaRow: {
    gap: 6,
    paddingTop: 4
  },
  price: {
    color: colors.forest,
    fontSize: 18,
    fontWeight: "700"
  },
  ingredients: {
    color: "#6E7469",
    fontSize: 12,
    lineHeight: 18,
    textTransform: "uppercase"
  }
});
