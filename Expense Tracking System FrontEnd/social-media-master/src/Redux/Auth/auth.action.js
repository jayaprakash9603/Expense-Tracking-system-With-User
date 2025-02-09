import { useNavigate } from "react-router";
import { api, API_BASE_URL } from "../../config/api";
import {
  GET_PROFILE_FAILURE,
  GET_PROFILE_REQUEST,
  GET_PROFILE_SUCCESS,
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  UPDATE_PROFILE_FAILURE,
  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
} from "./auth.actionType";
import axios from "axios";

const redirectToHome = (navigate) => {
  navigate("/");
};
export const loginUserAction = (loginData) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/auth/signin`,
      loginData.data
    );

    if (data.token) {
      localStorage.setItem("jwt", data.token);
    }
    console.log("login success", data);
    dispatch({ type: LOGIN_SUCCESS, payload: data.jwt });
    return { success: true }; // Return success to trigger navigation in component
  } catch (error) {
    console.log("-------", error);
    dispatch({ type: LOGIN_FAILURE, payload: error });
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    }; // Return error message
  }
};

export const registerUserAction = (loginData) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/auth/signup`,
      loginData.data
    );

    if (data.token) {
      localStorage.setItem("jwt", data.token);
    }
    console.log("register success", data);
    dispatch({ type: LOGIN_SUCCESS, payload: data.jwt });
    return { success: true }; // Return success to trigger navigation in component
  } catch (error) {
    console.log("-------", error);
    dispatch({ type: LOGIN_FAILURE, payload: error });
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    }; // Return error message
  }
};

export const getProfileAction = (jwt) => async (dispatch) => {
  dispatch({ type: GET_PROFILE_REQUEST });
  try {
    const { data } = await axios.get(`${API_BASE_URL}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    console.log("User Profile", data);
    dispatch({ type: GET_PROFILE_SUCCESS, payload: data });
  } catch (error) {
    console.log("-------", error);
    dispatch({ type: GET_PROFILE_FAILURE, payload: error });
  }
};

export const updateProfileAction = (reqData) => async (dispatch) => {
  dispatch({ type: UPDATE_PROFILE_REQUEST });
  try {
    const token = localStorage.getItem("jwt");
    if (!token) {
      throw new Error("Authorization token is missing");
    }

    console.log("Request Data:", reqData); // Log the request data

    const { data } = await axios.put(`${API_BASE_URL}/api/users`, reqData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("User Profile Updated:", data);
    dispatch({ type: UPDATE_PROFILE_SUCCESS, payload: data });
  } catch (error) {
    console.log("------- Error Updating Profile:", error);
    dispatch({
      type: UPDATE_PROFILE_FAILURE,
      payload: error.response?.data || error.message,
    });
  }
};

export const logoutAction = () => (dispatch) => {
  localStorage.removeItem("jwt");

  dispatch({
    type: "LOGOUT",
  });
};
