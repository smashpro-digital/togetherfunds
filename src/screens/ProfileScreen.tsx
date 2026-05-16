import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { MoneyRow } from "../components/MoneyRow";
import { Screen } from "../components/Screen";
import { useAuthStore } from "../store/authStore";

export function ProfileScreen() {
  const { user, activeAppKey, tenantKey, logout } = useAuthStore();

  return (
    <Screen title="Profile" subtitle="Shared SmashPro account details for this app session.">
      <Card>
        <MoneyRow label="Name" value={user?.name || "Not set"} />
        <MoneyRow label="Username" value={user?.username || "Not set"} />
        <MoneyRow label="Email" value={user?.email || "Not set"} />
        <MoneyRow label="App Key" value={activeAppKey} />
        <MoneyRow label="Tenant Key" value={tenantKey} />
      </Card>
      <AppButton label="Log out" variant="danger" onPress={logout} />
    </Screen>
  );
}
