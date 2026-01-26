/**
 * useShortcutRecommendations - Smart shortcut recommendation system
 * 
 * This hook analyzes user behavior and provides intelligent shortcut
 * recommendations based on:
 * - Action frequency
 * - Recency of actions
 * - Context relevance
 * - User acceptance/rejection history
 * 
 * The system learns from user interactions and avoids overwhelming
 * users with too many suggestions.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useKeyboardShortcuts } from "./KeyboardShortcutProvider";
import { DEFAULT_SHORTCUTS } from "./shortcutDefinitions";

// Configuration
const CONFIG = {
  // Minimum action count before suggesting a shortcut
  MIN_ACTION_COUNT: 5,

  // Minimum time between recommendations (ms)
  RECOMMENDATION_COOLDOWN: 60000, // 1 minute

  // Maximum recommendations per session
  MAX_RECOMMENDATIONS_PER_SESSION: 5,

  // Weight factors for scoring
  WEIGHTS: {
    FREQUENCY: 0.4,
    RECENCY: 0.3,
    CONTEXT: 0.2,
    TIME_SAVED: 0.1,
  },

  // Decay factor for recency (per hour)
  RECENCY_DECAY: 0.9,

  // Actions that should NEVER get shortcut recommendations
  EXCLUDED_ACTIONS: [
    "DELETE_EXPENSE",
    "DELETE_BUDGET",
    "DELETE_ACCOUNT",
    "LOGOUT",
  ],

  // Maximum age of behavior data to consider (days)
  MAX_DATA_AGE_DAYS: 30,
};

/**
 * Hook to get and manage shortcut recommendations
 */
