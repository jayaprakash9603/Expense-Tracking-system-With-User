import { api, updateAuthHeader } from "@/config/api";
import { getAppConfig } from "@/config/runtime/parseAppConfig";
import { clearDemoStore } from "@/infrastructure/demo/store/demoStore";
import { setActiveJwt, clearActiveJwt } from "@/shared/utils/authStorage";
import { safeApiCall } from "@/shared/utils/network/safeApiCall";
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
import { normalizeAppMode } from "./normalizeAppMode";

const resolveProfileErrorKey = (profileResult) =>
  profileResult?.error || "auth.errors.profileLoadFailed";

const completeLoginWithJwt = async (dispatch, jwt) => {
  dispatch({ type: LOGIN_SUCCESS, payload: jwt });
  setActiveJwt(jwt);

  const profileResult = await dispatch(getProfileAction(jwt));
  updateAuthHeader();

  if (!profileResult?.success) {
    return {
      success: false,
      error: resolveProfileErrorKey(profileResult),
    };
  }

  const userProfile = profileResult.data;
  return {
    success: true,
    data: {
      user: userProfile,
      currentMode: userProfile?.currentMode,
      role: userProfile?.role,
    },
  };
};

export const loginUserAction = (loginData) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });

  const { data, error } = await safeApiCall(() =>
    api.post("/auth/signin", loginData.data, { skipAuth: true }),
  );

  if (error) {
    const errorKey = error.message || "auth.errors.loginFailed";
    dispatch({ type: LOGIN_FAILURE, payload: errorKey });
    return { success: false, error: errorKey };
  }

  if (data?.message === "MFA_REQUIRED" || data?.mfaRequired) {
    dispatch({ type: LOGIN_FAILURE, payload: "MFA_REQUIRED" });
    return {
      success: false,
      error: "MFA_REQUIRED",
      data: {
        mfaRequired: true,
        mfaToken: data?.mfaToken,
        email: loginData?.data?.email,
      },
    };
  }

  if (data?.message === "OTP_REQUIRED" || data?.twoFactorRequired) {
    dispatch({ type: LOGIN_FAILURE, payload: "OTP_REQUIRED" });
    return {
      success: false,
      error: "OTP_REQUIRED",
      data: {
        twoFactorRequired: true,
        email: loginData?.data?.email,
      },
    };
  }

  if (!data?.jwt) {
    dispatch({ type: LOGIN_FAILURE, payload: "auth.errors.loginFailed" });
    return { success: false, error: "auth.errors.loginFailed" };
  }

  return await completeLoginWithJwt(dispatch, data.jwt);
};

export const registerUserAction = (loginData) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });

  const { data, error } = await safeApiCall(() =>
    api.post("/auth/signup", loginData.data, { skipAuth: true }),
  );

  if (error) {
    const errKey = error.message || "auth.errors.registrationFailed";
    dispatch({ type: LOGIN_FAILURE, payload: errKey });
    return { success: false, error: errKey };
  }

  dispatch({ type: LOGIN_SUCCESS, payload: null });
  return { success: true, data: data ?? {} };
};

export const getProfileAction = (jwt) => async (dispatch) => {
  dispatch({ type: GET_PROFILE_REQUEST });

  const requestConfig = jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined;

  const { data, error } = await safeApiCall(() => api.get("/api/user/profile", requestConfig));

  if (error) {
    const status = error.status;
    if (status === 401 || status === 403 || status === undefined) {
      clearActiveJwt();
      dispatch({ type: LOGOUT });
    }
    dispatch({ type: GET_PROFILE_FAILURE, payload: error });
    return {
      success: false,
      error: error.message || "auth.errors.profileLoadFailed",
    };
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
    const errorKey = error?.message || "auth.errors.googleAuthFailed";
    dispatch({ type: LOGIN_FAILURE, payload: errorKey });
    return { success: false, error: errorKey };
  }

  return await completeLoginWithJwt(dispatch, data.jwt);
};

export const verifyTwoFactorOtpAction = (payload) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });

  const { data, error } = await safeApiCall(() =>
    api.post("/auth/verify-login-otp", payload, { skipAuth: true }),
  );

  if (error || !data?.jwt) {
    const errorKey = error?.message || data?.message || "auth.errors.otpVerificationFailed";
    dispatch({ type: LOGIN_FAILURE, payload: errorKey });
    return { success: false, error: errorKey };
  }

  return await completeLoginWithJwt(dispatch, data.jwt);
};

export const logoutAction = () => (dispatch) => {
  const { isDemo } = getAppConfig();
  clearActiveJwt();
  if (isDemo) clearDemoStore();
  else localStorage.clear();
  dispatch({ type: LOGOUT });
  updateAuthHeader();
};

export const switchUserModeAction = (newMode) => async (dispatch, getState) => {
  const target = normalizeAppMode(newMode);
  if (getAppConfig().isDemo) {
    const user = getState().auth?.user;
    const nextUser = user ? { ...user, currentMode: target } : null;
    dispatch({
      type: SWITCH_MODE_SUCCESS,
      payload: { currentMode: target, user: nextUser },
    });
    return {
      success: true,
      data: { currentMode: target, user: nextUser },
    };
  }

  const { data, error } = await safeApiCall(() =>
    api.put("/api/user/switch-mode", null, {
      params: { mode: target },
    }),
  );

  if (error) {
    return {
      success: false,
      error: error.message || "auth.errors.loginFailed",
    };
  }

  const prev = getState().auth?.user;
  const payloadUser = data?.user ?? null;
  const payloadMode = normalizeAppMode(
    data?.currentMode ?? payloadUser?.currentMode ?? target,
  );
  const user =
    payloadUser && prev
      ? { ...prev, ...payloadUser, currentMode: payloadMode }
      : payloadUser || prev;

  dispatch({
    type: SWITCH_MODE_SUCCESS,
    payload: {
      currentMode: payloadMode,
      user,
    },
  });

  return {
    success: true,
    data: {
      currentMode: payloadMode,
      user,
    },
  };
};
