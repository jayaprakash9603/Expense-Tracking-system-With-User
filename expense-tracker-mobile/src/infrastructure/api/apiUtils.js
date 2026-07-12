export function optionalTargetParams(targetId) {
  return targetId ? { targetId } : undefined;
}
