import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../theme";
import { BankSyncScreen } from "../screens/BankSyncScreen";
import { AppCustomizationScreen } from "../screens/AppCustomizationScreen";
import { ContributionScreen } from "../screens/ContributionScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { ExpenseFormScreen } from "../screens/ExpenseFormScreen";
import { ExpensesScreen } from "../screens/ExpensesScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { PartnerSummaryScreen } from "../screens/PartnerSummaryScreen";
import { PiggyBankFormScreen } from "../screens/PiggyBankFormScreen";
import { PiggyBanksScreen } from "../screens/PiggyBanksScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { RootStackParamList, TabParamList } from "./types";
import { Text } from "react-native";
import { useAuthStore } from "../store/authStore";

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
        headerStyle: { backgroundColor: colors.backgroundDeep },
        headerTitleStyle: { color: colors.ink, fontWeight: "900" },
        headerTintColor: colors.primaryDark,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.backgroundDeep,
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
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <Screen title="TogetherFunds" subtitle="Checking your account session.">
        <Card>
          <Text style={{ color: colors.muted }}>Loading account...</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.backgroundDeep },
          headerTitleStyle: { color: colors.ink, fontWeight: "900" },
          headerTintColor: colors.primaryDark
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="BankSync" component={BankSyncScreen} options={{ title: "Bank Sync" }} />
            <Stack.Screen name="ExpenseForm" component={ExpenseFormScreen} options={{ title: "Expense" }} />
            <Stack.Screen name="PiggyBankForm" component={PiggyBankFormScreen} options={{ title: "Piggy Bank" }} />
            <Stack.Screen name="Contribution" component={ContributionScreen} options={{ title: "Add Contribution" }} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="AppCustomization" component={AppCustomizationScreen} options={{ title: "Customization" }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: "Forgot Password" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
