import { useNavigate } from "react-router";
import { api, API_BASE_URL, updateAuthHeader } from "../../config/api";
import {
  GET_PROFILE_FAILURE,
  GET_PROFILE_REQUEST,
  GET_PROFILE_SUCCESS,
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT,
  RESET_CLOUDINARY_STATE,
  UPDATE_PROFILE_FAILURE,
  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPLOAD_TO_CLOUDINARY_FAILURE,
  UPLOAD_TO_CLOUDINARY_REQUEST,
  UPLOAD_TO_CLOUDINARY_SUCCESS,
} from "./auth.actionType";
import { CLEAR_USER_SETTINGS } from "../UserSettings/userSettings.actionType";
import axios from "axios";

// Redirect helper function
const redirectToHome = (navigate) => {
  navigate("/");
};

// Load user dashboard preferences after login
const loadUserDashboardPreferences = async () => {
  try {
    const dashboardResponse = await api.get("/api/user/dashboard-preferences");
    if (dashboardResponse.data && dashboardResponse.data.layoutConfig) {
      // Store in localStorage - will be picked up by useDashboardLayout hook
      localStorage.setItem(
        "dashboard_layout_config",
        dashboardResponse.data.layoutConfig
      );
      console.log(
        "Dashboard preferences loaded:",
        dashboardResponse.data.id ? "custom layout" : "default layout"
      );
      return true;
    }
  } catch (error) {
    console.log("Could not load dashboard preferences:", error.message);
    return false;
  }
};

// Login User Action
export const loginUserAction = (loginData) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });

  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/auth/signin`,
      loginData.data
    );

    console.log("Login response data:", data.jwt);

    dispatch({ type: LOGIN_SUCCESS, payload: data.jwt });
    if (data.jwt) {
      localStorage.setItem("jwt", data.jwt);
    }

    // Immediately fetch the user profile after login
    const profileResponse = await dispatch(getProfileAction(data.jwt));
    updateAuthHeader();

    // Load user dashboard preferences (non-blocking)
    loadUserDashboardPreferences().catch((err) =>
      console.log("Failed to load dashboard preferences:", err)
    );

    console.log("Profile Response:", profileResponse);
    console.log("Returning from loginUserAction:", {
      success: true,
      user: profileResponse,
      currentMode: profileResponse?.currentMode,
      role: profileResponse?.role,
    });

    // Return success with user data for navigation
    return {
      success: true,
      user: profileResponse,
      currentMode: profileResponse?.currentMode,
      role: profileResponse?.role,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Login failed. Please try again.";
    console.log("Login error:", errorMessage);
    dispatch({ type: LOGIN_FAILURE, payload: errorMessage });

    return {
      success: false,
      message: errorMessage,
    };
  }
};

const CLOUDINARY_UPLOAD_PRESET = "expense_tracker";
const CLOUDINARY_CLOUD_NAME = "dtun8attk";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

const clearBrowserStorage = () => {
  if (typeof window !== "undefined") {
    try {
      window.localStorage?.clear?.();
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("localStorage clear failed", error);
      }
    }
    try {
      window.sessionStorage?.clear?.();
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("sessionStorage clear failed", error);
      }
    }
  }

  if (typeof document !== "undefined") {
    const cookies = document.cookie ? document.cookie.split(";") : [];
    cookies.forEach((cookie) => {
      const eqIndex = cookie.indexOf("=");
      const name =
        eqIndex > -1 ? cookie.substring(0, eqIndex).trim() : cookie.trim();
      if (name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
      }
    });
  }
};

// Action Creators
export const uploadToCloudinary = (file) => {
  return async (dispatch) => {
    dispatch({ type: UPLOAD_TO_CLOUDINARY_REQUEST });

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await axios.post(CLOUDINARY_UPLOAD_URL, uploadData);
      dispatch({
        type: UPLOAD_TO_CLOUDINARY_SUCCESS,
        payload: response.data.secure_url,
      });
    } catch (error) {
      dispatch({
        type: UPLOAD_TO_CLOUDINARY_FAILURE,
        payload: error.response?.data?.message || "Image upload failed",
      });
    }
  };
};

export const resetCloudinaryState = () => ({
  type: RESET_CLOUDINARY_STATE,
});

// Register User Action (no auto-login; user must manually sign in)
export const registerUserAction = (loginData) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/auth/signup`,
      loginData.data
    );
    console.log("Register response data:", data);
    // Do NOT store token or mark as logged in; require explicit login afterwards
    dispatch({ type: LOGIN_SUCCESS, payload: null });
    return { success: true };
  } catch (error) {
    console.log("Register error:", error);
    const message = error.response?.data?.message || error.message;
    dispatch({ type: LOGIN_FAILURE, payload: message });
    return { success: false, message };
  }
};

// Get Profile Action
export const getProfileAction = (jwt) => async (dispatch) => {
  dispatch({ type: GET_PROFILE_REQUEST });

  try {
    const { data } = await axios.get(`${API_BASE_URL}/api/user/profile`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    const firstName = data.firstName;

    console.log("First Name:", firstName);
    dispatch({ type: GET_PROFILE_SUCCESS, payload: data });

    // Return the user data
    return data;
  } catch (error) {
    console.error("Get profile error:", error);

    // If profile fetch fails (401, 403, or connection error), clear JWT and logout
    const status = error.response?.status;
    if (status === 401 || status === 403 || !error.response) {
      console.log("Invalid or expired token, clearing JWT and logging out");
      localStorage.removeItem("jwt");
      dispatch({ type: LOGOUT });
    }

    dispatch({ type: GET_PROFILE_FAILURE, payload: error });
    throw error; // Re-throw so App.js can catch it
  }
};

// Update Profile Action
export const updateProfileAction = (reqData) => async (dispatch) => {
  dispatch({ type: UPDATE_PROFILE_REQUEST });

  try {
    const token = localStorage.getItem("jwt");
    if (!token) {
      throw new Error("Authorization token is missing");
    }

    const { data } = await api.put(`/api/user`, reqData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Extract user object from response (backend returns {message, user})
    const updatedUser = data.user || data;
    dispatch({ type: UPDATE_PROFILE_SUCCESS, payload: updatedUser });

    return { success: true, user: updatedUser };
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message;
    dispatch({
      type: UPDATE_PROFILE_FAILURE,
      payload: errorMessage,
    });
    return { success: false, message: errorMessage };
  }
};

// Logout Action
export const logoutAction = () => (dispatch) => {
  clearBrowserStorage();

  dispatch({ type: LOGOUT });
  dispatch({ type: CLEAR_USER_SETTINGS }); // Clear user settings on logout
  updateAuthHeader();
};

// Switch User Mode Action (USER <-> ADMIN)
export const switchUserModeAction = (mode) => async (dispatch) => {
  try {
    const token = localStorage.getItem("jwt");
    if (!token) {
      throw new Error("Authorization token is missing");
    }

    const { data } = await api.put(
      `/api/user/switch-mode?mode=${mode}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch({
      type: "SWITCH_MODE_SUCCESS",
      payload: {
        currentMode: data.currentMode,
        user: data.user,
      },
    });

    return { success: true, currentMode: data.currentMode };
  } catch (error) {
    const errorMessage = error.response?.data?.error || "Failed to switch mode";
    console.error("Switch mode error:", errorMessage);
    return { success: false, message: errorMessage };
  }
};
