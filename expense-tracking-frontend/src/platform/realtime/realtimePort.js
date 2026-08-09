/**
 * @typedef {Object} RealtimePort
 * @property {(token?: string) => Promise<void>|void} connect
 * @property {() => void} disconnect
 * @property {(destination: string, callback: Function) => () => void} subscribe
 * @property {(destination: string, body: any, headers?: object) => void} publish
 * @property {() => boolean} isConnected
 */

/**
 * @param {any} candidate
 * @returns {candidate is RealtimePort}
 */
export const assertRealtimePort = (candidate) => {
  if (
    !candidate ||
    typeof candidate.connect !== "function" ||
    typeof candidate.subscribe !== "function" ||
    typeof candidate.publish !== "function"
  ) {
    throw new Error("RealtimePort must implement connect/subscribe/publish");
  }
  return true;
};
