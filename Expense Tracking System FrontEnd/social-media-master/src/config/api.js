import axios from "axios";
import {
  attachSystemErrorPayload,
  buildSystemErrorPayloadFromAxios,
} from "../utils/systemErrorEvents";

const isCanceledError = (error) =>
  axios.isCancel(error) ||
  error?.code === "ERR_CANCELED" ||
  error?.message === "canceled" ||
  error?.name === "CanceledError";

// Use environment variable for API base URL; fallback to localhost for local dev only
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

// Function to get the JWT token from localStorage
// NOTE: For enhanced security, consider using HttpOnly cookies instead of localStorage
const getJwtToken = () => {
  const jwtToken = localStorage.getItem("jwt");
  // console.log("JWT Token:", jwtToken);
  return jwtToken;
};

// Create an Axios instance used across the app
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const AUTH_HEADER_KEY = "Authorization";

const handleRequest = (config = {}) => {
  const requestConfig = config;
  requestConfig.headers = requestConfig.headers || {};
  const shouldSkipAuth = requestConfig.skipAuth === true;

  if (!shouldSkipAuth) {
    const token = getJwtToken();
    if (token) {
      requestConfig.headers[AUTH_HEADER_KEY] = `Bearer ${token}`;
    }
  } else if (requestConfig.headers[AUTH_HEADER_KEY]) {
    delete requestConfig.headers[AUTH_HEADER_KEY];
  }

  if (shouldSkipAuth) {
    delete requestConfig.skipAuth;
  }

  return requestConfig;
};

const handleRequestError = (error) => Promise.reject(error);

const shouldNormalizeStatus = (status) =>
  status === 401 ||
  status === 403 ||
  (typeof status === "number" && status >= 500 && status < 600);

const handleResponseError = (error) => {
  if (isCanceledError(error)) {
    return Promise.reject(error);
  }

  if (error.response) {
    const { status } = error.response;
    const responseMessage =
      error.response.data?.message ||
      error.response.data?.error ||
      "An unexpected error occurred.";
    const attachSystemError = () =>
      attachSystemErrorPayload(error, {
        status,
        message: responseMessage,
      });

    switch (status) {
      case 403:
        window.dispatchEvent(
          new CustomEvent("show403Error", {
            detail: {
              message:
                error.response.data?.message ||
                "Access denied. You do not have permission to access this resource.",
              originalError: error,
            },
          }),
        );
        attachSystemError();
        break;
      case 404:
        window.dispatchEvent(
          new CustomEvent("show404Error", {
            detail: {
              message:
                error.response.data?.message ||
                "The requested resource was not found.",
              originalError: error,
            },
          }),
        );
        break;
      case 401:
        localStorage.removeItem("jwt");
        window.dispatchEvent(
          new CustomEvent("unauthorized", {
            detail: {
              message: "Your session has expired. Please login again.",
              originalError: error,
            },
          }),
        );
        attachSystemError();
        break;
      default:
        if (shouldNormalizeStatus(status)) {
          attachSystemError();
        }
        console.error("API Error:", error.response.data);
    }
  } else {
    console.error("Network Error:", error.message);
    attachSystemErrorPayload(error, {
      ...buildSystemErrorPayloadFromAxios(error),
      status: "NETWORK",
      message: error.message || "Network error",
    });
  }

  return Promise.reject(error);
};

const attachInterceptors = (axiosInstance) => {
  axiosInstance.interceptors.request.use(handleRequest, handleRequestError);
  axiosInstance.interceptors.response.use(
    (response) => response,
    handleResponseError,
  );
};

attachInterceptors(api);
attachInterceptors(axios);

// Function to update the Authorization header dynamically
export const updateAuthHeader = () => {
  const jwtToken = getJwtToken();
  api.defaults.headers.Authorization = jwtToken ? `Bearer ${jwtToken}` : null;
};

// Automatically update the Authorization header on page load
updateAuthHeader();
