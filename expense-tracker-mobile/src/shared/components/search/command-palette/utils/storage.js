const RECENT_ACTIONS_KEY = "command-palette-recent-actions";
const ACTION_USAGE_KEY = "command-palette-action-usage";
const MAX_RECENT = 10;

function safeRead(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage may be unavailable in private mode.
  }
}

export function getRecentActionIds() {
  return safeRead(RECENT_ACTIONS_KEY, []);
}

export function pushRecentAction(actionId) {
  const current = getRecentActionIds();
  const next = [actionId, ...current.filter((id) => id !== actionId)].slice(0, MAX_RECENT);
  safeWrite(RECENT_ACTIONS_KEY, next);
  return next;
}

export function getActionFrequencyMap() {
  return safeRead(ACTION_USAGE_KEY, {});
}

export function incrementActionFrequency(actionId) {
  const current = getActionFrequencyMap();
  const next = {
    ...current,
    [actionId]: (current[actionId] || 0) + 1,
  };
  safeWrite(ACTION_USAGE_KEY, next);
  return next;
}

export function clearCommandPaletteStorage() {
  safeWrite(RECENT_ACTIONS_KEY, []);
  safeWrite(ACTION_USAGE_KEY, {});
}
