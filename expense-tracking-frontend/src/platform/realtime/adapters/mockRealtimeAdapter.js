/**
 * In-memory realtime adapter for tests and mock transport.
 */
export const createMockRealtimeAdapter = () => {
  const subscriptions = new Map();
  let connected = false;

  const connect = async () => {
    connected = true;
  };

  const disconnect = () => {
    connected = false;
    subscriptions.clear();
  };

  const subscribe = (destination, callback) => {
    if (!subscriptions.has(destination)) {
      subscriptions.set(destination, new Set());
    }
    subscriptions.get(destination).add(callback);
    return () => subscriptions.get(destination)?.delete(callback);
  };

  const publish = (destination, body) => {
    const set = subscriptions.get(destination);
    if (set) {
      set.forEach((cb) => cb(body));
    }
  };

  const isConnected = () => connected;

  /** Test helper: simulate a server push. */
  const emit = (destination, body) => publish(destination, body);

  return Object.freeze({
    connect,
    disconnect,
    subscribe,
    publish,
    isConnected,
    emit,
  });
};
