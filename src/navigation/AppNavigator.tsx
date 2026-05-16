import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../theme";
import { BankSyncScreen } from "../screens/BankSyncScreen";
import { ContributionScreen } from "../screens/ContributionScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { ExpenseFormScreen } from "../screens/ExpenseFormScreen";
import { ExpensesScreen } from "../screens/ExpensesScreen";
import { PartnerSummaryScreen } from "../screens/PartnerSummaryScreen";
import { PiggyBankFormScreen } from "../screens/PiggyBankFormScreen";
import { PiggyBanksScreen } from "../screens/PiggyBanksScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { RootStackParamList, TabParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    primary: colors.primary,
    text: colors.ink
  }
};

function TabNavigator() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.ink, fontWeight: "900" },
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line
        }
      }}
    >
      <Tabs.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Home" }} />
      <Tabs.Screen name="Expenses" component={ExpensesScreen} />
      <Tabs.Screen name="PiggyBanks" component={PiggyBanksScreen} options={{ title: "Piggy Banks" }} />
      <Tabs.Screen name="PartnerSummary" component={PartnerSummaryScreen} options={{ title: "Partners" }} />
      <Tabs.Screen name="Settings" component={SettingsScreen} />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.ink, fontWeight: "900" },
          headerTintColor: colors.primaryDark
        }}
      >
        <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="BankSync" component={BankSyncScreen} options={{ title: "Bank Sync" }} />
        <Stack.Screen name="ExpenseForm" component={ExpenseFormScreen} options={{ title: "Expense" }} />
        <Stack.Screen name="PiggyBankForm" component={PiggyBankFormScreen} options={{ title: "Piggy Bank" }} />
        <Stack.Screen name="Contribution" component={ContributionScreen} options={{ title: "Add Contribution" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
