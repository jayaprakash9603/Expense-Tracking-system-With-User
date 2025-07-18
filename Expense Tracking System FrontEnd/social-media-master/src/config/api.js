import axios from "axios";

export const API_BASE_URL = "http://localhost:8080";

// Function to get the JWT token from localStorage
const getJwtToken = () => {
  const jwtToken = localStorage.getItem("jwt");
  console.log("JWT Token:", jwtToken);
  return jwtToken;
};

// Create an Axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token dynamically
api.interceptors.request.use(
  (config) => {
    const token = getJwtToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 403:
          // Dispatch custom event for 403 error
          window.dispatchEvent(
            new CustomEvent("show403Error", {
              detail: {
                message:
                  error.response.data?.message ||
                  "Access denied. You do not have permission to access this resource.",
                originalError: error,
              },
            })
          );
          break;

        case 404:
          // Dispatch custom event for 404 error
          window.dispatchEvent(
            new CustomEvent("show404Error", {
              detail: {
                message:
                  error.response.data?.message ||
                  "The requested resource was not found.",
                originalError: error,
              },
            })
          );
          break;

        case 401:
          // Handle unauthorized - clear token and redirect to login
          localStorage.removeItem("jwt");
          window.dispatchEvent(
            new CustomEvent("unauthorized", {
              detail: {
                message: "Your session has expired. Please login again.",
                originalError: error,
              },
            })
          );
          break;

        default:
          console.error("API Error:", error.response.data);
      }
    } else {
      // Network error
      console.error("Network Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Function to update the Authorization header dynamically
export const updateAuthHeader = () => {
  const jwtToken = getJwtToken();
  api.defaults.headers.Authorization = jwtToken ? `Bearer ${jwtToken}` : null;
};

// Automatically update the Authorization header on page load
updateAuthHeader();
