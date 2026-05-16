import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { RootStackParamList } from "../navigation/types";
import { Text } from "react-native";
import { colors } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <Screen
      eyebrow="TogetherFunds account"
      title="Welcome to TogetherFunds"
      subtitle="Use one account to keep your TogetherFunds workspace and preferences connected."
    >
      <Card>
        <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 22 }}>
          Sign in to sync your couple workspace, preferences, and app settings. Local demo mode still works
          without live server data.
        </Text>
        <AppButton label="Log in" onPress={() => navigation.navigate("Login")} />
        <AppButton label="Create account" variant="secondary" onPress={() => navigation.navigate("Register")} />
      </Card>
    </Screen>
  );
}
