/**
 * Story Redux Reducer
 * Manages story list state, viewing state, and WebSocket updates
 */
import { STORY_ACTION_TYPES } from "./story.actionTypes";

const initialState = {
  stories: [],
  totalCount: 0,
  unseenCount: 0,
  hasMore: false,
  loading: false,
  error: null,
  isViewerOpen: false,
  currentStoryIndex: 0,
  wsConnected: false,
  needsRefresh: false, // Flag to trigger story refetch from WebSocket REFRESH_STORIES event
};

const storyReducer = (state = initialState, action) => {
  switch (action.type) {
    case STORY_ACTION_TYPES.FETCH_STORIES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case STORY_ACTION_TYPES.FETCH_STORIES_SUCCESS:
      return {
        ...state,
        loading: false,
        stories: action.payload.stories || [],
        totalCount: action.payload.totalCount || 0,
        unseenCount: action.payload.unseenCount || 0,
        hasMore: action.payload.hasMore || false,
        error: null,
        needsRefresh: false, // Clear the refresh flag after successful fetch
      };

    case STORY_ACTION_TYPES.FETCH_STORIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case STORY_ACTION_TYPES.MARK_STORY_SEEN: {
      const storyToMark = state.stories.find(
        (story) => story.id === action.payload.storyId,
      );
      // Only decrement unseenCount if the story was previously unseen
      const wasUnseen = storyToMark && !storyToMark.seen;
      return {
        ...state,
        stories: state.stories.map((story) =>
          story.id === action.payload.storyId
            ? { ...story, seen: true, viewCount: (story.viewCount || 0) + 1 }
            : story,
        ),
        unseenCount: wasUnseen
          ? Math.max(0, state.unseenCount - 1)
          : state.unseenCount,
      };
    }

    case STORY_ACTION_TYPES.MARK_CTA_CLICKED:
      return {
        ...state,
        stories: state.stories.map((story) =>
          story.id === action.payload.storyId
            ? { ...story, ctaClicked: true }
            : story,
        ),
      };

    case STORY_ACTION_TYPES.DISMISS_STORY: {
      const storyToDismiss = state.stories.find(
        (story) => story.id === action.payload.storyId,
      );
      const wasUnseen = storyToDismiss && !storyToDismiss.seen;
      return {
        ...state,
        stories: state.stories.filter(
          (story) => story.id !== action.payload.storyId,
        ),
        totalCount: state.totalCount - 1,
        unseenCount: wasUnseen
          ? Math.max(0, state.unseenCount - 1)
          : state.unseenCount,
      };
    }

    case STORY_ACTION_TYPES.STORY_RECEIVED:
      if (state.stories.some((s) => s.id === action.payload.id)) {
        return state;
      }
      // Only increment unseenCount if the new story is not already marked as seen
      const isNewStoryUnseen = !action.payload.seen;
      return {
        ...state,
        stories: [action.payload, ...state.stories],
        totalCount: state.totalCount + 1,
        unseenCount: isNewStoryUnseen
          ? state.unseenCount + 1
          : state.unseenCount,
      };

    case STORY_ACTION_TYPES.STORY_UPDATED:
      return {
        ...state,
        stories: state.stories.map((story) =>
          story.id === action.payload.id
            ? { ...story, ...action.payload }
            : story,
        ),
      };

    case STORY_ACTION_TYPES.STORY_DELETED: {
      const storyToDelete = state.stories.find(
        (story) => story.id === action.payload.storyId,
      );
      const wasUnseen = storyToDelete && !storyToDelete.seen;
      return {
        ...state,
        stories: state.stories.filter(
          (story) => story.id !== action.payload.storyId,
        ),
        totalCount: Math.max(0, state.totalCount - 1),
        unseenCount: wasUnseen
          ? Math.max(0, state.unseenCount - 1)
          : state.unseenCount,
      };
    }

    case STORY_ACTION_TYPES.REFRESH_STORIES:
      return {
        ...state,
        needsRefresh: true, // Signal components to refetch stories
      };

    // Viewing state
    case STORY_ACTION_TYPES.SET_CURRENT_STORY_INDEX:
      return {
        ...state,
        currentStoryIndex: action.payload,
      };

    case STORY_ACTION_TYPES.OPEN_STORY_VIEWER:
      return {
        ...state,
        isViewerOpen: true,
        currentStoryIndex: action.payload.startIndex || 0,
      };

    case STORY_ACTION_TYPES.CLOSE_STORY_VIEWER:
      return {
        ...state,
        isViewerOpen: false,
      };

    case STORY_ACTION_TYPES.WS_CONNECTED:
      return {
        ...state,
        wsConnected: true,
      };

    case STORY_ACTION_TYPES.WS_DISCONNECTED:
      return {
        ...state,
        wsConnected: false,
      };

    default:
      return state;
  }
};

export default storyReducer;
