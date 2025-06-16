import {
  FETCH_FRIEND_SUGGESTIONS_REQUEST,
  FETCH_FRIEND_SUGGESTIONS_SUCCESS,
  FETCH_FRIEND_SUGGESTIONS_FAILURE,
  SEND_FRIEND_REQUEST_REQUEST,
  SEND_FRIEND_REQUEST_SUCCESS,
  SEND_FRIEND_REQUEST_FAILURE,
  FETCH_FRIEND_REQUESTS_REQUEST,
  FETCH_FRIEND_REQUESTS_SUCCESS,
  FETCH_FRIEND_REQUESTS_FAILURE,
  RESPOND_TO_FRIEND_REQUEST_REQUEST,
  RESPOND_TO_FRIEND_REQUEST_SUCCESS,
  RESPOND_TO_FRIEND_REQUEST_FAILURE,
  ADD_NEW_FRIEND_REQUEST,
  REMOVE_FRIEND_REQUEST,
  FETCH_FRIENDS_REQUEST,
  FETCH_FRIENDS_SUCCESS,
  FETCH_FRIENDS_FAILURE,
  SET_ACCESS_LEVEL_REQUEST,
  SET_ACCESS_LEVEL_SUCCESS,
  SET_ACCESS_LEVEL_FAILURE,
  FETCH_I_SHARED_WITH_REQUEST,
  FETCH_I_SHARED_WITH_SUCCESS,
  FETCH_I_SHARED_WITH_FAILURE,
  FETCH_SHARED_WITH_ME_REQUEST,
  FETCH_SHARED_WITH_ME_SUCCESS,
  FETCH_SHARED_WITH_ME_FAILURE,
  FETCH_FRIENDS_EXPENSES_SUCCESS,
  FETCH_FRIENDS_EXPENSES_FAILURE,
  FETCH_FRIENDSHIP_SUCCESS,
  FETCH_FRIENDSHIP_FAILURE,
} from "./friendsActionTypes";

const initialState = {
  // Friend suggestions
  suggestions: [],
  loading: false,
  error: null,

  // Send friend request
  sendingRequest: false,
  sentRequests: [], // IDs of users to whom requests have been sent
  sendRequestError: null,

  // Friend requests
  friendRequests: [],
  loadingRequests: false,
  requestsError: null,

  // Respond to friend request
  respondingToRequest: false,
  respondToRequestError: null,

  // Friends
  friends: [],
  loadingFriends: false,
  friendsError: null,

  // Access level
  settingAccessLevel: false,
  setAccessLevelError: null,

  // Shared expenses - users I've shared with
  iSharedWith: [],
  loadingISharedWith: false,
  iSharedWithError: null,

  // Shared expenses - users who shared with me
  sharedWithMe: [],
  loadingSharedWithMe: false,
  sharedWithMeError: null,

  // Friends' expenses
  friendsExpenses: [],
  friendsExpensesError: null,

  friendship: null,
  friendshipError: null,
};

