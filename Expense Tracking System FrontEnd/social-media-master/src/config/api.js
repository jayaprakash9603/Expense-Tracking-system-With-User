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
    Authorization: `Bearer ${getJwtToken()}`,
    "Content-Type": "application/json",
  },
});

// Function to update the Authorization header dynamically
export const updateAuthHeader = () => {
  const jwtToken = getJwtToken();
  api.defaults.headers.Authorization = jwtToken ? `Bearer ${jwtToken}` : null;
};

// Automatically update the Authorization header on page load
updateAuthHeader();
