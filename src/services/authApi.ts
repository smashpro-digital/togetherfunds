import { apiClient } from "./apiClient";

export type SharedUser = {
  id: string;
  email: string;
  username?: string | null;
  name?: string | null;
  role?: string | null;
};

export type UserPreferences = {
  display_name?: string | null;
  preferred_currency?: string | null;
  theme_mode?: string | null;
  accent_color?: string | null;
  notification_preferences?: Record<string, unknown> | null;
};

export type UserAppSettings = {
  dashboard_layout?: string | null;
  envelope_style?: string | null;
  default_budget_period?: string | null;
  settings_json?: Record<string, unknown> | null;
};

export type AuthPayload = {
  user: SharedUser;
  session_token: string;
  refresh_token?: string | null;
  expires_at?: string;
  tenant_key?: string;
  preferences?: UserPreferences | null;
  app_settings?: UserAppSettings | null;
};

export type MePayload = {
  user: SharedUser;
  tenant_key?: string;
  preferences?: UserPreferences | null;
  app_settings?: UserAppSettings | null;
};

export function registerUser(input: { email: string; username?: string; password: string; display_name?: string }) {
  return apiClient.post<AuthPayload>("auth.register.post.php", input);
}

export function loginUser(input: { login: string; password: string }) {
  return apiClient.post<AuthPayload>("auth.login.post.php", input);
}

export function getCurrentUser() {
  return apiClient.get<MePayload>("auth.me.get.php");
}

export function logoutUser() {
  return apiClient.post<{ ok: true }>("auth.logout.post.php");
}

export function refreshSession(refreshToken: string) {
  return apiClient.post<AuthPayload>("auth.refresh.post.php", { refresh_token: refreshToken });
}

export function getUserPreferences() {
  return apiClient.get<{ preferences: UserPreferences | null }>("user.preferences.get.php", "user.preferences");
}

export function updateUserPreferences(preferences: UserPreferences) {
  return apiClient.put<{ preferences: UserPreferences }>("user.preferences.put.php", preferences, "user.preferences");
}

export function getUserAppSettings() {
  return apiClient.get<{ app_settings: UserAppSettings | null }>("user.app-settings.get.php", "user.app-settings");
}

export function updateUserAppSettings(appSettings: UserAppSettings) {
  return apiClient.put<{ app_settings: UserAppSettings }>("user.app-settings.put.php", appSettings, "user.app-settings");
}

export function createCoupleInvite(input: { couple_id: number; role?: "partner" | "viewer"; expires_in_days?: number }) {
  return apiClient.post<{ invite_code: string; expires_at: string }>("togetherfunds.invites.create.post.php", input);
}

export function acceptCoupleInvite(inviteCode: string) {
  return apiClient.post<{ couple_id: number; tenant_key: string; role: string }>("togetherfunds.invites.accept.post.php", {
    invite_code: inviteCode
  });
}
