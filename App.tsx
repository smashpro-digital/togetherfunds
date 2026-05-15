import { StatusBar } from "expo-status-bar";
import { CartProvider } from "./src/state/CartContext";
import { AppNavigator } from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <CartProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </CartProvider>
  );
}
