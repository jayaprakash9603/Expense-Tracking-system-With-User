const listeners = new Set();
let currentMessage = null;

/**
 * Subscribe to global header messages.
 * Returns an unsubscribe handler.
 */
export const subscribeToGlobalMessage = (listener) => {
  if (typeof listener !== "function") {
    throw new Error("Global message listener must be a function");
  }

  listeners.add(listener);

  // Emit current message immediately so subscribers render existing content
  listener(currentMessage);

  return () => {
    listeners.delete(listener);
  };
};

/**
 * Publish a new header message.
 * Supports custom renderers and arbitrary payloads.
 */
export const publishGlobalMessage = (message) => {
  if (!message || typeof message !== "object") {
    throw new Error("Global message must be an object");
  }

  const normalizedMessage = {
    id: message.id || `global-message-${Date.now()}`,
    timestamp: Date.now(),
    renderer: message.renderer || "text",
    props: message.props || {},
    component: message.component || null,
    payload: message.payload || null,
    meta: message.meta || {},
  };

  currentMessage = normalizedMessage;
  listeners.forEach((listener) => listener(currentMessage));

  return normalizedMessage.id;
};

/**
 * Clears the current global message.
 * If an ID is provided, it only clears when IDs match.
 */
export const clearGlobalMessage = (messageId) => {
  if (messageId && currentMessage && currentMessage.id !== messageId) {
    return;
  }

  if (!currentMessage) {
    return;
  }

  currentMessage = null;
  listeners.forEach((listener) => listener(currentMessage));
};

export const getCurrentGlobalMessage = () => currentMessage;
