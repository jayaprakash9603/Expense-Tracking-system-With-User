import { getAppConfig, refreshAppConfig } from "./config/appConfig";
import { TRANSPORT } from "./config/transportProfiles";
import { createLocalStorageAdapter, createMemoryStorageAdapter } from "./storage/storagePort";
import { createTokenPort } from "./auth/tokenPort";
import { createAxiosHttpAdapter } from "./http/adapters/axiosHttpAdapter";
import { createSnowHttpAdapter } from "./http/adapters/snowHttpAdapter";
import { createMockHttpAdapter } from "./http/adapters/mockHttpAdapter";
import { createStompRealtimeAdapter } from "./realtime/adapters/stompAdapter";
import { createMockRealtimeAdapter } from "./realtime/adapters/mockRealtimeAdapter";
import { createCatalogResolver } from "../api/resolveEndpoint";

/**
 * Composition root — wires adapters based on AppConfig.
 * Call getContainer() once; subsequent calls return the same instance
 * unless rebuildContainer() is used (tests / runtime-config hot-swap).
 */

let container = null;

const buildResolvePath = (config, catalogResolver) => {
  return (req) => {
    if (typeof catalogResolver === "function" && req.endpointId) {
      return catalogResolver(req.endpointId, req.pathParams, config);
    }
    return {
      url: req.path || "",
      method: req.method || "GET",
      skipAuth: req.skipAuth,
    };
  };
};

/**
 * @param {{ catalogResolver?: Function, mockHandlers?: object }} [options]
 */
export const createContainer = (options = {}) => {
  const config = options.config || getAppConfig();
  const storage =
    config.transport === TRANSPORT.MOCK && options.useMemoryStorage
      ? createMemoryStorageAdapter()
      : createLocalStorageAdapter();
  const tokenPort = createTokenPort(storage);
  const catalogResolver =
    options.catalogResolver || createCatalogResolver();
  const resolvePath = buildResolvePath(config, catalogResolver);

  let http;
  switch (config.transport) {
    case TRANSPORT.SNOW:
      http = createSnowHttpAdapter({
        baseURL: config.snowBaseUrl || config.activeBaseUrl,
        tokenPort,
        resolvePath,
      });
      break;
    case TRANSPORT.MOCK:
      http = createMockHttpAdapter({
        handlers: options.mockHandlers || {},
      });
      break;
    case TRANSPORT.LIVE:
    default:
      http = createAxiosHttpAdapter({
        baseURL: config.apiBaseUrl || config.activeBaseUrl,
        tokenPort,
        resolvePath,
      });
      break;
  }

  const realtimeFactory = (channel) => {
    if (config.transport === TRANSPORT.MOCK) {
      return createMockRealtimeAdapter();
    }
    const urls = {
      chat: config.chatWsUrl,
      notifications: config.notificationWsUrl,
      stories: config.storyWsUrl,
    };
    return createStompRealtimeAdapter({
      url: urls[channel] || config.chatWsUrl,
      tokenPort,
    });
  };

  const repositories = new Map();

  return Object.freeze({
    config,
    storage,
    tokenPort,
    http,
    realtime: {
      chat: () => realtimeFactory("chat"),
      notifications: () => realtimeFactory("notifications"),
      stories: () => realtimeFactory("stories"),
      create: realtimeFactory,
    },
    registerRepository: (name, impl) => {
      repositories.set(name, impl);
    },
    getRepository: (name) => {
      if (!repositories.has(name)) {
        throw new Error(`Repository not registered: ${name}`);
      }
      return repositories.get(name);
    },
    hasRepository: (name) => repositories.has(name),
  });
};

export const getContainer = (options) => {
  if (!container) {
    container = createContainer(options);
  }
  return container;
};

export const rebuildContainer = (options) => {
  refreshAppConfig();
  container = createContainer({
    ...options,
    config: getAppConfig(),
  });
  return container;
};

/** Test helper — wipe the singleton. */
export const resetContainer = () => {
  container = null;
};
