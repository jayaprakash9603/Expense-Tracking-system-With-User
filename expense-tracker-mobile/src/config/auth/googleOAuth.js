import { getAppConfig } from "@/config/runtime/parseAppConfig";

export function resolveGoogleSignInClientId() {
  const cfg = getAppConfig();
  if (cfg.isDemo || !cfg.featureFlags.googleOAuth) return "";
  return cfg.googleClientId;
}
