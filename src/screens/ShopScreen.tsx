import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ProductCard } from "../components/ProductCard";
import { Section } from "../components/Section";
import { bundles, products } from "../data/catalog";
import { useCart } from "../state/CartContext";
import { colors } from "../theme";

export function ShopScreen() {
  const cart = useCart();
  const allProducts = [...products, ...bundles];

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.screen}>
      <Section
        eyebrow="Shop"
        title="Minimal essentials, chosen with intention."
        body="Skincare, wellness products, and bundles that support the full self-care ritual."
      />
      <View style={styles.cartBar}>
        <Text style={styles.cartText}>
          Cart: {cart.totalItems} item{cart.totalItems === 1 ? "" : "s"} / ${cart.subtotal}
        </Text>
      </View>
      <View style={styles.list}>
        {allProducts.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={cart.addItem} />
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
  cartBar: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "rgba(198, 169, 107, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(198, 169, 107, 0.36)"
  },
  cartText: {
    color: colors.cream,
    fontSize: 14,
    fontWeight: "700"
  },
  list: {
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 34
  }
});
