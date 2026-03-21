export const GROUP_ORDER = ["Recent", "Navigation", "Actions", "Settings"];
export const MAX_RESULTS_PER_CATEGORY = 3;

function recencyBoost(actionId, recentIds) {
  const index = recentIds.indexOf(actionId);
  if (index === -1) return 0;
  return Math.max(0, 1 - index / 10) * 0.45;
}

function frequencyBoost(actionId, frequencyMap) {
  const count = Number(frequencyMap[actionId] || 0);
  if (!count) return 0;
  return Math.min(0.4, Math.log10(count + 1) * 0.2);
}

function contextBoost(action, currentRoute) {
  if (!currentRoute || !action.route) return 0;
  if (action.route === currentRoute) return 0.55;
  if (currentRoute.startsWith(action.route) || action.route.startsWith(currentRoute)) {
    return 0.3;
  }

  const currentTop = currentRoute.split("/")[1];
  const targetTop = action.route.split("/")[1];
  return currentTop && targetTop && currentTop === targetTop ? 0.18 : 0;
}

function priorityBoost(priority) {
  return Math.max(0, 10 - Number(priority || 10)) * 0.02;
}

export function calculateSmartScore({ action, fuseScore, recentIds, frequencyMap, currentRoute }) {
  const relevance = 1 - Math.min(1, Number(fuseScore ?? 0.7));
  return (
    relevance +
    recencyBoost(action.id, recentIds) +
    frequencyBoost(action.id, frequencyMap) +
    contextBoost(action, currentRoute) +
    priorityBoost(action.priority)
  );
}

export function groupAndLimit(actions, limitPerCategory = MAX_RESULTS_PER_CATEGORY) {
  const grouped = GROUP_ORDER.reduce((acc, key) => ({ ...acc, [key]: [] }), {});

  actions.forEach((action) => {
    const category = grouped[action.category] ? action.category : "Actions";
    if (grouped[category].length < limitPerCategory) {
      grouped[category].push(action);
    }
  });

  return grouped;
}

export function buildFlattenedGroups(grouped) {
  return GROUP_ORDER.flatMap((category) => grouped[category] || []);
}
