import { useCallback, useSyncExternalStore } from "react";
import { appConfig } from "../config/appConfig";
import {
  AuthPayload,
  SharedUser,
  UserAppSettings,
  UserPreferences,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUserAppSettings,
  updateUserPreferences
} from "../services/authApi";
import { clearSessionTokens, getSessionToken, setSessionTokens } from "../services/sessionStorage";

type AuthState = {
  user: SharedUser | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeAppKey: string;
  tenantKey: string;
  preferences: UserPreferences | null;
  appSettings: UserAppSettings | null;
  error: string | null;
};

let state: AuthState = {
  user: null,
  sessionToken: null,
  isAuthenticated: false,
  isLoading: true,
  activeAppKey: appConfig.appKey,
  tenantKey: appConfig.tenantKey,
  preferences: null,
  appSettings: null,
  error: null
};

const listeners = new Set<() => void>();
let hydrateStarted = false;

function emit(next: Partial<AuthState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function applyAuthPayload(payload: AuthPayload) {
  emit({
    user: payload.user,
    sessionToken: payload.session_token,
    isAuthenticated: true,
    isLoading: false,
    tenantKey: payload.tenant_key ?? state.tenantKey,
    preferences: payload.preferences ?? null,
    appSettings: payload.app_settings ?? null,
    error: null
  });
}

async function hydrateAuth() {
  if (hydrateStarted) return;
  hydrateStarted = true;

  const token = await getSessionToken();
  if (!token) {
    emit({ isLoading: false });
    return;
  }

  emit({ sessionToken: token });
  const result = await getCurrentUser();

  if (result.data?.user) {
    emit({
      user: result.data.user,
      isAuthenticated: true,
      isLoading: false,
      tenantKey: result.data.tenant_key ?? state.tenantKey,
      preferences: result.data.preferences ?? null,
      appSettings: result.data.app_settings ?? null,
      error: null
    });
    return;
  }

  await clearSessionTokens();
  emit({
    user: null,
    sessionToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: result.error ?? null
  });
}

export function useAuthStore() {
  const snapshot = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => state
  );

  hydrateAuth();

  const login = useCallback(async (loginValue: string, password: string) => {
    emit({ isLoading: true, error: null });
    const result = await loginUser({ login: loginValue, password });
    if (!result.data) {
      emit({ isLoading: false, error: result.error ?? "Login failed" });
      return false;
    }

    await setSessionTokens(result.data.session_token, result.data.refresh_token);
    applyAuthPayload(result.data);
    return true;
  }, []);

  const register = useCallback(async (input: { email: string; username?: string; password: string; display_name?: string }) => {
    emit({ isLoading: true, error: null });
    const result = await registerUser(input);
    if (!result.data) {
      emit({ isLoading: false, error: result.error ?? "Registration failed" });
      return false;
    }

    await setSessionTokens(result.data.session_token, result.data.refresh_token);
    applyAuthPayload(result.data);
    return true;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser().catch(() => undefined);
    await clearSessionTokens();
    emit({
      user: null,
      sessionToken: null,
      isAuthenticated: false,
      preferences: null,
      appSettings: null,
      error: null
    });
  }, []);

  const savePreferences = useCallback(async (preferences: UserPreferences) => {
    const result = await updateUserPreferences(preferences);
    if (result.data?.preferences) {
      emit({ preferences: result.data.preferences, error: null });
      return true;
    }
    emit({ error: result.error ?? "Could not save preferences" });
    return false;
  }, []);

  const saveAppSettings = useCallback(async (appSettings: UserAppSettings) => {
    const result = await updateUserAppSettings(appSettings);
    if (result.data?.app_settings) {
      emit({ appSettings: result.data.app_settings, error: null });
      return true;
    }
    emit({ error: result.error ?? "Could not save app settings" });
    return false;
  }, []);

  return {
    ...snapshot,
    login,
    register,
    logout,
    savePreferences,
    saveAppSettings
  };
}
