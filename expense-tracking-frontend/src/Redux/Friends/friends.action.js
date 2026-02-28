import {
  FETCH_FRIENDSHIP_SUCCESS,
  FETCH_FRIENDSHIP_FAILURE,
} from "./friends.actionType";
import { api } from "../../config/api";

export const fetchFriendship = (friendshipId) => async (dispatch) => {
  try {
    const response = await api.get(`/api/friendships/${friendshipId}`);

    dispatch({
      type: FETCH_FRIENDSHIP_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_FRIENDSHIP_FAILURE,
      payload: error.message,
    });
  }
};
