/**
 * Story Redux Actions and Types
 * Handles all story-related state management
 */

// Action Types
export const STORY_ACTION_TYPES = {
  // Fetch stories
  FETCH_STORIES_REQUEST: "stories/FETCH_STORIES_REQUEST",
  FETCH_STORIES_SUCCESS: "stories/FETCH_STORIES_SUCCESS",
  FETCH_STORIES_FAILURE: "stories/FETCH_STORIES_FAILURE",

  // Mark story as seen
  MARK_STORY_SEEN: "stories/MARK_STORY_SEEN",

  // Mark CTA clicked
  MARK_CTA_CLICKED: "stories/MARK_CTA_CLICKED",

  // Dismiss story
  DISMISS_STORY: "stories/DISMISS_STORY",

  // WebSocket events
  STORY_RECEIVED: "stories/STORY_RECEIVED",
  STORY_UPDATED: "stories/STORY_UPDATED",
  STORY_DELETED: "stories/STORY_DELETED",
  REFRESH_STORIES: "stories/REFRESH_STORIES",

  // Viewing state
  SET_CURRENT_STORY_INDEX: "stories/SET_CURRENT_STORY_INDEX",
  OPEN_STORY_VIEWER: "stories/OPEN_STORY_VIEWER",
  CLOSE_STORY_VIEWER: "stories/CLOSE_STORY_VIEWER",

  // WebSocket connection
  WS_CONNECTED: "stories/WS_CONNECTED",
  WS_DISCONNECTED: "stories/WS_DISCONNECTED",
};
