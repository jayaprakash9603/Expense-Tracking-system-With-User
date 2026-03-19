import axios from "axios";
import { STORAGE_KEYS } from "@/config/constants";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const getJwtToken = () => localStorage.getItem(STORAGE_KEYS.JWT);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const handleRequest = (config) => {
  config.headers = config.headers || {};

  if (config.skipAuth) {
    delete config.skipAuth;
    return config;
  }

  const token = getJwtToken();
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
      localStorage.removeItem(STORAGE_KEYS.JWT);
      window.dispatchEvent(
        new CustomEvent("unauthorized", {
          detail: { message: "Your session has expired. Please login again." },
        })
      );
    }

    if (status === 403) {
      window.dispatchEvent(
        new CustomEvent("show403Error", {
          detail: {
            message:
              error.response.data?.message ||
              "Access denied. You do not have permission.",
          },
        })
      );
    }
  }

  return Promise.reject(error);
};

api.interceptors.request.use(handleRequest, (err) => Promise.reject(err));
api.interceptors.response.use((res) => res, handleResponseError);

export const updateAuthHeader = () => {
  const token = getJwtToken();
  api.defaults.headers.Authorization = token ? `Bearer ${token}` : null;
};

updateAuthHeader();
