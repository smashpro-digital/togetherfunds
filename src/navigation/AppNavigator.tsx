import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet } from "react-native";
import { colors } from "../theme";
import { HomeScreen } from "../screens/HomeScreen";
import { RitualsScreen } from "../screens/RitualsScreen";
import { ShopScreen } from "../screens/ShopScreen";
import { ServicesScreen } from "../screens/ServicesScreen";
import { MembershipScreen } from "../screens/MembershipScreen";
import { useCart } from "../state/CartContext";

export type RootTabParamList = {
  Home: undefined;
  Rituals: undefined;
  Shop: undefined;
  Services: undefined;
  Membership: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export function AppNavigator() {
  const { totalItems } = useCart();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.forest,
          tabBarInactiveTintColor: colors.stone,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tab,
          tabBarLabelStyle: styles.tabText
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Rituals" component={RitualsScreen} />
        <Tab.Screen
          name="Shop"
          component={ShopScreen}
          options={{ tabBarLabel: totalItems > 0 ? `Shop (${totalItems})` : "Shop" }}
        />
        <Tab.Screen name="Services" component={ServicesScreen} />
        <Tab.Screen name="Membership" component={MembershipScreen} options={{ tabBarLabel: "Member" }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.forest,
    borderTopWidth: 1,
    borderTopColor: "rgba(245, 241, 232, 0.12)",
    minHeight: 72,
    paddingTop: 8,
    paddingBottom: 12
  },
  tab: {
    borderRadius: 8,
    marginHorizontal: 2
  },
  tabText: {
    fontSize: 11,
    fontWeight: "600"
  }
});
