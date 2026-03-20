import { api, updateAuthHeader } from "@/config/api";
import { STORAGE_KEYS } from "@/config/constants";
import { safeApiCall } from "@/shared/utils/safeApiCall";
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  GET_PROFILE_REQUEST,
  GET_PROFILE_SUCCESS,
  GET_PROFILE_FAILURE,
  SWITCH_MODE_SUCCESS,
} from "./auth.actionTypes";

const completeLoginWithJwt = async (dispatch, jwt) => {
  dispatch({ type: LOGIN_SUCCESS, payload: jwt });
  localStorage.setItem(STORAGE_KEYS.JWT, jwt);

  const profileResult = await dispatch(getProfileAction(jwt));
  updateAuthHeader();

  if (!profileResult?.success) {
    return {
      success: false,
      message: profileResult?.error?.message || "Failed to load profile after login.",
    };
  }

  const userProfile = profileResult.data;
  return {
    success: true,
    user: userProfile,
    currentMode: userProfile?.currentMode,
    role: userProfile?.role,
  };
};

export const loginUserAction = (loginData) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });

  const { data, error } = await safeApiCall(() =>
    api.post("/auth/signin", loginData.data, { skipAuth: true }),
  );

  if (error) {
    const errorMessage = error.message || "Login failed. Please try again.";
    dispatch({ type: LOGIN_FAILURE, payload: errorMessage });
    return { success: false, message: errorMessage };
  }

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

  if (data?.message === "OTP_REQUIRED" || data?.twoFactorRequired) {
    dispatch({ type: LOGIN_FAILURE, payload: "OTP_REQUIRED" });
    return {
      success: false,
      twoFactorRequired: true,
      message: "OTP_REQUIRED",
      email: loginData?.data?.email,
    };
  }

  if (!data?.jwt) {
    dispatch({ type: LOGIN_FAILURE, payload: "Login failed. Please try again." });
    return { success: false, message: "Login failed. Please try again." };
  }

  return await completeLoginWithJwt(dispatch, data.jwt);
};

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

  dispatch({ type: LOGIN_SUCCESS, payload: null });
  return { success: true };
};

export const getProfileAction = (jwt) => async (dispatch) => {
  dispatch({ type: GET_PROFILE_REQUEST });

  const requestConfig = jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined;

  const { data, error } = await safeApiCall(() => api.get("/api/user/profile", requestConfig));

  if (error) {
    const status = error.status;
    if (status === 401 || status === 403 || status === undefined) {
      localStorage.removeItem(STORAGE_KEYS.JWT);
      dispatch({ type: LOGOUT });
    }
    dispatch({ type: GET_PROFILE_FAILURE, payload: error });
    return { success: false, error };
  }

  dispatch({ type: GET_PROFILE_SUCCESS, payload: data });
  return { success: true, data };
};

export const googleLoginAction = (googleData) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });

  const { data, error } = await safeApiCall(() =>
    api.post("/auth/oauth2/google", { credential: googleData.credential }, { skipAuth: true }),
  );

  if (error || !data?.jwt) {
    const errorMessage = error?.message || "Google authentication failed.";
    dispatch({ type: LOGIN_FAILURE, payload: errorMessage });
    return { success: false, message: errorMessage };
  }

  return await completeLoginWithJwt(dispatch, data.jwt);
};

export const verifyTwoFactorOtpAction = (payload) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });

  const { data, error } = await safeApiCall(() =>
    api.post("/auth/verify-login-otp", payload, { skipAuth: true }),
  );

  if (error || !data?.jwt) {
    const errorMessage = error?.message || data?.message || "OTP verification failed.";
    dispatch({ type: LOGIN_FAILURE, payload: errorMessage });
    return { success: false, message: errorMessage };
  }

  return await completeLoginWithJwt(dispatch, data.jwt);
};

export const logoutAction = () => (dispatch) => {
  localStorage.clear();
  dispatch({ type: LOGOUT });
  updateAuthHeader();
};

export const switchUserModeAction = (newMode) => async (dispatch) => {
  const { data, error } = await safeApiCall(() =>
    api.put("/api/user/switch-mode", null, {
      params: { mode: newMode },
    }),
  );

  if (error) {
    return { success: false, message: error.message || "Failed to switch user mode." };
  }

  const payloadUser = data?.user || null;
  const payloadMode = data?.currentMode || payloadUser?.currentMode || newMode;

  dispatch({
    type: SWITCH_MODE_SUCCESS,
    payload: {
      currentMode: payloadMode,
      user: payloadUser,
    },
  });

  return {
    success: true,
    currentMode: payloadMode,
    user: payloadUser,
  };
};
