import {
  INVITE_FRIEND_TO_GROUP_REQUEST,
  INVITE_FRIEND_TO_GROUP_SUCCESS,
  INVITE_FRIEND_TO_GROUP_FAILURE,
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
  GET_GROUP_BY_ID_REQUEST,
  GET_GROUP_BY_ID_SUCCESS,
  GET_GROUP_BY_ID_FAILURE,
  FETCH_FRIENDS_NOT_IN_GROUP_REQUEST,
  FETCH_FRIENDS_NOT_IN_GROUP_SUCCESS,
  FETCH_FRIENDS_NOT_IN_GROUP_FAILURE,
  FETCH_SENT_INVITATIONS_REQUEST,
  FETCH_SENT_INVITATIONS_SUCCESS,
  FETCH_SENT_INVITATIONS_FAILURE,
  CANCEL_INVITATION_REQUEST,
  CANCEL_INVITATION_SUCCESS,
  CANCEL_INVITATION_FAILURE,
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
  currentGroup: null,
  groupDataError: false,
  groupDataLoading: false,
  inviteFriends: [],
  inviteFriendsError: false,
  inviteFriendsLoading: false,
  invitingFriend: false,
  inviteFriendSuccess: null,
  inviteFriendError: null,
  sentInvitations: [],
  sentInvitationsLoading: false,
  sentInvitationsError: null,
  cancelInvitationLoading: false,
  cancelInvitationError: null,
  sentInvitations: [],
};

const groupsReducer = (state = initialState, action) => {
  switch (action.type) {
    case CANCEL_INVITATION_REQUEST:
      return {
        ...state,
        cancelInvitationLoading: true,
        cancelInvitationError: null,
      };
    case CANCEL_INVITATION_SUCCESS:
      return {
        ...state,
        cancelInvitationLoading: false,
        sentInvitations: state.sentInvitations.filter(
          (invite) => invite.invitationId !== action.payload.invitationId
        ),
      };
    case CANCEL_INVITATION_FAILURE:
      return {
        ...state,
        cancelInvitationLoading: false,
        cancelInvitationError: action.payload,
      };
    case FETCH_SENT_INVITATIONS_REQUEST:
      return {
        ...state,
        sentInvitationsLoading: true,
        sentInvitationsError: null,
      };
    case FETCH_SENT_INVITATIONS_SUCCESS:
      return {
        ...state,
        sentInvitationsLoading: false,
        sentInvitations: action.payload,
      };
    case FETCH_SENT_INVITATIONS_FAILURE:
      return {
        ...state,
        sentInvitationsLoading: false,
        sentInvitationsError: action.payload,
      };
    case INVITE_FRIEND_TO_GROUP_REQUEST:
      return {
        ...state,
        invitingFriend: true,
        inviteFriendSuccess: null,
        inviteFriendError: null,
      };
    case INVITE_FRIEND_TO_GROUP_SUCCESS:
      return {
        ...state,
        invitingFriend: false,
        inviteFriendSuccess: action.payload,
        inviteFriendError: null,
      };
    case INVITE_FRIEND_TO_GROUP_FAILURE:
      return {
        ...state,
        invitingFriend: false,
        inviteFriendError: action.payload,
      };
    case CREATE_GROUP_REQUEST:
      return { ...state, creating: true, error: null };
    case FETCH_FRIENDS_NOT_IN_GROUP_REQUEST:
      return {
        ...state,
        inviteFriendsLoading: true,
        inviteFriendsError: false,
      };
    case FETCH_FRIENDS_NOT_IN_GROUP_SUCCESS:
      return {
        ...state,
        inviteFriends: action.payload,
        inviteFriendsLoading: false,
        inviteFriendsError: false,
      };
    case FETCH_FRIENDS_NOT_IN_GROUP_FAILURE:
      return {
        ...state,
        inviteFriendsLoading: false,
        inviteFriendsError: action.payload,
      };
    case GET_GROUP_BY_ID_REQUEST:
      return { ...state, groupDataLoading: true, groupDataError: false };
    case GET_GROUP_BY_ID_SUCCESS:
      return {
        ...state,
        groupDataLoading: false,
        currentGroup: action.payload,
      };
    case GET_GROUP_BY_ID_FAILURE:
      return {
        ...state,
        groupDataLoading: false,
        groupDataError: action.payload,
      };
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
