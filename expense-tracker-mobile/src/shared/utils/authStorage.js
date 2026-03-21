import { STORAGE_KEYS } from "@/config/constants";
import { getAppConfig } from "@/config/runtime/parseAppConfig";

export function reconcileAuthStorageWithRuntimeMode() {
  const { isDemo } = getAppConfig();
  const demoKey = STORAGE_KEYS.DEMO_JWT;
  const liveKey = STORAGE_KEYS.JWT;
  const demoTok = sessionStorage.getItem(demoKey);
  const liveTok = localStorage.getItem(liveKey);
  if (isDemo) {
    if (demoTok || !liveTok) return;
    sessionStorage.setItem(demoKey, liveTok);
    localStorage.removeItem(liveKey);
    return;
  }
  if (liveTok || !demoTok) return;
  localStorage.setItem(liveKey, demoTok);
  sessionStorage.removeItem(demoKey);
}

export function getActiveJwt() {
  const { isDemo } = getAppConfig();
  if (isDemo) return sessionStorage.getItem(STORAGE_KEYS.DEMO_JWT);
  return localStorage.getItem(STORAGE_KEYS.JWT);
}

export function setActiveJwt(token) {
  const { isDemo } = getAppConfig();
  if (isDemo) {
    if (token) sessionStorage.setItem(STORAGE_KEYS.DEMO_JWT, token);
    else sessionStorage.removeItem(STORAGE_KEYS.DEMO_JWT);
    localStorage.removeItem(STORAGE_KEYS.JWT);
    return;
  }
  sessionStorage.removeItem(STORAGE_KEYS.DEMO_JWT);
  if (token) localStorage.setItem(STORAGE_KEYS.JWT, token);
  else localStorage.removeItem(STORAGE_KEYS.JWT);
}

export function clearActiveJwt() {
  sessionStorage.removeItem(STORAGE_KEYS.DEMO_JWT);
  localStorage.removeItem(STORAGE_KEYS.JWT);
}
