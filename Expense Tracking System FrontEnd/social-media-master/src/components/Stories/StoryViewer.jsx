/**
 * StoryViewer Component
 * Full-screen modal for viewing stories with Instagram-style navigation
 * Features progress bar, auto-advance, tap zones, and CTA buttons
 */
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Modal,
  Box,
  IconButton,
  Typography,
  Button,
  LinearProgress,
} from "@mui/material";
import {
  Close,
  ChevronLeft,
  ChevronRight,
  Pause,
  PlayArrow,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import { useNavigate } from "react-router-dom";
import {
  closeStoryViewer,
  setCurrentStoryIndex,
  markStorySeen,
  markCtaClicked,
  dismissStory,
} from "../../Redux/Stories/story.action";
import StoryProgressBar from "./StoryProgressBar";
import StoryCTA from "./StoryCTA";

const StoryViewer = ({ userId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { colors } = useTheme();

  const { stories, isViewerOpen, currentStoryIndex } = useSelector(
    (state) => state.story,
  );

  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);

  const currentStory = stories[currentStoryIndex];
  const storyDuration = (currentStory?.durationSeconds || 5) * 1000;

  // Mark current story as seen
  useEffect(() => {
    if (isViewerOpen && currentStory && !currentStory.seen && userId) {
      dispatch(markStorySeen(currentStory.id, userId));
    }
  }, [isViewerOpen, currentStory, userId, dispatch]);

  // Auto-advance timer
  useEffect(() => {
    if (!isViewerOpen || isPaused) {
      clearInterval(intervalRef.current);
      return;
    }

    setProgress(0);
    const startTime = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / storyDuration) * 100;

      if (newProgress >= 100) {
        clearInterval(intervalRef.current);
        handleNext();
      } else {
        setProgress(newProgress);
      }
    }, 50);

    return () => clearInterval(intervalRef.current);
  }, [isViewerOpen, currentStoryIndex, isPaused, storyDuration]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isViewerOpen) return;

      switch (e.key) {
        case "ArrowLeft":
          handlePrevious();
          break;
        case "ArrowRight":
          handleNext();
          break;
        case "Escape":
          handleClose();
          break;
        case " ":
          setIsPaused((p) => !p);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isViewerOpen, currentStoryIndex, stories.length]);

  const handleClose = useCallback(() => {
    clearInterval(intervalRef.current);
    dispatch(closeStoryViewer());
  }, [dispatch]);

  const handleNext = useCallback(() => {
    if (currentStoryIndex < stories.length - 1) {
      dispatch(setCurrentStoryIndex(currentStoryIndex + 1));
      setProgress(0);
    } else {
      handleClose();
    }
  }, [currentStoryIndex, stories.length, dispatch, handleClose]);

  const handlePrevious = useCallback(() => {
    if (currentStoryIndex > 0) {
      dispatch(setCurrentStoryIndex(currentStoryIndex - 1));
      setProgress(0);
    }
  }, [currentStoryIndex, dispatch]);

  const handleTapZone = useCallback(
    (zone) => {
      if (zone === "left") {
        handlePrevious();
      } else if (zone === "right") {
        handleNext();
      }
    },
    [handlePrevious, handleNext],
  );

  const handleCtaClick = useCallback(
    (cta) => {
      if (currentStory && userId) {
        dispatch(markCtaClicked(currentStory.id, cta.id, userId));
      }

      // Handle navigation based on CTA type
      if (cta.routePath) {
        handleClose();
        navigate(cta.routePath);
      } else if (cta.externalUrl) {
        window.open(cta.externalUrl, "_blank");
      }
    },
    [currentStory, userId, dispatch, navigate, handleClose],
  );

  const handleDismiss = useCallback(() => {
    if (currentStory && userId) {
      dispatch(dismissStory(currentStory.id, userId));
      handleNext();
    }
  }, [currentStory, userId, dispatch, handleNext]);

  if (!isViewerOpen || !currentStory) {
    return null;
  }

  return (
    <Modal
      open={isViewerOpen}
      onClose={handleClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          width: "100%",
          maxWidth: 420,
          height: "100%",
          maxHeight: "85vh",
          backgroundColor: currentStory.backgroundColor || "#1a1a2e",
          backgroundImage: currentStory.backgroundGradient,
          borderRadius: { xs: 0, sm: 2 },
          position: "relative",
          overflow: "hidden",
          outline: "none",
        }}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Progress Bars */}
        <StoryProgressBar
          stories={stories}
          currentIndex={currentStoryIndex}
          progress={progress}
        />

        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            pt: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: currentStory.severityColor || colors.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ color: "#fff", fontSize: 14 }}>
                {currentStory.title?.charAt(0) || "!"}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ color: "#fff", fontWeight: 600 }}
              >
                {currentStory.storyType?.replace(/_/g, " ") || "Update"}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                {formatTimeAgo(currentStory.createdAt)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={() => setIsPaused((p) => !p)}
              sx={{ color: "#fff" }}
              size="small"
            >
              {isPaused ? <PlayArrow /> : <Pause />}
            </IconButton>
            <IconButton
              onClick={handleClose}
              sx={{ color: "#fff" }}
              size="small"
            >
              <Close />
            </IconButton>
          </Box>
        </Box>

        {/* Tap Zones for Navigation */}
        <Box
          sx={{
            position: "absolute",
            top: 80,
            left: 0,
            width: "30%",
            height: "calc(100% - 180px)",
            cursor: "pointer",
            zIndex: 1,
          }}
          onClick={() => handleTapZone("left")}
        />
        <Box
          sx={{
            position: "absolute",
            top: 80,
            right: 0,
            width: "30%",
            height: "calc(100% - 180px)",
            cursor: "pointer",
            zIndex: 1,
          }}
          onClick={() => handleTapZone("right")}
        />

        {/* Story Content */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            p: 4,
            textAlign: "center",
            minHeight: "50%",
          }}
        >
          {currentStory.imageUrl && (
            <Box
              component="img"
              src={currentStory.imageUrl}
              alt={currentStory.title}
              sx={{
                maxWidth: "100%",
                maxHeight: 200,
                borderRadius: 2,
                mb: 3,
              }}
            />
          )}

          <Typography
            variant="h5"
            sx={{
              color: "#fff",
              fontWeight: 700,
              mb: 2,
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            {currentStory.title}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "rgba(255,255,255,0.9)",
              lineHeight: 1.6,
              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
          >
            {currentStory.content}
          </Typography>
        </Box>

        {/* CTA Buttons */}
        {currentStory.ctaButtons && currentStory.ctaButtons.length > 0 && (
          <StoryCTA
            ctaButtons={currentStory.ctaButtons}
            onCtaClick={handleCtaClick}
          />
        )}

        {/* Navigation Arrows (Desktop) */}
        {currentStoryIndex > 0 && (
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "#fff",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.3)",
              },
              display: { xs: "none", sm: "flex" },
            }}
          >
            <ChevronLeft />
          </IconButton>
        )}
        {currentStoryIndex < stories.length - 1 && (
          <IconButton
            onClick={handleNext}
            sx={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "#fff",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.3)",
              },
              display: { xs: "none", sm: "flex" },
            }}
          >
            <ChevronRight />
          </IconButton>
        )}

        {/* Story Counter */}
        <Box
          sx={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
            {currentStoryIndex + 1} / {stories.length}
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
};

// Helper function to format time ago
function formatTimeAgo(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

export default StoryViewer;
