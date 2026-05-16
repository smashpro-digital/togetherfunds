import * as SecureStore from "expo-secure-store";

const SESSION_TOKEN_KEY = "togetherfunds.session_token";
const REFRESH_TOKEN_KEY = "togetherfunds.refresh_token";

export async function getSessionToken(): Promise<string | null> {
  return SecureStore.getItemAsync(SESSION_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function setSessionTokens(sessionToken: string, refreshToken?: string | null): Promise<void> {
  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, sessionToken);

  if (refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export async function clearSessionTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(SESSION_TOKEN_KEY).catch(() => undefined),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => undefined)
  ]);
}
