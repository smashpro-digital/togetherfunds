import AsyncStorage from "@react-native-async-storage/async-storage";
import { appConfig } from "../config/appConfig";
import { getSessionToken } from "./sessionStorage";

const CACHE_PREFIX = "togetherfunds:api-cache:";

type RequestOptions = {
  body?: unknown;
  cacheKey?: string;
  debugLabel?: string;
};

export type ApiResult<T> = {
  data: T | null;
  fromCache: boolean;
  error?: string;
  status?: number;
  url?: string;
  endpoint?: string;
  correlationId?: string;
  responseBody?: unknown;
};

const baseUrl = appConfig.apiBaseUrl.replace(/\/$/, "");

class ApiRequestError extends Error {
  status: number;
  url: string;
  endpoint: string;
  correlationId?: string;
  responseBody: unknown;

  constructor(input: { message: string; status: number; url: string; endpoint: string; correlationId?: string; responseBody: unknown }) {
    super(input.message);
    this.name = "ApiRequestError";
    this.status = input.status;
    this.url = input.url;
    this.endpoint = input.endpoint;
    this.correlationId = input.correlationId;
    this.responseBody = input.responseBody;
  }
}

function redactHeaders(headers: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => {
      const lower = key.toLowerCase();
      if (lower.includes("authorization") || lower.includes("api-key") || lower.includes("token")) {
        return [key, value ? "[REDACTED]" : ""];
      }
      return [key, value];
    })
  );
}

function buildErrorMessage(input: {
  message: string;
  status?: number;
  url?: string;
  endpoint?: string;
  correlationId?: string;
  responseBody?: unknown;
}) {
  const parts = [
    input.message,
    input.status !== undefined ? `HTTP ${input.status}` : undefined,
    input.endpoint ? `Endpoint: ${input.endpoint}` : undefined,
    input.url ? `URL: ${input.url}` : undefined,
    input.correlationId ? `Correlation ID: ${input.correlationId}` : undefined,
  ].filter(Boolean);

  if (input.responseBody !== undefined && input.responseBody !== null) {
    parts.push(`Response: ${typeof input.responseBody === "string" ? input.responseBody : JSON.stringify(input.responseBody)}`);
  }

  return parts.join("\n");
}

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
  const normalizedEndpoint = endpoint.replace(/^\//, "");
  const url = `${baseUrl}/${normalizedEndpoint}`;
  const sessionToken = await getSessionToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-SmashPro-Api-Key": appConfig.apiKey,
    "X-Api-Key": appConfig.apiKey,
    "X-SmashPro-App-Key": appConfig.appKey,
    "X-SmashPro-Tenant-Key": appConfig.tenantKey,
  };

  if (sessionToken) {
    headers.Authorization = `Bearer ${sessionToken}`;
  }

  try {
    if (__DEV__ && options.debugLabel) {
      console.log(`[TogetherFunds API] ${options.debugLabel} request`, {
        method,
        url,
        endpoint: normalizedEndpoint,
        headers: redactHeaders(headers),
        body: options.body
      });
    }

    const response = await fetch(url, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const responseText = await response.text();
    let payload: any = null;
    try {
      payload = responseText ? JSON.parse(responseText) : null;
    } catch {
      payload = null;
    }
    const correlationId = response.headers.get("x-correlation-id") ?? (payload?.correlation_id as string | undefined);

    if (__DEV__ && options.debugLabel) {
      console.log(`[TogetherFunds API] ${options.debugLabel} response`, {
        status: response.status,
        url,
        endpoint: normalizedEndpoint,
        correlationId,
        body: payload ?? responseText
      });
    }

    if (!response.ok) {
      const message =
        payload && typeof payload === "object" && "error" in payload && payload.error ? payload.error : `HTTP ${response.status}`;
      throw new ApiRequestError({
        message,
        status: response.status,
        url,
        endpoint: normalizedEndpoint,
        correlationId,
        responseBody: payload ?? responseText
      });
    }

    await writeCache(options.cacheKey, payload as T);
    return { data: payload as T, fromCache: false, status: response.status, url, endpoint: normalizedEndpoint, correlationId, responseBody: payload };
  } catch (error) {
    if (error instanceof ApiRequestError) {
      const message = buildErrorMessage({
        message: error.message,
        status: error.status,
        url: error.url,
        endpoint: error.endpoint,
        correlationId: error.correlationId,
        responseBody: error.responseBody
      });
      return {
        data: null,
        fromCache: false,
        error: message,
        status: error.status,
        url: error.url,
        endpoint: error.endpoint,
        correlationId: error.correlationId,
        responseBody: error.responseBody
      };
    }

    if (__DEV__ && options.debugLabel) {
      console.log(`[TogetherFunds API] ${options.debugLabel} network error`, {
        method,
        url,
        endpoint: normalizedEndpoint,
        error: error instanceof Error ? error.message : String(error)
      });
    }

    const cached = await readCache<T>(options.cacheKey);
    const networkMessage = buildErrorMessage({
      message: error instanceof Error ? error.message : "Network error",
      status: 0,
      url,
      endpoint: normalizedEndpoint
    });
    return {
      ...cached,
      error: cached.data ? cached.error ?? networkMessage : networkMessage,
      status: 0,
      url,
      endpoint: normalizedEndpoint
    };
  }
}

export const apiClient = {
  baseUrl,
  appKey: appConfig.appKey,
  tenantKey: appConfig.tenantKey,
  get: <T>(endpoint: string, cacheKey?: string) => request<T>("GET", endpoint, { cacheKey }),
  post: <T>(endpoint: string, body?: unknown, cacheKey?: string, debugLabel?: string) => request<T>("POST", endpoint, { body, cacheKey, debugLabel }),
  put: <T>(endpoint: string, body?: unknown, cacheKey?: string) => request<T>("PUT", endpoint, { body, cacheKey }),
  delete: <T>(endpoint: string, body?: unknown, cacheKey?: string) => request<T>("DELETE", endpoint, { body, cacheKey }),
};
