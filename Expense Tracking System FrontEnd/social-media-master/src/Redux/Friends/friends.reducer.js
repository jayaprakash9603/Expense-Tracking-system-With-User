import {
  FETCH_FRIENDSHIP_SUCCESS,
  FETCH_FRIENDSHIP_FAILURE,
} from "./friends.actionType";

const initialState = {
  friendship: null,
  error: null,
};

const friendsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_FRIENDSHIP_SUCCESS:
      return {
        ...state,
        friendship: action.payload,
        error: null,
      };
    case FETCH_FRIENDSHIP_FAILURE:
      return {
        ...state,
        friendship: null,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default friendsReducer;
