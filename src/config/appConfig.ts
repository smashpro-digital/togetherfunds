export const appConfig = {
  apiBaseUrl: process.env.EXPO_PUBLIC_TOGETHERFUNDS_API_BASE_URL || "https://smashpro.app/api/v1/routes",
  apiKey: process.env.EXPO_PUBLIC_TOGETHERFUNDS_API_KEY || "",
  appKey: process.env.EXPO_PUBLIC_TOGETHERFUNDS_APP_KEY || "togetherfunds",
  tenantKey: process.env.EXPO_PUBLIC_TOGETHERFUNDS_TENANT_KEY || "demo-couple"
};
