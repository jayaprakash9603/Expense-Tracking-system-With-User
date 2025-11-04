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
  CANCEL_FRIEND_REQUEST_REQUEST,
  CANCEL_FRIEND_REQUEST_SUCCESS,
  CANCEL_FRIEND_REQUEST_FAILURE,
  REMOVE_FRIENDSHIP_REQUEST,
  REMOVE_FRIENDSHIP_SUCCESS,
  REMOVE_FRIENDSHIP_FAILURE,
  BLOCK_USER_REQUEST,
  BLOCK_USER_SUCCESS,
  BLOCK_USER_FAILURE,
  UNBLOCK_USER_REQUEST,
  UNBLOCK_USER_SUCCESS,
  UNBLOCK_USER_FAILURE,
  FETCH_BLOCKED_USERS_REQUEST,
  FETCH_BLOCKED_USERS_SUCCESS,
  FETCH_BLOCKED_USERS_FAILURE,
  FETCH_FRIENDSHIP_STATS_REQUEST,
  FETCH_FRIENDSHIP_STATS_SUCCESS,
  FETCH_FRIENDSHIP_STATS_FAILURE,
  FETCH_MUTUAL_FRIENDS_REQUEST,
  FETCH_MUTUAL_FRIENDS_SUCCESS,
  FETCH_MUTUAL_FRIENDS_FAILURE,
  SEARCH_FRIENDS_REQUEST,
  SEARCH_FRIENDS_SUCCESS,
  SEARCH_FRIENDS_FAILURE,
  FETCH_OUTGOING_REQUESTS_REQUEST,
  FETCH_OUTGOING_REQUESTS_SUCCESS,
  FETCH_OUTGOING_REQUESTS_FAILURE,
  FETCH_EXPENSE_SHARING_SUMMARY_REQUEST,
  FETCH_EXPENSE_SHARING_SUMMARY_SUCCESS,
  FETCH_EXPENSE_SHARING_SUMMARY_FAILURE,
  QUICK_SHARE_EXPENSES_REQUEST,
  QUICK_SHARE_EXPENSES_SUCCESS,
  QUICK_SHARE_EXPENSES_FAILURE,
  BATCH_SHARE_EXPENSES_REQUEST,
  BATCH_SHARE_EXPENSES_SUCCESS,
  BATCH_SHARE_EXPENSES_FAILURE,
  FETCH_RECOMMENDED_TO_SHARE_REQUEST,
  FETCH_RECOMMENDED_TO_SHARE_SUCCESS,
  FETCH_RECOMMENDED_TO_SHARE_FAILURE,
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

  // Blocked users
  blockedUsers: [],
  loadingBlockedUsers: false,
  blockedUsersError: null,
  blockingUser: false,
  unblockingUser: false,

  // Friendship stats
  friendshipStats: null,
  loadingFriendshipStats: false,
  friendshipStatsError: null,

  // Mutual friends
  mutualFriends: {},
  loadingMutualFriends: false,
  mutualFriendsError: null,

  // Search friends
  searchResults: [],
  searchingFriends: false,
  searchFriendsError: null,

  // Outgoing requests
  outgoingRequests: [],
  loadingOutgoingRequests: false,
  outgoingRequestsError: null,

  // Expense sharing summary
  expenseSharingSummary: null,
  loadingExpenseSharingSummary: false,
  expenseSharingSummaryError: null,

  // Quick share
  quickSharingExpenses: false,
  quickShareError: null,

  // Batch share
  batchSharingExpenses: false,
  batchShareError: null,

  // Recommended to share
  recommendedToShare: [],
  loadingRecommendedToShare: false,
  recommendedToShareError: null,

  // Cancel/Remove operations
  cancellingRequest: false,
  removingFriendship: false,
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
        friendRequests: state.friendRequests.filter(
          (request) => request.id !== action.payload.friendshipId
        ),
        // Add the new friend to the friends list if accepted
        friends: action.payload.accept
          ? [...state.friends, action.payload.response]
          : state.friends,
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

    // Cancel friend request cases
    case CANCEL_FRIEND_REQUEST_REQUEST:
      return {
        ...state,
        cancellingRequest: true,
      };

    case CANCEL_FRIEND_REQUEST_SUCCESS:
      return {
        ...state,
        cancellingRequest: false,
        friendRequests: state.friendRequests.filter(
          (request) => request.id !== action.payload
        ),
        outgoingRequests: state.outgoingRequests.filter(
          (request) => request.id !== action.payload
        ),
      };

    case CANCEL_FRIEND_REQUEST_FAILURE:
      return {
        ...state,
        cancellingRequest: false,
        error: action.payload,
      };

    // Remove friendship cases
    case REMOVE_FRIENDSHIP_REQUEST:
      return {
        ...state,
        removingFriendship: true,
      };

    case REMOVE_FRIENDSHIP_SUCCESS:
      return {
        ...state,
        removingFriendship: false,
        friends: state.friends.filter(
          (friend) =>
            friend.friendshipId !== action.payload &&
            friend.id !== action.payload
        ),
      };

    case REMOVE_FRIENDSHIP_FAILURE:
      return {
        ...state,
        removingFriendship: false,
        error: action.payload,
      };

    // Block user cases
    case BLOCK_USER_REQUEST:
      return {
        ...state,
        blockingUser: true,
      };

    case BLOCK_USER_SUCCESS:
      return {
        ...state,
        blockingUser: false,
        friends: state.friends.filter(
          (friend) => friend.userId !== action.payload
        ),
      };

    case BLOCK_USER_FAILURE:
      return {
        ...state,
        blockingUser: false,
        error: action.payload,
      };

    // Unblock user cases
    case UNBLOCK_USER_REQUEST:
      return {
        ...state,
        unblockingUser: true,
      };

    case UNBLOCK_USER_SUCCESS:
      return {
        ...state,
        unblockingUser: false,
        blockedUsers: state.blockedUsers.filter(
          (user) => user.id !== action.payload
        ),
      };

    case UNBLOCK_USER_FAILURE:
      return {
        ...state,
        unblockingUser: false,
        error: action.payload,
      };

    // Blocked users cases
    case FETCH_BLOCKED_USERS_REQUEST:
      return {
        ...state,
        loadingBlockedUsers: true,
        blockedUsersError: null,
      };

    case FETCH_BLOCKED_USERS_SUCCESS:
      return {
        ...state,
        loadingBlockedUsers: false,
        blockedUsers: action.payload,
      };

    case FETCH_BLOCKED_USERS_FAILURE:
      return {
        ...state,
        loadingBlockedUsers: false,
        blockedUsersError: action.payload,
      };

    // Friendship stats cases
    case FETCH_FRIENDSHIP_STATS_REQUEST:
      return {
        ...state,
        loadingFriendshipStats: true,
        friendshipStatsError: null,
      };

    case FETCH_FRIENDSHIP_STATS_SUCCESS:
      return {
        ...state,
        loadingFriendshipStats: false,
        friendshipStats: action.payload,
      };

    case FETCH_FRIENDSHIP_STATS_FAILURE:
      return {
        ...state,
        loadingFriendshipStats: false,
        friendshipStatsError: action.payload,
      };

    // Mutual friends cases
    case FETCH_MUTUAL_FRIENDS_REQUEST:
      return {
        ...state,
        loadingMutualFriends: true,
        mutualFriendsError: null,
      };

    case FETCH_MUTUAL_FRIENDS_SUCCESS:
      return {
        ...state,
        loadingMutualFriends: false,
        mutualFriends: {
          ...state.mutualFriends,
          [action.payload.userId]: action.payload.mutualFriends,
        },
      };

    case FETCH_MUTUAL_FRIENDS_FAILURE:
      return {
        ...state,
        loadingMutualFriends: false,
        mutualFriendsError: action.payload,
      };

    // Search friends cases
    case SEARCH_FRIENDS_REQUEST:
      return {
        ...state,
        searchingFriends: true,
        searchFriendsError: null,
      };

    case SEARCH_FRIENDS_SUCCESS:
      return {
        ...state,
        searchingFriends: false,
        searchResults: action.payload,
      };

    case SEARCH_FRIENDS_FAILURE:
      return {
        ...state,
        searchingFriends: false,
        searchFriendsError: action.payload,
      };

    // Outgoing requests cases
    case FETCH_OUTGOING_REQUESTS_REQUEST:
      return {
        ...state,
        loadingOutgoingRequests: true,
        outgoingRequestsError: null,
      };

    case FETCH_OUTGOING_REQUESTS_SUCCESS:
      return {
        ...state,
        loadingOutgoingRequests: false,
        outgoingRequests: action.payload,
      };

    case FETCH_OUTGOING_REQUESTS_FAILURE:
      return {
        ...state,
        loadingOutgoingRequests: false,
        outgoingRequestsError: action.payload,
      };

    // Expense sharing summary cases
    case FETCH_EXPENSE_SHARING_SUMMARY_REQUEST:
      return {
        ...state,
        loadingExpenseSharingSummary: true,
        expenseSharingSummaryError: null,
      };

    case FETCH_EXPENSE_SHARING_SUMMARY_SUCCESS:
      return {
        ...state,
        loadingExpenseSharingSummary: false,
        expenseSharingSummary: action.payload,
      };

    case FETCH_EXPENSE_SHARING_SUMMARY_FAILURE:
      return {
        ...state,
        loadingExpenseSharingSummary: false,
        expenseSharingSummaryError: action.payload,
      };

    // Quick share expenses cases
    case QUICK_SHARE_EXPENSES_REQUEST:
      return {
        ...state,
        quickSharingExpenses: true,
        quickShareError: null,
      };

    case QUICK_SHARE_EXPENSES_SUCCESS:
      return {
        ...state,
        quickSharingExpenses: false,
      };

    case QUICK_SHARE_EXPENSES_FAILURE:
      return {
        ...state,
        quickSharingExpenses: false,
        quickShareError: action.payload,
      };

    // Batch share expenses cases
    case BATCH_SHARE_EXPENSES_REQUEST:
      return {
        ...state,
        batchSharingExpenses: true,
        batchShareError: null,
      };

    case BATCH_SHARE_EXPENSES_SUCCESS:
      return {
        ...state,
        batchSharingExpenses: false,
      };

    case BATCH_SHARE_EXPENSES_FAILURE:
      return {
        ...state,
        batchSharingExpenses: false,
        batchShareError: action.payload,
      };

    // Recommended to share cases
    case FETCH_RECOMMENDED_TO_SHARE_REQUEST:
      return {
        ...state,
        loadingRecommendedToShare: true,
        recommendedToShareError: null,
      };

    case FETCH_RECOMMENDED_TO_SHARE_SUCCESS:
      return {
        ...state,
        loadingRecommendedToShare: false,
        recommendedToShare: action.payload,
      };

    case FETCH_RECOMMENDED_TO_SHARE_FAILURE:
      return {
        ...state,
        loadingRecommendedToShare: false,
        recommendedToShareError: action.payload,
      };

    default:
      return state;
  }
};

export default friendsReducer;
