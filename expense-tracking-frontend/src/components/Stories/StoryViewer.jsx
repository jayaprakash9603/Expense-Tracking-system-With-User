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
  const videoRef = useRef(null);

  const currentStory = stories[currentStoryIndex];
  const storyDuration = (currentStory?.durationSeconds || 5) * 1000;
  const hasMedia = currentStory?.imageUrl || currentStory?.videoUrl;

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
      // Pause video when story is paused
      if (videoRef.current) {
        videoRef.current.pause();
      }
      return;
    }

    // Play video when story is not paused
    if (videoRef.current) {
      videoRef.current
        .play()
        .catch((err) => console.log("Video play error:", err));
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
    // Reset video when changing stories
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    if (currentStoryIndex < stories.length - 1) {
      dispatch(setCurrentStoryIndex(currentStoryIndex + 1));
      setProgress(0);
    } else {
      handleClose();
    }
  }, [currentStoryIndex, stories.length, dispatch, handleClose]);

  const handlePrevious = useCallback(() => {
    // Reset video when changing stories
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
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
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
          },
        },
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          width: { xs: "100%", sm: "100%", md: 400 },
          height: { xs: "100%", sm: "100%", md: "90vh" },
          maxHeight: { xs: "100%", sm: "100%", md: 800 },
          aspectRatio: { md: "9/16" },
          backgroundColor: currentStory.backgroundColor || "#1a1a2e",
          backgroundImage: currentStory.backgroundGradient,
          borderRadius: { xs: 0, md: 4 },
          boxShadow: { xs: "none", md: "0 8px 32px rgba(0,0,0,0.5)" },
          position: "relative",
          overflow: "hidden",
          outline: "none",
          display: "flex",
          flexDirection: "column",
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
            pt: 3,
            zIndex: 10,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: currentStory.severityColor || colors.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                border: "2px solid rgba(255,255,255,0.8)",
              }}
            >
              <Typography sx={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>
                {currentStory.title?.charAt(0) || "!"}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ 
                  color: "#fff", 
                  fontWeight: 700, 
                  textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                  fontSize: "15px"
                }}
              >
                {currentStory.storyType?.replace(/_/g, " ") || "Update"}
              </Typography>
              <Typography
                variant="caption"
                sx={{ 
                  color: "rgba(255,255,255,0.9)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                  fontWeight: 500
                }}
              >
                {formatTimeAgo(currentStory.createdAt)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton
              onClick={() => setIsPaused((p) => !p)}
              sx={{ 
                color: "#fff", 
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
              }}
              size="small"
            >
              {isPaused ? <PlayArrow /> : <Pause />}
            </IconButton>
            <IconButton
              onClick={handleClose}
              sx={{ 
                color: "#fff",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
              }}
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
            top: 0,
            left: 0,
            width: "30%",
            height: "100%",
            cursor: "pointer",
            zIndex: 1,
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleTapZone("left");
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "30%",
            height: "100%",
            cursor: "pointer",
            zIndex: 1,
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleTapZone("right");
          }}
        />

        {/* Story Content */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: hasMedia ? "flex-start" : "center",
            flex: 1,
            p: hasMedia ? 0 : 4,
            textAlign: "center",
            minHeight: "50%",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Video Background */}
          {currentStory.videoUrl && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#000",
              }}
            >
              <video
                key={currentStory.id || currentStoryIndex}
                ref={videoRef}
                src={currentStory.videoUrl}
                autoPlay
                muted
                loop={false}
                playsInline
                preload="auto"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onLoadedMetadata={() => {
                  if (!isPaused && videoRef.current) {
                    videoRef.current
                      .play()
                      .catch((err) => console.log("Video play error:", err));
                  }
                }}
                onCanPlay={() => {
                  if (!isPaused && videoRef.current) {
                    videoRef.current
                      .play()
                      .catch((err) => console.log("Video play error:", err));
                  }
                }}
              />
              {/* Gradient overlay for text readability */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "20%",
                  background: "linear-gradient(rgba(0,0,0,0.6), transparent)",
                  pointerEvents: "none",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "40%",
                  background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                  pointerEvents: "none",
                }}
              />
            </Box>
          )}

          {/* Image Background */}
          {currentStory.imageUrl && !currentStory.videoUrl && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#000",
              }}
            >
              <Box
                component="img"
                src={currentStory.imageUrl}
                alt={currentStory.title}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              {/* Gradient overlay for text readability */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "20%",
                  background: "linear-gradient(rgba(0,0,0,0.6), transparent)",
                  pointerEvents: "none",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "40%",
                  background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                  pointerEvents: "none",
                }}
              />
            </Box>
          )}

          {/* Text Content - positioned at bottom for media, centered otherwise */}
          <Box
            sx={{
              position: hasMedia ? "absolute" : "relative",
              bottom: hasMedia ? 90 : "auto",
              left: hasMedia ? 0 : "auto",
              right: hasMedia ? 0 : "auto",
              p: hasMedia ? 4 : 4,
              zIndex: 2,
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: "#fff",
                fontWeight: 800,
                mb: 2,
                textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                letterSpacing: "-0.5px",
                lineHeight: 1.2,
              }}
            >
              {currentStory.title}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "rgba(255,255,255,0.95)",
                lineHeight: 1.5,
                textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                fontSize: "1.1rem",
                fontWeight: 500,
              }}
            >
              {currentStory.content}
            </Typography>
          </Box>
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