const friendsReducer = (state = initialState, action) => {
  switch (action.type) {
    // Friend suggestions cases
    case FETCH_FRIEND_SUGGESTIONS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_FRIEND_SUGGESTIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        suggestions: action.payload,
      };

    case FETCH_FRIEND_SUGGESTIONS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Send friend request cases
    case SEND_FRIEND_REQUEST_REQUEST:
      return {
        ...state,
        sendingRequest: true,
        sendRequestError: null,
      };

    case SEND_FRIEND_REQUEST_SUCCESS:
      return {
        ...state,
        sendingRequest: false,
        sentRequests: [...state.sentRequests, action.payload.recipientId],
        // Remove the user from suggestions
        suggestions: state.suggestions.filter(
          (user) => user.id !== action.payload.recipientId
        ),
      };

    case SEND_FRIEND_REQUEST_FAILURE:
      return {
        ...state,
        sendingRequest: false,
        sendRequestError: action.payload,
      };

    case FETCH_FRIENDSHIP_SUCCESS:
      return {
        ...state,
        friendship: action.payload,
        friendshipError: null,
      };
    case FETCH_FRIENDSHIP_FAILURE:
      return {
        ...state,
        friendship: null,
        friendshipError: action.payload,
      };
    // Friend requests cases
    case FETCH_FRIEND_REQUESTS_REQUEST:
      return {
        ...state,
        loadingRequests: true,
        requestsError: null,
      };

    case FETCH_FRIEND_REQUESTS_SUCCESS:
      return {
        ...state,
        loadingRequests: false,
        friendRequests: action.payload,
      };

    case FETCH_FRIEND_REQUESTS_FAILURE:
      return {
        ...state,
        loadingRequests: false,
        requestsError: action.payload,
      };

    // Respond to friend request cases
    case RESPOND_TO_FRIEND_REQUEST_REQUEST:
      return {
        ...state,
        respondingToRequest: true,
        respondToRequestError: null,
      };

    case RESPOND_TO_FRIEND_REQUEST_SUCCESS:
      return {
        ...state,
        respondingToRequest: false,
        // Remove the request from the list
        friendRequests: state.friendRequests.filter(
          (request) => request.id !== action.payload.friendshipId
        ),
      };

    case RESPOND_TO_FRIEND_REQUEST_FAILURE:
      return {
        ...state,
        respondingToRequest: false,
        respondToRequestError: action.payload,
      };

    // Add new friend request (for real-time updates)
    case ADD_NEW_FRIEND_REQUEST:
      // Check if the request is already in the list to avoid duplicates
      const exists = state.friendRequests.some(
        (request) => request.id === action.payload.id
      );

      if (exists) {
        return state;
      }

      return {
        ...state,
        friendRequests: [...state.friendRequests, action.payload],
      };

    case REMOVE_FRIEND_REQUEST:
      return {
        ...state,
        friendRequests: state.friendRequests.filter(
          (request) => request.id !== action.payload
        ),
      };

    // Friends cases
    case FETCH_FRIENDS_REQUEST:
      return {
        ...state,
        loadingFriends: true,
        friendsError: null,
      };

    case FETCH_FRIENDS_SUCCESS:
      return {
        ...state,
        loadingFriends: false,
        friends: action.payload,
      };

    case FETCH_FRIENDS_FAILURE:
      return {
        ...state,
        loadingFriends: false,
        friendsError: action.payload,
      };

    // Access level cases
    case SET_ACCESS_LEVEL_REQUEST:
      return {
        ...state,
        settingAccessLevel: true,
        setAccessLevelError: null,
      };

    case SET_ACCESS_LEVEL_SUCCESS:
      return {
        ...state,
        settingAccessLevel: false,
        // Update the friendship in the friends list with the new access level
        friends: state.friends.map((friendship) =>
          friendship.id === action.payload.friendshipId
            ? { ...friendship, ...action.payload.friendship }
            : friendship
        ),
      };

    case SET_ACCESS_LEVEL_FAILURE:
      return {
        ...state,
        settingAccessLevel: false,
        setAccessLevelError: action.payload,
      };

    // I Shared With cases
    case FETCH_I_SHARED_WITH_REQUEST:
      return {
        ...state,
        loadingISharedWith: true,
        iSharedWithError: null,
      };

    case FETCH_I_SHARED_WITH_SUCCESS:
      return {
        ...state,
        iSharedWith: action.payload,
        loadingISharedWith: false,
      };

    case FETCH_I_SHARED_WITH_FAILURE:
      return {
        ...state,
        loadingISharedWith: false,
        iSharedWithError: action.payload,
      };

    // Shared With Me cases
    case FETCH_SHARED_WITH_ME_REQUEST:
      return {
        ...state,
        loadingSharedWithMe: true,
        sharedWithMeError: null,
      };

    case FETCH_SHARED_WITH_ME_SUCCESS:
      return {
        ...state,
        sharedWithMe: action.payload,
        loadingSharedWithMe: false,
      };

    case FETCH_SHARED_WITH_ME_FAILURE:
      return {
        ...state,
        loadingSharedWithMe: false,
        sharedWithMeError: action.payload,
      };

    // Friends' expenses cases
    case FETCH_FRIENDS_EXPENSES_SUCCESS:
      return {
        ...state,
        friendsExpenses: action.payload,
        friendsExpensesError: null,
      };

    case FETCH_FRIENDS_EXPENSES_FAILURE:
      return {
        ...state,
        friendsExpensesError: action.payload,
      };

    default:
      return state;
  }
};

export default friendsReducer;
