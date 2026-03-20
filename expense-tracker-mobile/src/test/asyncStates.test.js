import { describe, expect, it } from "vitest";
import { ASYNC_STATES, isPendingState, isTerminalState } from "@/shared/standards/asyncStates";

describe("asyncStates", () => {
  it("recognizes loading state", () => {
    expect(isPendingState(ASYNC_STATES.LOADING)).toBe(true);
    expect(isPendingState(ASYNC_STATES.SUCCESS)).toBe(false);
  });

  it("recognizes terminal states", () => {
    expect(isTerminalState(ASYNC_STATES.SUCCESS)).toBe(true);
    expect(isTerminalState(ASYNC_STATES.ERROR)).toBe(true);
    expect(isTerminalState(ASYNC_STATES.IDLE)).toBe(false);
  });
});
