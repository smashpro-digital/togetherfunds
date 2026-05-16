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

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const { register, error, isLoading } = useAuthStore();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    if (password.length < 8) {
      Alert.alert("Password too short", "Use at least 8 characters.");
      return;
    }

    const ok = await register({
      display_name: displayName.trim(),
      email: email.trim(),
      username: username.trim(),
      password
    });

    if (!ok) {
      Alert.alert("Could not register", getAuthSnapshot().error ?? error ?? "Try again.");
    }
  }

  return (
    <Screen title="Create account" subtitle="Create your TogetherFunds account.">
      <Card>
        <FormField label="Display name" value={displayName} onChangeText={setDisplayName} />
        <FormField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <FormField label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <FormField label="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
        {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
        <AppButton label={isLoading ? "Creating..." : "Create account"} onPress={submit} />
        <AppButton label="I already have an account" variant="secondary" onPress={() => navigation.navigate("Login")} />
      </Card>
    </Screen>
  );
}
