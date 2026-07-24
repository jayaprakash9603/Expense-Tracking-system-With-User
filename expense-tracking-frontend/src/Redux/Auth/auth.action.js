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
import { safeApiCall } from "../../utils/api/safeApiCall";
import isGracePeriodDeletionError from "../../features/settings/utils/accountDeletionErrors";
import {
  clearDeletionPendingSession,
  markDeletionPendingSession,
} from "../../features/settings/utils/accountDeletionSession";
import { normalizeUserProfile } from "../../utils/user/resolveUserProfileImage";

// Redirect helper function
const redirectToHome = (navigate) => {
  navigate("/");
};

// Load user dashboard preferences after login
const loadUserDashboardPreferences = async () => {
  const { data, error } = await safeApiCall(() =>
    api.get("/api/user/report-preferences/dashboard"),
  );

  if (error || !data?.layoutConfig) return false;

  localStorage.setItem("dashboard_layout_config", data.layoutConfig);
  return true;
};

const buildGracePeriodFallbackUser = (authMeta = {}) =>
  normalizeUserProfile({
    email: authMeta.email,
    deletionPending: true,
    accountStatus: authMeta.accountStatus || "DELETION_PENDING",
    deletionScheduledPurgeAt: authMeta.deletionScheduledPurgeAt,
    currentMode: authMeta.currentMode || "USER",
  });

const completeLoginWithJwt = async (dispatch, jwt, authMeta = {}) => {
  dispatch({ type: LOGIN_SUCCESS, payload: jwt });
  localStorage.setItem("jwt", jwt);

  if (authMeta.deletionPending) {
    markDeletionPendingSession();
    sessionStorage.removeItem("deletionWelcomeNoticeSeen");
    window.dispatchEvent(new Event("account-deletion-status-changed"));
  } else {
    clearDeletionPendingSession();
  }

  // Immediately fetch the user profile after login
  const profileResult = await dispatch(getProfileAction(jwt));
  updateAuthHeader();

  // Load user dashboard preferences (non-blocking)
  loadUserDashboardPreferences().catch(() => {});

  if (!profileResult?.success) {
    if (authMeta.deletionPending || isGracePeriodDeletionError(profileResult?.error)) {
      const fallbackUser = buildGracePeriodFallbackUser(authMeta);
      dispatch({ type: GET_PROFILE_SUCCESS, payload: fallbackUser });
      return {
        success: true,
        user: fallbackUser,
        currentMode: fallbackUser.currentMode,
        deletionPending: true,
      };
    }

    const message =
      profileResult?.error?.message || "Failed to load profile after login.";
    return { success: false, message };
  }

  const userProfile = profileResult.data;
  if (userProfile?.deletionPending) {
    markDeletionPendingSession();
  } else {
    clearDeletionPendingSession();
  }

  return {
    success: true,
    user: userProfile,
    currentMode: userProfile?.currentMode,
    role: userProfile?.role,
    deletionPending: authMeta.deletionPending || userProfile?.deletionPending,
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
    dispatch({ type: LOGIN_FAILURE, payload: errorMessage });
    return {
      success: false,
      message: errorMessage,
    };
  }

  // ==========================================================================
  // MFA Check (Priority over email 2FA)
  // ==========================================================================
  // If MFA (Google Authenticator) is enabled, user needs to verify TOTP.
  // MFA takes priority over email 2FA when both are enabled.
  if (data?.message === "MFA_REQUIRED" || data?.mfaRequired) {
    dispatch({ type: LOGIN_FAILURE, payload: "MFA_REQUIRED" });
    return {
      success: false,
      mfaRequired: true,
      mfaToken: data?.mfaToken,
      message: "MFA_REQUIRED",
      email: loginData?.data?.email,
    };
  }

  // ==========================================================================
  // Email 2FA Check
  // ==========================================================================
  // If email-based 2FA is enabled (and MFA is not), user needs to verify OTP.
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
    dispatch({ type: LOGIN_FAILURE, payload: errorMessage });
    return {
      success: false,
      message: errorMessage,
    };
  }

  return await completeLoginWithJwt(dispatch, data.jwt, {
    deletionPending: data.deletionPending,
    accountStatus: data.accountStatus,
    deletionScheduledPurgeAt: data.deletionScheduledPurgeAt,
    email: loginData?.data?.email,
  });
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

  return await completeLoginWithJwt(dispatch, data.jwt, {
    deletionPending: data.deletionPending,
    accountStatus: data.accountStatus,
    deletionScheduledPurgeAt: data.deletionScheduledPurgeAt,
    email: payload?.email,
  });
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
    dispatch({ type: LOGIN_FAILURE, payload: errorMessage });
    return {
      success: false,
      message: errorMessage,
    };
  }

  return await completeLoginWithJwt(dispatch, data.jwt, {
    deletionPending: data.deletionPending,
    accountStatus: data.accountStatus,
    deletionScheduledPurgeAt: data.deletionScheduledPurgeAt,
  });
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
    dispatch({ type: LOGIN_FAILURE, payload: message });
    return { success: false, message };
  }

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
    const status = error.status;
    const graceDeletion = status === 403 && isGracePeriodDeletionError(error);

    if (status === 401 || status === undefined || (status === 403 && !graceDeletion)) {
      localStorage.removeItem("jwt");
      clearDeletionPendingSession();
      dispatch({ type: LOGOUT });
    }

    dispatch({ type: GET_PROFILE_FAILURE, payload: error });
    return { success: false, error };
  }

  if (data?.deletionPending) {
    markDeletionPendingSession();
  } else {
    clearDeletionPendingSession();
  }

  dispatch({ type: GET_PROFILE_SUCCESS, payload: normalizeUserProfile(data) });
  return { success: true, data: normalizeUserProfile(data) };
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
    const updatedUser = normalizeUserProfile(data.user || data);
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
    return { success: false, message: errorMessage };
  }
};
