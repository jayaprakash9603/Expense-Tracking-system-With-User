import axios from "axios";
import { getAppConfig } from "@/config/runtime/parseAppConfig";
import { getActiveJwt, clearActiveJwt } from "@/shared/utils/authStorage";
import { createDemoAdapter } from "@/config/api/demoAdapter";

const demoAdapter = createDemoAdapter();

function applyRuntimeTransport(config) {
  const cfg = getAppConfig();
  if (cfg.isDemo) {
    config.baseURL = "";
    config.adapter = demoAdapter;
  } else {
    config.baseURL = cfg.apiBaseUrl;
    delete config.adapter;
  }
}

export const api = axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
});

const handleRequest = (config) => {
  applyRuntimeTransport(config);
  config.headers = config.headers || {};

  if (config.skipAuth) {
    delete config.skipAuth;
    return config;
  }

  const token = getActiveJwt();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const handleResponseError = (error) => {
  if (axios.isCancel(error)) return Promise.reject(error);

  if (error.response) {
    const { status } = error.response;

    if (status === 401) {
      clearActiveJwt();
      window.dispatchEvent(
        new CustomEvent("unauthorized", {
          detail: { messageKey: "session.expired" },
        }),
      );
    }

    if (status === 403) {
      window.dispatchEvent(
        new CustomEvent("show403Error", {
          detail: {
            message: error.response.data?.message,
            messageKey: "session.accessDenied",
          },
        }),
      );
    }
  }

  return Promise.reject(error);
};

api.interceptors.request.use(handleRequest, (err) => Promise.reject(err));
api.interceptors.response.use((res) => res, handleResponseError);

export const updateAuthHeader = () => {
  const token = getActiveJwt();
  api.defaults.headers.Authorization = token ? `Bearer ${token}` : null;
};

updateAuthHeader();
