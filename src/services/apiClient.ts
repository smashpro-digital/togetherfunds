import AsyncStorage from "@react-native-async-storage/async-storage";
import { appConfig } from "../config/appConfig";
import { getSessionToken } from "./sessionStorage";

const CACHE_PREFIX = "togetherfunds:api-cache:";

type RequestOptions = {
  body?: unknown;
  cacheKey?: string;
};

export type ApiResult<T> = {
  data: T | null;
  fromCache: boolean;
  error?: string;
};

const baseUrl = appConfig.apiBaseUrl.replace(/\/$/, "");

async function readCache<T>(cacheKey?: string): Promise<ApiResult<T>> {
  if (!cacheKey) {
    return { data: null, fromCache: true, error: "Server unavailable" };
  }

  const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${cacheKey}`);
  if (!raw) {
    return { data: null, fromCache: true, error: "Server unavailable and no local cache exists" };
  }

  return { data: JSON.parse(raw) as T, fromCache: true, error: "Server unavailable; showing local cache" };
}

async function writeCache<T>(cacheKey: string | undefined, data: T): Promise<void> {
  if (!cacheKey) return;
  await AsyncStorage.setItem(`${CACHE_PREFIX}${cacheKey}`, JSON.stringify(data)).catch(() => undefined);
}

async function request<T>(method: "GET" | "POST" | "PUT" | "DELETE", endpoint: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const url = `${baseUrl}/${endpoint.replace(/^\//, "")}`;
  const sessionToken = await getSessionToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-SmashPro-Api-Key": appConfig.apiKey,
    "X-SmashPro-App-Key": appConfig.appKey,
    "X-SmashPro-Tenant-Key": appConfig.tenantKey,
  };

  if (sessionToken) {
    headers.Authorization = `Bearer ${sessionToken}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;

    if (!response.ok) {
      const message =
        payload && typeof payload === "object" && "error" in payload && payload.error ? payload.error : `HTTP ${response.status}`;
      throw new Error(message);
    }

    await writeCache(options.cacheKey, payload as T);
    return { data: payload as T, fromCache: false };
  } catch (error) {
    const cached = await readCache<T>(options.cacheKey);
    return {
      ...cached,
      error: cached.error ?? (error instanceof Error ? error.message : "Server unavailable"),
    };
  }
}

export const apiClient = {
  baseUrl,
  appKey: appConfig.appKey,
  tenantKey: appConfig.tenantKey,
  get: <T>(endpoint: string, cacheKey?: string) => request<T>("GET", endpoint, { cacheKey }),
  post: <T>(endpoint: string, body?: unknown, cacheKey?: string) => request<T>("POST", endpoint, { body, cacheKey }),
  put: <T>(endpoint: string, body?: unknown, cacheKey?: string) => request<T>("PUT", endpoint, { body, cacheKey }),
  delete: <T>(endpoint: string, body?: unknown, cacheKey?: string) => request<T>("DELETE", endpoint, { body, cacheKey }),
};
