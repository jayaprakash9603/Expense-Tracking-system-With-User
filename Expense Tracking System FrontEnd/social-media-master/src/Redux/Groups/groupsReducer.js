import {
  CREATE_GROUP_REQUEST,
  CREATE_GROUP_SUCCESS,
  CREATE_GROUP_FAILURE,
  FETCH_PENDING_INVITATIONS_REQUEST,
  FETCH_PENDING_INVITATIONS_SUCCESS,
  FETCH_PENDING_INVITATIONS_FAILURE,
  FETCH_GROUP_RECOMMENDATIONS_REQUEST,
  FETCH_GROUP_RECOMMENDATIONS_SUCCESS,
  FETCH_GROUP_RECOMMENDATIONS_FAILURE,
  FETCH_USER_GROUPS_REQUEST,
  FETCH_USER_GROUPS_SUCCESS,
  FETCH_USER_GROUPS_FAILURE,
  FETCH_ALL_GROUPS_REQUEST,
  FETCH_ALL_GROUPS_SUCCESS,
  FETCH_ALL_GROUPS_FAILURE,
} from "./groupsActionTypes";

const initialState = {
  creating: false,
  group: null,
  error: null,
  pendingInvitations: [],
  pendingInvitationsError: false,
  pendingInvitationsLoading: false,
  groupRecommendations: [],
  groupRecommendationsError: false,
  groupRecommendationsLoading: false,
  userGroups: [],
  userGroupsLoading: false,
  userGroupsError: null,
  allGroups: [],
  allGroupsLoading: false,
  allGroupsError: null,
};

const groupsReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_GROUP_REQUEST:
      return { ...state, creating: true, error: null };
    case CREATE_GROUP_SUCCESS:
      return { ...state, creating: false, group: action.payload };
    case CREATE_GROUP_FAILURE:
      return { ...state, creating: false, error: action.payload };
    case FETCH_USER_GROUPS_REQUEST:
      return { ...state, userGroupsLoading: true, userGroupsError: null };
    case FETCH_USER_GROUPS_SUCCESS:
      return { ...state, userGroupsLoading: false, userGroups: action.payload };
    case FETCH_ALL_GROUPS_REQUEST:
      return { ...state, allGroupsLoading: true, allGroupsError: null };
    case FETCH_ALL_GROUPS_SUCCESS:
      return { ...state, allGroupsLoading: false, allGroups: action.payload };
    case FETCH_ALL_GROUPS_FAILURE:
      return {
        ...state,
        allGroupsLoading: false,
        allGroupsError: action.payload,
      };
    case FETCH_USER_GROUPS_FAILURE:
      return {
        ...state,
        userGroupsLoading: false,
        userGroupsError: action.payload,
      };
    case FETCH_PENDING_INVITATIONS_REQUEST:
      return {
        ...state,
        pendingInvitationsLoading: true,
        pendingInvitationsError: false,
      };
    case FETCH_PENDING_INVITATIONS_SUCCESS:
      return {
        ...state,
        pendingInvitationsLoading: false,
        pendingInvitations: action.payload,
      };
    case FETCH_PENDING_INVITATIONS_FAILURE:
      return {
        ...state,
        pendingInvitationsLoading: false,
        pendingInvitationsError: action.payload,
      };
    case FETCH_GROUP_RECOMMENDATIONS_REQUEST:
      return {
        ...state,
        groupRecommendationsLoading: true,
        groupRecommendationsError: false,
      };
    case FETCH_GROUP_RECOMMENDATIONS_SUCCESS:
      return {
        ...state,
        groupRecommendationsLoading: false,
        groupRecommendations: action.payload,
      };
    case FETCH_GROUP_RECOMMENDATIONS_FAILURE:
      return {
        ...state,
        groupRecommendationsLoading: false,
        groupRecommendationsError: action.payload,
      };
    default:
      return state;
  }
};

export default groupsReducer;
