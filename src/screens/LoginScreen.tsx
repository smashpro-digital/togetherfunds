import { useState } from "react";
import { Alert, Text } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { FormField } from "../components/FormField";
import { Screen } from "../components/Screen";
import { RootStackParamList } from "../navigation/types";
import { getAuthSnapshot, useAuthStore } from "../store/authStore";
import { colors } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { login, error, isLoading } = useAuthStore();
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    const ok = await login(loginValue.trim(), password);
    if (!ok) {
      Alert.alert("Login failed", getAuthSnapshot().error ?? error ?? "Check your username/email and password.");
    }
  }

  return (
    <Screen title="Log in" subtitle="Access your TogetherFunds account.">
      <Card>
        <FormField label="Email or username" value={loginValue} onChangeText={setLoginValue} autoCapitalize="none" />
        <FormField label="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
        {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
        <AppButton label={isLoading ? "Signing in..." : "Log in"} onPress={submit} />
        <AppButton label="Forgot password" variant="secondary" onPress={() => navigation.navigate("ForgotPassword")} />
      </Card>
    </Screen>
  );
}