export function useShortcutRecommendations() {
  const { getBehaviorData, getAllShortcuts, trackAction } = useKeyboardShortcuts();

  // State
  const [recommendations, setRecommendations] = useState([]);
  const [dismissedRecommendations, setDismissedRecommendations] = useState([]);
  const [acceptedRecommendations, setAcceptedRecommendations] = useState([]);
  const [showRecommendation, setShowRecommendation] = useState(null);

  // Refs for tracking
  const lastRecommendationTimeRef = useRef(0);
  const sessionRecommendationCountRef = useRef(0);

  // Load dismissed/accepted from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("shortcut_recommendations_history");
      if (stored) {
        const parsed = JSON.parse(stored);
        setDismissedRecommendations(parsed.dismissed || []);
        setAcceptedRecommendations(parsed.accepted || []);
      }
    } catch (e) {
      console.warn("Failed to load recommendation history:", e);
    }
  }, []);

  // Save to localStorage when history changes
  useEffect(() => {
    try {
      localStorage.setItem(
        "shortcut_recommendations_history",
        JSON.stringify({
          dismissed: dismissedRecommendations,
          accepted: acceptedRecommendations,
        })
      );
    } catch (e) {
      console.warn("Failed to save recommendation history:", e);
    }
  }, [dismissedRecommendations, acceptedRecommendations]);

  /**
   * Calculate recommendation score for an action
   */
  const calculateScore = useCallback(
    (actionId, behaviorData) => {
      const { actionCounts, lastActions } = behaviorData;

      // Get count for this action
      const count = actionCounts[actionId] || 0;
      if (count < CONFIG.MIN_ACTION_COUNT) return 0;

      // Calculate frequency score (normalized)
      const maxCount = Math.max(...Object.values(actionCounts), 1);
      const frequencyScore = count / maxCount;

      // Calculate recency score
      const recentActions = lastActions.filter((a) => a.actionId === actionId);
      let recencyScore = 0;
      if (recentActions.length > 0) {
        const mostRecent = recentActions[0];
        const hoursAgo = (Date.now() - mostRecent.timestamp) / (1000 * 60 * 60);
        recencyScore = Math.pow(CONFIG.RECENCY_DECAY, hoursAgo);
      }

      // Calculate context score (how often used via UI vs shortcut)
      const uiActions = recentActions.filter((a) => a.source === "click").length;
      const shortcutActions = recentActions.filter((a) => a.source === "shortcut").length;
      const contextScore = shortcutActions > 0 ? 0 : uiActions / (uiActions + shortcutActions + 1);

      // Calculate time saved score (based on action type)
      const shortcut = DEFAULT_SHORTCUTS[actionId];
      let timeSavedScore = 0.5; // Default
      if (shortcut) {
        if (shortcut.priority === "HIGH" || shortcut.priority === "CRITICAL") {
          timeSavedScore = 1.0;
        } else if (shortcut.priority === "LOW") {
          timeSavedScore = 0.3;
        }
      }

      // Combine scores with weights
      const totalScore =
        CONFIG.WEIGHTS.FREQUENCY * frequencyScore +
        CONFIG.WEIGHTS.RECENCY * recencyScore +
        CONFIG.WEIGHTS.CONTEXT * contextScore +
        CONFIG.WEIGHTS.TIME_SAVED * timeSavedScore;

      return totalScore;
    },
    []
  );

  /**
   * Generate recommendations based on behavior data
   */
  const generateRecommendations = useCallback(() => {
    const behaviorData = getBehaviorData();
    const currentShortcuts = getAllShortcuts();

    // Get list of action IDs that don't have shortcuts yet
    // (or have shortcuts but user is not using them)
    const candidates = [];

    Object.keys(behaviorData.actionCounts).forEach((actionId) => {
      // Skip excluded actions
      if (CONFIG.EXCLUDED_ACTIONS.includes(actionId)) return;

      // Skip dismissed recommendations
      if (dismissedRecommendations.includes(actionId)) return;

      // Skip already accepted recommendations
      if (acceptedRecommendations.includes(actionId)) return;

      // Check if there's a default shortcut for this action
      const defaultShortcut = DEFAULT_SHORTCUTS[actionId];
      if (!defaultShortcut) return;

      // Check if user is already using the shortcut
      const recentActions = behaviorData.lastActions.filter(
        (a) => a.actionId === actionId
      );
      const shortcutUsage = recentActions.filter(
        (a) => a.source === "shortcut"
      ).length;

      // If they're already using shortcuts for this action, skip
      if (shortcutUsage > recentActions.length * 0.3) return;

      // Calculate score
      const score = calculateScore(actionId, behaviorData);
      if (score > 0.3) {
        candidates.push({
          actionId,
          score,
          shortcut: defaultShortcut,
        });
      }
    });

    // Sort by score and take top recommendations
    candidates.sort((a, b) => b.score - a.score);
    setRecommendations(candidates.slice(0, 5));

    return candidates.slice(0, 5);
  }, [
    getBehaviorData,
    getAllShortcuts,
    dismissedRecommendations,
    acceptedRecommendations,
    calculateScore,
  ]);

  /**
   * Show a recommendation toast/popup
   */
  const showNextRecommendation = useCallback(() => {
    // Check cooldown
    const now = Date.now();
    if (now - lastRecommendationTimeRef.current < CONFIG.RECOMMENDATION_COOLDOWN) {
      return null;
    }

    // Check session limit
    if (sessionRecommendationCountRef.current >= CONFIG.MAX_RECOMMENDATIONS_PER_SESSION) {
      return null;
    }

    // Generate fresh recommendations
    const recs = generateRecommendations();
    if (recs.length === 0) return null;

    // Show the top recommendation
    const topRec = recs[0];
    setShowRecommendation(topRec);
    lastRecommendationTimeRef.current = now;
    sessionRecommendationCountRef.current += 1;

    return topRec;
  }, [generateRecommendations]);

  /**
   * Accept a recommendation
   */
  const acceptRecommendation = useCallback(
    (actionId) => {
      setAcceptedRecommendations((prev) => [...prev, actionId]);
      setRecommendations((prev) => prev.filter((r) => r.actionId !== actionId));
      setShowRecommendation(null);

      // Track this acceptance for future learning
      trackAction(`RECOMMENDATION_ACCEPTED_${actionId}`, "system");
    },
    [trackAction]
  );

  /**
   * Dismiss a recommendation
   */
  const dismissRecommendation = useCallback(
    (actionId, permanent = false) => {
      if (permanent) {
        setDismissedRecommendations((prev) => [...prev, actionId]);
      }
      setRecommendations((prev) => prev.filter((r) => r.actionId !== actionId));
      setShowRecommendation(null);

      // Track this dismissal for future learning
      trackAction(`RECOMMENDATION_DISMISSED_${actionId}`, "system");
    },
    [trackAction]
  );

  /**
   * Clear all recommendation history
   */
  const clearHistory = useCallback(() => {
    setDismissedRecommendations([]);
    setAcceptedRecommendations([]);
    setRecommendations([]);
    setShowRecommendation(null);
    localStorage.removeItem("shortcut_recommendations_history");
  }, []);

  return {
    // Current recommendations
    recommendations,
    showRecommendation,

    // Actions
    generateRecommendations,
    showNextRecommendation,
    acceptRecommendation,
    dismissRecommendation,
    clearHistory,

    // History
    dismissedRecommendations,
    acceptedRecommendations,
  };
}

