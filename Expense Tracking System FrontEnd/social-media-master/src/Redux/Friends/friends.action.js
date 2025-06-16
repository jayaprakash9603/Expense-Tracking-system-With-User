import axios from "axios";
import {
  FETCH_FRIENDSHIP_SUCCESS,
  FETCH_FRIENDSHIP_FAILURE,
} from "./friends.actionType";

export const fetchFriendship = (friendshipId) => async (dispatch) => {
  try {
    const response = await axios.get(
      `http://localhost:8080/api/friendships/${friendshipId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      }
    );

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
