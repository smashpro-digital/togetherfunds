import { Text } from "react-native";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { colors } from "../theme";

export function ForgotPasswordScreen() {
  return (
    <Screen title="Forgot password" subtitle="Password reset will be handled by the account backend.">
      <Card>
        <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 22 }}>
          This placeholder keeps the mobile flow ready while email-based reset tokens and rate limiting are added on the
          server.
        </Text>
      </Card>
    </Screen>
  );
}
