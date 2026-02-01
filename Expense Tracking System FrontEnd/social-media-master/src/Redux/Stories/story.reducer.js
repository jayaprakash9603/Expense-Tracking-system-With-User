/**
 * Story Redux Reducer
 * Manages story list state, viewing state, and WebSocket updates
 */
import { STORY_ACTION_TYPES } from "./story.actionTypes";

const initialState = {
  // Story data
  stories: [],
  totalCount: 0,
  unseenCount: 0,
  hasMore: false,

  // Loading states
  loading: false,
  error: null,

  // Viewing state
  isViewerOpen: false,
  currentStoryIndex: 0,

  // WebSocket state
  wsConnected: false,
};

const storyReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch stories
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
      };

    case STORY_ACTION_TYPES.FETCH_STORIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Mark story as seen
    case STORY_ACTION_TYPES.MARK_STORY_SEEN:
      return {
        ...state,
        stories: state.stories.map((story) =>
          story.id === action.payload.storyId
            ? { ...story, seen: true, viewCount: (story.viewCount || 0) + 1 }
            : story,
        ),
        unseenCount: Math.max(0, state.unseenCount - 1),
      };

    // Mark CTA clicked
    case STORY_ACTION_TYPES.MARK_CTA_CLICKED:
      return {
        ...state,
        stories: state.stories.map((story) =>
          story.id === action.payload.storyId
            ? { ...story, ctaClicked: true }
            : story,
        ),
      };

    // Dismiss story
    case STORY_ACTION_TYPES.DISMISS_STORY:
      return {
        ...state,
        stories: state.stories.filter(
          (story) => story.id !== action.payload.storyId,
        ),
        totalCount: state.totalCount - 1,
      };

    // WebSocket: New story received
    case STORY_ACTION_TYPES.STORY_RECEIVED:
      // Don't add duplicates
      if (state.stories.some((s) => s.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        stories: [action.payload, ...state.stories],
        totalCount: state.totalCount + 1,
        unseenCount: state.unseenCount + 1,
      };

    // WebSocket: Story updated
    case STORY_ACTION_TYPES.STORY_UPDATED:
      return {
        ...state,
        stories: state.stories.map((story) =>
          story.id === action.payload.id
            ? { ...story, ...action.payload }
            : story,
        ),
      };

    // WebSocket: Story deleted
    case STORY_ACTION_TYPES.STORY_DELETED:
      return {
        ...state,
        stories: state.stories.filter(
          (story) => story.id !== action.payload.storyId,
        ),
        totalCount: Math.max(0, state.totalCount - 1),
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

    // WebSocket connection state
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
