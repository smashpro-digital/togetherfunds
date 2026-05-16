import { StatusBar } from "expo-status-bar";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { FundsProvider } from "./src/state/FundsContext";

export default function App() {
  return (
    <FundsProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </FundsProvider>
  );
}
