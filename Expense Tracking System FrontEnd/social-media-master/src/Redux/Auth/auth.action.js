import { useNavigate } from "react-router";
import { api, updateAuthHeader } from "../../config/api";
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
import { safeApiCall } from "../../utils/safeApiCall";

// Redirect helper function
const redirectToHome = (navigate) => {
  navigate("/");
};

// Load user dashboard preferences after login
const loadUserDashboardPreferences = async () => {
  const { data, error } = await safeApiCall(() =>
    api.get("/api/user/dashboard-preferences"),
  );

  if (error || !data?.layoutConfig) {
    if (error?.message) {
      console.log("Could not load dashboard preferences:", error.message);
    }
    return false;
  }

  localStorage.setItem("dashboard_layout_config", data.layoutConfig);
  console.log(
    "Dashboard preferences loaded:",
    data.id ? "custom layout" : "default layout",
  );
  return true;
};

const completeLoginWithJwt = async (dispatch, jwt) => {
  dispatch({ type: LOGIN_SUCCESS, payload: jwt });
  localStorage.setItem("jwt", jwt);

  // Immediately fetch the user profile after login
  const profileResult = await dispatch(getProfileAction(jwt));
  updateAuthHeader();

  // Load user dashboard preferences (non-blocking)
  loadUserDashboardPreferences().catch((err) =>
    console.log("Failed to load dashboard preferences:", err),
  );

  if (!profileResult?.success) {
    const message =
      profileResult?.error?.message || "Failed to load profile after login.";
    console.log("Profile load error:", message);
    return { success: false, message };
  }

  const userProfile = profileResult.data;

  return {
    success: true,
    user: userProfile,
    currentMode: userProfile?.currentMode,
    role: userProfile?.role,
  };
};

// Login User Action
export const loginUserAction = (loginData) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });

  const { data, error } = await safeApiCall(() =>
    api.post("/auth/signin", loginData.data, { skipAuth: true }),
  );

  if (error) {
    const errorMessage = error?.message || "Login failed. Please try again.";
    console.log("Login error:", errorMessage);
    dispatch({ type: LOGIN_FAILURE, payload: errorMessage });
    return {
      success: false,
      message: errorMessage,
    };
  }

  if (data?.message === "OTP_REQUIRED" || data?.twoFactorRequired) {
    // 2FA enabled: OTP has been sent and JWT will be issued after verification
    dispatch({ type: LOGIN_FAILURE, payload: "OTP_REQUIRED" });
    return {
      success: false,
      twoFactorRequired: true,
      message: "OTP_REQUIRED",
      email: loginData?.data?.email,
    };
  }

  if (!data?.jwt) {
    const errorMessage = "Login failed. Please try again.";
    console.log("Login error:", errorMessage);
    dispatch({ type: LOGIN_FAILURE, payload: errorMessage });
    return {
      success: false,
      message: errorMessage,
    };
  }

  return await completeLoginWithJwt(dispatch, data.jwt);
};

export const verifyTwoFactorOtpAction = (payload) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });

  const { data, error } = await safeApiCall(() =>
    api.post("/auth/verify-login-otp", payload, { skipAuth: true }),
  );

  if (error || !data?.jwt) {
    const errorMessage =
      error?.message || data?.message || "OTP verification failed.";
    dispatch({ type: LOGIN_FAILURE, payload: errorMessage });
    return { success: false, message: errorMessage };
  }

  return await completeLoginWithJwt(dispatch, data.jwt);
};

// Google OAuth Login Action
export const googleLoginAction = (googleData) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });

  const { data, error } = await safeApiCall(() =>
    api.post(
      "/auth/oauth2/google",
      { credential: googleData.credential },
      { skipAuth: true },
    ),
  );

  if (error || !data?.jwt) {
    const errorMessage =
      error?.message || "Google authentication failed. Please try again.";
    console.log("Google login error:", errorMessage);
    dispatch({ type: LOGIN_FAILURE, payload: errorMessage });
    return {
      success: false,
      message: errorMessage,
    };
  }

  dispatch({ type: LOGIN_SUCCESS, payload: data.jwt });
  localStorage.setItem("jwt", data.jwt);

  // Fetch the user profile after Google authentication
  const profileResult = await dispatch(getProfileAction(data.jwt));
  updateAuthHeader();

  // Load user dashboard preferences (non-blocking)
  loadUserDashboardPreferences().catch((err) =>
    console.log("Failed to load dashboard preferences:", err),
  );

  if (!profileResult?.success) {
    const message =
      profileResult?.error?.message ||
      "Failed to load profile after Google login.";
    console.log("Profile load error:", message);
    return { success: false, message };
  }

  const userProfile = profileResult.data;

  return {
    success: true,
    user: userProfile,
    currentMode: userProfile?.currentMode,
    role: userProfile?.role,
  };
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

      const { data, error } = await safeApiCall(() =>
        api.post(CLOUDINARY_UPLOAD_URL, uploadData, {
          skipAuth: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }),
      );

      if (error) {
        throw new Error(
          error.message || "Image upload failed. Please try again.",
        );
      }

      dispatch({
        type: UPLOAD_TO_CLOUDINARY_SUCCESS,
        payload: data?.secure_url,
      });
    } catch (error) {
      const message = error?.message || "Image upload failed";
      dispatch({
        type: UPLOAD_TO_CLOUDINARY_FAILURE,
        payload: message,
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
  const { data, error } = await safeApiCall(() =>
    api.post("/auth/signup", loginData.data, { skipAuth: true }),
  );

  if (error) {
    const message = error.message || "Registration failed.";
    console.log("Register error:", message);
    dispatch({ type: LOGIN_FAILURE, payload: message });
    return { success: false, message };
  }

  console.log("Register response data:", data);
  // Do NOT store token or mark as logged in; require explicit login afterwards
  dispatch({ type: LOGIN_SUCCESS, payload: null });
  return { success: true };
};

// Get Profile Action
export const getProfileAction = (jwt) => async (dispatch) => {
  dispatch({ type: GET_PROFILE_REQUEST });

  const requestConfig = jwt
    ? {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    : undefined;

  const { data, error } = await safeApiCall(() =>
    api.get(`/api/user/profile`, requestConfig),
  );

  if (error) {
    console.error("Get profile error:", error);
    const status = error.status;
    if (status === 401 || status === 403 || status === undefined) {
      console.log("Invalid or expired token, clearing JWT and logging out");
      localStorage.removeItem("jwt");
      dispatch({ type: LOGOUT });
    }

    dispatch({ type: GET_PROFILE_FAILURE, payload: error });
    return { success: false, error };
  }

  dispatch({ type: GET_PROFILE_SUCCESS, payload: data });
  return { success: true, data };
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
      },
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
