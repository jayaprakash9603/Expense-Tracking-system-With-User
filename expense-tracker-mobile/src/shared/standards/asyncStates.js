export const ASYNC_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

export function isTerminalState(state) {
  return state === ASYNC_STATES.SUCCESS || state === ASYNC_STATES.ERROR;
}

export function isPendingState(state) {
  return state === ASYNC_STATES.LOADING;
}