/**
 * Component to display shortcut recommendations
 * Usage: <ShortcutRecommendationToast />
 */
export function ShortcutRecommendationToast() {
  const {
    showRecommendation,
    acceptRecommendation,
    dismissRecommendation,
  } = useShortcutRecommendations();

  if (!showRecommendation) return null;

  const { actionId, shortcut } = showRecommendation;

  return (
    <div className="shortcut-recommendation-toast">
      <div className="recommendation-content">
        <div className="recommendation-icon">💡</div>
        <div className="recommendation-text">
          <strong>Quick Tip:</strong> You frequently use "{shortcut.description}".
          <br />
          Try the shortcut: <kbd>{shortcut.keys}</kbd>
        </div>
      </div>
      <div className="recommendation-actions">
        <button
          onClick={() => acceptRecommendation(actionId)}
          className="recommendation-btn accept"
        >
          Got it!
        </button>
        <button
          onClick={() => dismissRecommendation(actionId, false)}
          className="recommendation-btn dismiss"
        >
          Later
        </button>
        <button
          onClick={() => dismissRecommendation(actionId, true)}
          className="recommendation-btn never"
        >
          Don't show again
        </button>
      </div>
    </div>
  );
}

/**
 * Algorithm pseudo-code for recommendation scoring:
 * 
 * RECOMMENDATION_SCORE(action_id) =
 *   W_freq * FREQUENCY_SCORE +
 *   W_rec * RECENCY_SCORE +
 *   W_ctx * CONTEXT_SCORE +
 *   W_time * TIME_SAVED_SCORE
 * 
 * Where:
 * - FREQUENCY_SCORE = action_count / max_action_count
 * - RECENCY_SCORE = DECAY_FACTOR ^ hours_since_last_use
 * - CONTEXT_SCORE = ui_clicks / (ui_clicks + shortcut_uses + 1)
 *   (High score = user not using shortcuts for this action)
 * - TIME_SAVED_SCORE = priority-based (HIGH=1.0, NORMAL=0.5, LOW=0.3)
 * 
 * Weights (W_*) sum to 1.0:
 * - W_freq = 0.4 (most important)
 * - W_rec = 0.3 (recent usage matters)
 * - W_ctx = 0.2 (context relevance)
 * - W_time = 0.1 (time saving potential)
 * 
 * Filters:
 * - Exclude destructive actions
 * - Exclude dismissed recommendations
 * - Exclude already-accepted recommendations
 * - Require minimum action count
 * - Require score > 0.3 threshold
 */

export default useShortcutRecommendations;
