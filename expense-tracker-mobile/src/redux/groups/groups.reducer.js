import {
  FETCH_GROUPS_REQUEST,
  FETCH_GROUPS_SUCCESS,
  FETCH_GROUPS_FAILURE,
  FETCH_GROUP_BY_ID_REQUEST,
  FETCH_GROUP_BY_ID_SUCCESS,
  FETCH_GROUP_BY_ID_FAILURE,
  CREATE_GROUP_SUCCESS,
  LEAVE_GROUP_SUCCESS,
  FETCH_GROUP_INVITATIONS_REQUEST,
  FETCH_GROUP_INVITATIONS_SUCCESS,
  FETCH_GROUP_INVITATIONS_FAILURE,
  RESPOND_INVITATION_SUCCESS,
  CLEAR_GROUP_ERROR,
  RESET_GROUP_STATE,
} from "./groups.actionTypes";

const initialState = {
  list: [],
  current: null,
  invitations: [],
  loading: false,
  error: null,
};

export const groupsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_GROUPS_REQUEST:
    case FETCH_GROUP_BY_ID_REQUEST:
    case FETCH_GROUP_INVITATIONS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_GROUPS_SUCCESS:
      return {
        ...state,
        loading: false,
        list: Array.isArray(action.payload) ? action.payload : [],
      };
    case FETCH_GROUP_BY_ID_SUCCESS:
      return { ...state, loading: false, current: action.payload };
    case FETCH_GROUP_INVITATIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        invitations: Array.isArray(action.payload) ? action.payload : [],
      };
    case FETCH_GROUPS_FAILURE:
    case FETCH_GROUP_BY_ID_FAILURE:
    case FETCH_GROUP_INVITATIONS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case CREATE_GROUP_SUCCESS:
      return { ...state, list: [...state.list, action.payload] };
    case LEAVE_GROUP_SUCCESS:
      return {
        ...state,
        list: state.list.filter((g) => g.id !== action.payload),
        current: state.current?.id === action.payload ? null : state.current,
      };
    case RESPOND_INVITATION_SUCCESS:
      return {
        ...state,
        invitations: state.invitations.filter((i) => i.id !== action.payload),
      };
    case CLEAR_GROUP_ERROR:
      return { ...state, error: null };
    case RESET_GROUP_STATE:
      return { ...initialState };
    default:
      return state;
  }
};
