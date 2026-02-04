/**
 * StoryBar Component
 * Instagram-style horizontal story bar with colored bubble indicators
 * Displays at the top of the dashboard
 */
import React, { useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography, IconButton, Skeleton, Tooltip } from "@mui/material";
import { ChevronLeft, ChevronRight, AutoStories } from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import StoryBubble from "./StoryBubble";
import useStoryWebSocket from "./useStoryWebSocket";
import {
  fetchStories,
  openStoryViewer,
} from "../../../Redux/Stories/story.action";

const StoryBar = ({ userId }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const scrollContainerRef = React.useRef(null);

  // Connect to WebSocket for real-time story updates
  useStoryWebSocket(userId);

  const { stories, loading, error, unseenCount, wsConnected } = useSelector(
    (state) => state.story,
  );

  // Fetch stories on mount
  useEffect(() => {
    if (userId) {
      dispatch(fetchStories(userId));
    }
  }, [userId, dispatch]);

  // Group stories by type for better organization
  const groupedStories = useMemo(() => {
    if (!stories || stories.length === 0) return [];

    // Sort by: unseen first, then by priority, then by createdAt
    return [...stories].sort((a, b) => {
      if (a.seen !== b.seen) return a.seen ? 1 : -1;
      if (a.priority !== b.priority)
        return (b.priority || 0) - (a.priority || 0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [stories]);

  const handleScroll = useCallback(
    (direction) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const scrollAmount = 200;
      const newPosition =
        direction === "left"
          ? Math.max(0, scrollPosition - scrollAmount)
          : scrollPosition + scrollAmount;

      container.scrollTo({ left: newPosition, behavior: "smooth" });
      setScrollPosition(newPosition);
    },
    [scrollPosition],
  );

  const handleStoryClick = useCallback(
    (index) => {
      dispatch(openStoryViewer(index));
    },
    [dispatch],
  );

  // Don't render if no stories
  if (!loading && (!groupedStories || groupedStories.length === 0)) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        p: 1.5,
        mb: 2,
        borderRadius: 2,
        backgroundColor: colors.cardBackground,
        boxShadow: `0 2px 8px ${colors.shadow || "rgba(0,0,0,0.1)"}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Story Icon & Title */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: 60,
          mr: 1,
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AutoStories
            sx={{
              fontSize: 28,
              color: unseenCount > 0 ? colors.primary : colors.textSecondary,
            }}
          />
          {unseenCount > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: -4,
                right: -8,
                backgroundColor: colors.error || "#f44336",
                color: "#fff",
                borderRadius: "50%",
                width: 18,
                height: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: "bold",
              }}
            >
              {unseenCount > 9 ? "9+" : unseenCount}
            </Box>
          )}
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: colors.textSecondary,
            mt: 0.5,
            fontWeight: 500,
          }}
        >
          Updates
        </Typography>
      </Box>

      {/* Left Scroll Button */}
      {scrollPosition > 0 && (
        <IconButton
          onClick={() => handleScroll("left")}
          size="small"
          sx={{
            position: "absolute",
            left: 60,
            zIndex: 2,
            backgroundColor: colors.cardBackground,
            boxShadow: 1,
            "&:hover": {
              backgroundColor: colors.cardHover,
            },
          }}
        >
          <ChevronLeft />
        </IconButton>
      )}

      {/* Story Bubbles Container */}
      <Box
        ref={scrollContainerRef}
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "hidden",
          scrollBehavior: "smooth",
          flex: 1,
          py: 0.5,
          px: 1,
        }}
        onScroll={(e) => setScrollPosition(e.target.scrollLeft)}
      >
        {loading
          ? // Loading skeletons
            Array.from({ length: 5 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Skeleton
                  variant="circular"
                  width={56}
                  height={56}
                  sx={{ backgroundColor: colors.skeleton }}
                />
                <Skeleton
                  variant="text"
                  width={50}
                  height={16}
                  sx={{ backgroundColor: colors.skeleton }}
                />
              </Box>
            ))
          : // Story bubbles
            groupedStories.map((story, index) => (
              <StoryBubble
                key={story.id}
                story={story}
                onClick={() => handleStoryClick(index)}
              />
            ))}
      </Box>

      {/* Right Scroll Button */}
      {groupedStories.length > 4 && (
        <IconButton
          onClick={() => handleScroll("right")}
          size="small"
          sx={{
            position: "absolute",
            right: 8,
            zIndex: 2,
            backgroundColor: colors.cardBackground,
            boxShadow: 1,
            "&:hover": {
              backgroundColor: colors.cardHover,
            },
          }}
        >
          <ChevronRight />
        </IconButton>
      )}

      {/* Error Message */}
      {error && (
        <Typography
          variant="caption"
          sx={{
            color: colors.error,
            position: "absolute",
            bottom: 2,
            left: 70,
          }}
        >
          Failed to load stories
        </Typography>
      )}
    </Box>
  );
};

export default StoryBar;
