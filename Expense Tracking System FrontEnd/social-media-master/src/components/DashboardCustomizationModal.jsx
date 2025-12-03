import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  IconButton,
  Typography,
  Box,
  Chip,
  Divider,
  Tooltip,
  Fade,
  Checkbox,
} from "@mui/material";
import {
  Close as CloseIcon,
  DragIndicator as DragIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  RestartAlt as ResetIcon,
  Dashboard as DashboardIcon,
  CheckCircle as CheckCircleIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  KeyboardDoubleArrowRight as DoubleArrowRightIcon,
  KeyboardDoubleArrowLeft as DoubleArrowLeftIcon,
} from "@mui/icons-material";
import { useTheme } from "../hooks/useTheme";

export default function DashboardCustomizationModal({
  open,
  onClose,
  sections,
  onToggleSection,
  onReorderSections,
  onResetLayout,
  onSaveLayout,
}) {
  const { colors, isDark } = useTheme();
  const [localSections, setLocalSections] = useState(sections);
  const [selectedAvailable, setSelectedAvailable] = useState([]);
  const [selectedActive, setSelectedActive] = useState([]);

  // Sync with parent sections when modal opens
  useEffect(() => {
    if (open) {
      setLocalSections(sections);
      setSelectedAvailable([]);
      setSelectedActive([]);
    }
  }, [open, sections]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Get current active and available lists
    const activeSections = [...localSections.filter((s) => s.visible)];
    const availableSections = [...localSections.filter((s) => !s.visible)];

    // Moving between columns (Available ↔ Active)
    if (source.droppableId !== destination.droppableId) {
      let movedSection;

      if (source.droppableId === "available-sections") {
        // Moving from Available to Active
        movedSection = availableSections[source.index];
        availableSections.splice(source.index, 1);
        movedSection.visible = true;
        activeSections.splice(destination.index, 0, movedSection);
      } else {
        // Moving from Active to Available
        movedSection = activeSections[source.index];
        activeSections.splice(source.index, 1);
        movedSection.visible = false;
        availableSections.splice(destination.index, 0, movedSection);
      }

      // Update state with new combined list
      setLocalSections([...activeSections, ...availableSections]);
    } else {
      // Reordering within the same column
      if (source.droppableId === "active-sections") {
        // Reordering within Active sections
        const [reorderedItem] = activeSections.splice(source.index, 1);
        activeSections.splice(destination.index, 0, reorderedItem);
        setLocalSections([...activeSections, ...availableSections]);
      } else {
        // Reordering within Available sections (optional, but good UX)
        const [reorderedItem] = availableSections.splice(source.index, 1);
        availableSections.splice(destination.index, 0, reorderedItem);
        setLocalSections([...activeSections, ...availableSections]);
      }
    }
  };

  const handleToggle = (sectionId) => {
    setLocalSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? { ...section, visible: !section.visible }
          : section
      )
    );
  };

  const handleSelectAvailable = (sectionId) => {
    setSelectedAvailable((current) =>
      current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId]
    );
  };

  const handleSelectActive = (sectionId) => {
    setSelectedActive((current) =>
      current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId]
    );
  };

  const moveSelectedToActive = () => {
    if (selectedAvailable.length === 0) return;

    setLocalSections((current) =>
      current.map((section) =>
        selectedAvailable.includes(section.id)
          ? { ...section, visible: true }
          : section
      )
    );
    setSelectedAvailable([]);
  };

  const moveSelectedToAvailable = () => {
    if (selectedActive.length === 0) return;

    setLocalSections((current) =>
      current.map((section) =>
        selectedActive.includes(section.id)
          ? { ...section, visible: false }
          : section
      )
    );
    setSelectedActive([]);
  };

  const moveAllToActive = () => {
    setLocalSections((current) =>
      current.map((section) => ({ ...section, visible: true }))
    );
    setSelectedAvailable([]);
  };

  const moveAllToAvailable = () => {
    setLocalSections((current) =>
      current.map((section) => ({ ...section, visible: false }))
    );
    setSelectedActive([]);
  };

  const handleSave = () => {
    onSaveLayout(localSections);
    onClose();
  };

  const handleReset = () => {
    onResetLayout();
    onClose();
  };

  const getSectionIcon = (type) => {
    switch (type) {
      case "full":
        return "▬";
      case "half":
        return "▬▬";
      case "bottom":
        return "▭";
      default:
        return "■";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      key={open ? "open" : "closed"}
      TransitionComponent={Fade}
      BackdropProps={{
        sx: {
          backgroundColor: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
        },
      }}
      PaperProps={{
        sx: {
          backgroundColor: colors.cardBackground || colors.secondary_bg,
          color: colors.primary_text,
          borderRadius: 4,
          border: `1px solid ${colors.border_color}`,
          boxShadow: isDark
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          backgroundImage: isDark
            ? "linear-gradient(135deg, rgba(20, 184, 166, 0.03) 0%, rgba(6, 182, 212, 0.03) 100%)"
            : "linear-gradient(135deg, rgba(20, 184, 166, 0.02) 0%, rgba(6, 182, 212, 0.02) 100%)",
          maxWidth: "1000px",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          pb: 2.5,
          pt: 3,
          px: 3,
          borderBottom: `1px solid ${colors.border_color}`,
          background: isDark
            ? "linear-gradient(180deg, rgba(20, 184, 166, 0.05) 0%, transparent 100%)"
            : "linear-gradient(180deg, rgba(20, 184, 166, 0.03) 0%, transparent 100%)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              background: isDark
                ? "linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)"
                : "linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${
                isDark ? "rgba(20, 184, 166, 0.3)" : "rgba(20, 184, 166, 0.2)"
              }`,
            }}
          >
            <DashboardIcon sx={{ color: "#14b8a6", fontSize: 28 }} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              fontWeight="700"
              sx={{
                color: colors.primary_text,
                mb: 0.5,
              }}
            >
              Customize Dashboard
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: colors.secondary_text,
                fontWeight: 400,
                letterSpacing: 0.2,
              }}
            >
              Drag sections between columns • Reorder active sections
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Close" arrow placement="left">
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: colors.secondary_text,
              width: 36,
              height: 36,
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.04)",
              "&:hover": {
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.08)",
                color: colors.primary_text,
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <DialogContent
        sx={{
          py: 0,
          px: 3,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: "calc(70vh - 120px)",
          minHeight: 450,
          maxHeight: 600,
        }}
      >
        {/* Statistics Row */}
        <Box
          sx={{
            pt: 3,
            pb: 2,
            display: "flex",
            gap: 3,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
            label={`${localSections.filter((s) => s.visible).length} Active`}
            size="small"
            sx={{
              backgroundColor: isDark
                ? "rgba(74, 222, 128, 0.15)"
                : "rgba(34, 197, 94, 0.12)",
              color: isDark ? "#4ade80" : "#16a34a",
              fontWeight: 600,
              fontSize: "0.75rem",
              height: 28,
              border: `1px solid ${
                isDark ? "rgba(74, 222, 128, 0.3)" : "rgba(34, 197, 94, 0.2)"
              }`,
              "& .MuiChip-icon": {
                color: isDark ? "#4ade80" : "#16a34a",
              },
            }}
          />
          <Chip
            icon={<VisibilityOffIcon sx={{ fontSize: 16 }} />}
            label={`${
              localSections.filter((s) => !s.visible).length
            } Available`}
            size="small"
            sx={{
              backgroundColor: isDark
                ? "rgba(156, 163, 175, 0.15)"
                : "rgba(107, 114, 128, 0.12)",
              color: isDark ? "#9ca3af" : "#6b7280",
              fontWeight: 600,
              fontSize: "0.75rem",
              height: 28,
              border: `1px solid ${
                isDark ? "rgba(156, 163, 175, 0.3)" : "rgba(107, 114, 128, 0.2)"
              }`,
              "& .MuiChip-icon": {
                color: isDark ? "#9ca3af" : "#6b7280",
              },
            }}
          />
        </Box>

        {/* Two Column Layout */}
        {open && localSections.length > 0 && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Box sx={{ display: "flex", gap: 3, flex: 1, minHeight: 0, pb: 3 }}>
              {/* LEFT: Available Sections */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: 420,
                  maxWidth: 500,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    mb: 2,
                    pb: 1.5,
                    borderBottom: `2px solid ${colors.border_color}`,
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight="700"
                    sx={{
                      color: colors.primary_text,
                      fontSize: "0.9rem",
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                    }}
                  >
                    📦 Available Sections
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.secondary_text,
                      fontSize: "0.7rem",
                    }}
                  >
                    Drag sections to the right to activate
                  </Typography>
                </Box>

                <Droppable droppableId="available-sections">
                  {(provided, snapshot) => (
                    <Box
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        height: "100%",
                        minHeight: 200,
                        overflowY: "auto",
                        overflowX: "hidden",
                        pr: 1,
                        backgroundColor: snapshot.isDraggingOver
                          ? isDark
                            ? "rgba(156, 163, 175, 0.15)"
                            : "rgba(156, 163, 175, 0.12)"
                          : isDark
                          ? "rgba(156, 163, 175, 0.03)"
                          : "rgba(156, 163, 175, 0.02)",
                        borderRadius: 3,
                        padding: snapshot.isDraggingOver ? 2 : 1.5,
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        border: snapshot.isDraggingOver
                          ? `3px dashed ${isDark ? "#9ca3af" : "#6b7280"}`
                          : `2px dashed ${
                              isDark
                                ? "rgba(156, 163, 175, 0.2)"
                                : "rgba(156, 163, 175, 0.15)"
                            }`,
                        boxShadow: snapshot.isDraggingOver
                          ? isDark
                            ? "inset 0 0 0 1px rgba(156, 163, 175, 0.3), 0 0 20px rgba(156, 163, 175, 0.2)"
                            : "inset 0 0 0 1px rgba(156, 163, 175, 0.25), 0 0 20px rgba(156, 163, 175, 0.15)"
                          : "none",
                        "&::-webkit-scrollbar": {
                          width: "6px",
                        },
                        "&::-webkit-scrollbar-track": {
                          backgroundColor: isDark
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(0, 0, 0, 0.05)",
                          borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: isDark
                            ? "rgba(156, 163, 175, 0.3)"
                            : "rgba(156, 163, 175, 0.4)",
                          borderRadius: "4px",
                          "&:hover": {
                            backgroundColor: isDark
                              ? "rgba(156, 163, 175, 0.5)"
                              : "rgba(156, 163, 175, 0.6)",
                          },
                        },
                      }}
                    >
                      {localSections.filter((s) => !s.visible).length === 0 ? (
                        <Box
                          sx={{
                            textAlign: "center",
                            py: 6,
                            color: colors.secondary_text,
                          }}
                        >
                          <VisibilityIcon
                            sx={{ fontSize: 48, opacity: 0.3, mb: 1 }}
                          />
                          <Typography variant="body2">
                            All sections are active!
                          </Typography>
                        </Box>
                      ) : (
                        localSections
                          .filter((s) => !s.visible)
                          .map((section, index) => (
                            <Draggable
                              key={section.id}
                              draggableId={section.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <Box
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    padding: "12px 14px",
                                    backgroundColor: snapshot.isDragging
                                      ? isDark
                                        ? "rgba(156, 163, 175, 0.12)"
                                        : "rgba(156, 163, 175, 0.08)"
                                      : colors.cardBackground ||
                                        colors.secondary_bg,
                                    border: `1.5px solid ${
                                      snapshot.isDragging
                                        ? isDark
                                          ? "#9ca3af"
                                          : "#6b7280"
                                        : isDark
                                        ? "rgba(156, 163, 175, 0.2)"
                                        : "rgba(156, 163, 175, 0.15)"
                                    }`,
                                    borderRadius: 2,
                                    transition:
                                      "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                    opacity: 0.8,
                                    boxShadow: snapshot.isDragging
                                      ? isDark
                                        ? "0 8px 16px -4px rgba(0, 0, 0, 0.4)"
                                        : "0 8px 16px -4px rgba(0, 0, 0, 0.2)"
                                      : "none",
                                    transform: snapshot.isDragging
                                      ? "scale(1.02)"
                                      : "scale(1)",
                                    userSelect: "none",
                                    WebkitUserSelect: "none",
                                    MozUserSelect: "none",
                                    msUserSelect: "none",
                                    "&:hover": {
                                      opacity: 1,
                                      borderColor: isDark
                                        ? "#9ca3af"
                                        : "#6b7280",
                                    },
                                  }}
                                >
                                  <Checkbox
                                    checked={selectedAvailable.includes(
                                      section.id
                                    )}
                                    onChange={() =>
                                      handleSelectAvailable(section.id)
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    sx={{
                                      padding: 0,
                                      color: colors.secondary_text,
                                      "&.Mui-checked": {
                                        color: "#14b8a6",
                                      },
                                    }}
                                  />
                                  <Box
                                    {...provided.dragHandleProps}
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      cursor: "grab",
                                      "&:active": {
                                        cursor: "grabbing",
                                      },
                                    }}
                                  >
                                    <DragIcon
                                      fontSize="small"
                                      sx={{ color: colors.secondary_text }}
                                    />
                                  </Box>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                      variant="body2"
                                      fontWeight="600"
                                      sx={{
                                        color: colors.secondary_text,
                                        fontSize: "0.85rem",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {section.name}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={
                                      section.type === "full"
                                        ? "Full"
                                        : section.type === "half"
                                        ? "Half"
                                        : "Bottom"
                                    }
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: "0.6rem",
                                      fontWeight: 600,
                                      backgroundColor: isDark
                                        ? "rgba(99, 102, 241, 0.12)"
                                        : "rgba(99, 102, 241, 0.08)",
                                      color: isDark ? "#a5b4fc" : "#6366f1",
                                      "& .MuiChip-label": {
                                        px: 0.8,
                                      },
                                    }}
                                  />
                                  <Tooltip title="Activate section" arrow>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggle(section.id);
                                      }}
                                      onMouseDown={(e) => e.stopPropagation()}
                                      sx={{
                                        padding: 0.5,
                                        color: colors.secondary_text,
                                        "&:hover": {
                                          color: isDark ? "#4ade80" : "#16a34a",
                                          backgroundColor: isDark
                                            ? "rgba(74, 222, 128, 0.1)"
                                            : "rgba(34, 197, 94, 0.08)",
                                        },
                                      }}
                                    >
                                      <VisibilityOffIcon
                                        sx={{ fontSize: 18 }}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              )}
                            </Draggable>
                          ))
                      )}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Box>

              {/* CENTER: Bulk Move Buttons */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  px: 1,
                }}
              >
                <Tooltip title="Move all to Active" arrow placement="right">
                  <IconButton
                    onClick={moveAllToActive}
                    disabled={
                      localSections.filter((s) => !s.visible).length === 0
                    }
                    sx={{
                      backgroundColor: isDark
                        ? "rgba(20, 184, 166, 0.1)"
                        : "rgba(20, 184, 166, 0.08)",
                      color: "#14b8a6",
                      width: 40,
                      height: 40,
                      "&:hover": {
                        backgroundColor: isDark
                          ? "rgba(20, 184, 166, 0.2)"
                          : "rgba(20, 184, 166, 0.15)",
                        transform: "scale(1.1)",
                      },
                      "&:disabled": {
                        backgroundColor: "transparent",
                        color: colors.secondary_text,
                        opacity: 0.3,
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <DoubleArrowRightIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip
                  title={`Move selected (${selectedAvailable.length}) to Active`}
                  arrow
                  placement="right"
                >
                  <IconButton
                    onClick={moveSelectedToActive}
                    disabled={selectedAvailable.length === 0}
                    sx={{
                      backgroundColor: isDark
                        ? "rgba(20, 184, 166, 0.1)"
                        : "rgba(20, 184, 166, 0.08)",
                      color: "#14b8a6",
                      width: 40,
                      height: 40,
                      border:
                        selectedAvailable.length > 0
                          ? `2px solid #14b8a6`
                          : "none",
                      "&:hover": {
                        backgroundColor: isDark
                          ? "rgba(20, 184, 166, 0.2)"
                          : "rgba(20, 184, 166, 0.15)",
                        transform: "scale(1.1)",
                      },
                      "&:disabled": {
                        backgroundColor: "transparent",
                        color: colors.secondary_text,
                        opacity: 0.3,
                        border: "none",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <ChevronRightIcon fontSize="medium" />
                  </IconButton>
                </Tooltip>

                <Divider
                  sx={{
                    width: "100%",
                    borderColor: colors.border_color,
                    my: 1,
                  }}
                />

                <Tooltip
                  title={`Move selected (${selectedActive.length}) to Available`}
                  arrow
                  placement="left"
                >
                  <IconButton
                    onClick={moveSelectedToAvailable}
                    disabled={selectedActive.length === 0}
                    sx={{
                      backgroundColor: isDark
                        ? "rgba(156, 163, 175, 0.1)"
                        : "rgba(156, 163, 175, 0.08)",
                      color: `${isDark ? "#9ca3af" : "#6b7280"} !important`,
                      width: 40,
                      height: 40,
                      border:
                        selectedActive.length > 0
                          ? `2px solid ${isDark ? "#9ca3af" : "#6b7280"}`
                          : "none",
                      "&:hover": {
                        backgroundColor: isDark
                          ? "rgba(156, 163, 175, 0.2)"
                          : "rgba(156, 163, 175, 0.15)",
                        transform: "scale(1.1)",
                        color: `${isDark ? "#9ca3af" : "#6b7280"} !important`,
                      },
                      "&:disabled": {
                        backgroundColor: "transparent",
                        color: `${colors.secondary_text} !important`,
                        opacity: 0.3,
                        border: "none",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <ChevronLeftIcon fontSize="medium" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Move all to Available" arrow placement="left">
                  <IconButton
                    onClick={moveAllToAvailable}
                    disabled={
                      localSections.filter((s) => s.visible).length === 0
                    }
                    sx={{
                      backgroundColor: isDark
                        ? "rgba(156, 163, 175, 0.1)"
                        : "rgba(156, 163, 175, 0.08)",
                      color: `${isDark ? "#9ca3af" : "#6b7280"} !important`,
                      width: 40,
                      height: 40,
                      "&:hover": {
                        backgroundColor: isDark
                          ? "rgba(156, 163, 175, 0.2)"
                          : "rgba(156, 163, 175, 0.15)",
                        transform: "scale(1.1)",
                        color: `${isDark ? "#9ca3af" : "#6b7280"} !important`,
                      },
                      "&:disabled": {
                        backgroundColor: "transparent",
                        color: `${colors.secondary_text} !important`,
                        opacity: 0.3,
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <DoubleArrowLeftIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* RIGHT: Active Sections */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: 420,
                  maxWidth: 500,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    mb: 2,
                    pb: 1.5,
                    borderBottom: `2px solid ${
                      isDark
                        ? "rgba(20, 184, 166, 0.4)"
                        : "rgba(20, 184, 166, 0.3)"
                    }`,
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight="700"
                    sx={{
                      color: isDark ? "#14b8a6" : "#0d9488",
                      fontSize: "0.9rem",
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                    }}
                  >
                    ✓ Active Sections
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.secondary_text,
                      fontSize: "0.7rem",
                    }}
                  >
                    Reorder by dragging • Remove by dragging left
                  </Typography>
                </Box>

                <Droppable droppableId="active-sections">
                  {(provided, snapshot) => (
                    <Box
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        height: "100%",
                        minHeight: 200,
                        overflowY: "auto",
                        overflowX: "hidden",
                        pr: 1,
                        backgroundColor: snapshot.isDraggingOver
                          ? isDark
                            ? "rgba(20, 184, 166, 0.15)"
                            : "rgba(20, 184, 166, 0.12)"
                          : isDark
                          ? "rgba(20, 184, 166, 0.03)"
                          : "rgba(20, 184, 166, 0.02)",
                        borderRadius: 3,
                        padding: snapshot.isDraggingOver ? 2 : 1.5,
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        border: snapshot.isDraggingOver
                          ? `3px dashed #14b8a6`
                          : `2px dashed ${
                              isDark
                                ? "rgba(20, 184, 166, 0.25)"
                                : "rgba(20, 184, 166, 0.2)"
                            }`,
                        boxShadow: snapshot.isDraggingOver
                          ? isDark
                            ? "inset 0 0 0 1px rgba(20, 184, 166, 0.4), 0 0 20px rgba(20, 184, 166, 0.25)"
                            : "inset 0 0 0 1px rgba(20, 184, 166, 0.3), 0 0 20px rgba(20, 184, 166, 0.2)"
                          : "none",
                        "&::-webkit-scrollbar": {
                          width: "6px",
                        },
                        "&::-webkit-scrollbar-track": {
                          backgroundColor: isDark
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(0, 0, 0, 0.05)",
                          borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: isDark
                            ? "rgba(20, 184, 166, 0.3)"
                            : "rgba(20, 184, 166, 0.4)",
                          borderRadius: "4px",
                          "&:hover": {
                            backgroundColor: isDark
                              ? "rgba(20, 184, 166, 0.5)"
                              : "rgba(20, 184, 166, 0.6)",
                          },
                        },
                      }}
                    >
                      {localSections.filter((s) => s.visible).length === 0 ? (
                        <Box
                          sx={{
                            textAlign: "center",
                            py: 6,
                            color: colors.secondary_text,
                          }}
                        >
                          <VisibilityOffIcon
                            sx={{ fontSize: 48, opacity: 0.3, mb: 1 }}
                          />
                          <Typography variant="body2">
                            Drag sections here to activate
                          </Typography>
                        </Box>
                      ) : (
                        localSections
                          .filter((s) => s.visible)
                          .map((section, index) => (
                            <Draggable
                              key={section.id}
                              draggableId={section.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <Box
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    padding: "12px 14px",
                                    backgroundColor: snapshot.isDragging
                                      ? isDark
                                        ? "rgba(20, 184, 166, 0.12)"
                                        : "rgba(20, 184, 166, 0.08)"
                                      : colors.cardBackground ||
                                        colors.secondary_bg,
                                    border: `1.5px solid ${
                                      snapshot.isDragging
                                        ? "#14b8a6"
                                        : isDark
                                        ? "rgba(20, 184, 166, 0.3)"
                                        : "rgba(20, 184, 166, 0.25)"
                                    }`,
                                    borderRadius: 2,
                                    transition:
                                      "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                    boxShadow: snapshot.isDragging
                                      ? isDark
                                        ? "0 8px 16px -4px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(20, 184, 166, 0.3)"
                                        : "0 8px 16px -4px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(20, 184, 166, 0.2)"
                                      : "none",
                                    transform: snapshot.isDragging
                                      ? "scale(1.02)"
                                      : "scale(1)",
                                    userSelect: "none",
                                    WebkitUserSelect: "none",
                                    MozUserSelect: "none",
                                    msUserSelect: "none",
                                    "&:hover": {
                                      borderColor: "#14b8a6",
                                      boxShadow: isDark
                                        ? "0 4px 12px -2px rgba(0, 0, 0, 0.2)"
                                        : "0 4px 12px -2px rgba(0, 0, 0, 0.1)",
                                    },
                                  }}
                                >
                                  <Checkbox
                                    checked={selectedActive.includes(
                                      section.id
                                    )}
                                    onChange={() =>
                                      handleSelectActive(section.id)
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    sx={{
                                      padding: 0,
                                      color: isDark
                                        ? "rgba(20, 184, 166, 0.5)"
                                        : "rgba(20, 184, 166, 0.7)",
                                      "&.Mui-checked": {
                                        color: "#14b8a6",
                                      },
                                    }}
                                  />
                                  <Box
                                    {...provided.dragHandleProps}
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      cursor: "grab",
                                      "&:active": {
                                        cursor: "grabbing",
                                      },
                                    }}
                                  >
                                    <DragIcon
                                      fontSize="small"
                                      sx={{ color: "#14b8a6" }}
                                    />
                                  </Box>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                      variant="body2"
                                      fontWeight="600"
                                      sx={{
                                        color: colors.primary_text,
                                        fontSize: "0.85rem",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {section.name}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={
                                      section.type === "full"
                                        ? "Full"
                                        : section.type === "half"
                                        ? "Half"
                                        : "Bottom"
                                    }
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: "0.6rem",
                                      fontWeight: 600,
                                      backgroundColor: isDark
                                        ? "rgba(99, 102, 241, 0.15)"
                                        : "rgba(99, 102, 241, 0.1)",
                                      color: isDark ? "#a5b4fc" : "#6366f1",
                                      "& .MuiChip-label": {
                                        px: 0.8,
                                      },
                                    }}
                                  />
                                  <Tooltip title="Deactivate section" arrow>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggle(section.id);
                                      }}
                                      onMouseDown={(e) => e.stopPropagation()}
                                      sx={{
                                        padding: 0.5,
                                        color: isDark ? "#4ade80" : "#16a34a",
                                        "&:hover": {
                                          color: colors.secondary_text,
                                          backgroundColor: isDark
                                            ? "rgba(156, 163, 175, 0.1)"
                                            : "rgba(107, 114, 128, 0.08)",
                                        },
                                      }}
                                    >
                                      <VisibilityIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              )}
                            </Draggable>
                          ))
                      )}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Box>
            </Box>
          </DragDropContext>
        )}
      </DialogContent>

      <Divider sx={{ borderColor: colors.border_color }} />

      <DialogActions
        sx={{
          p: 3,
          gap: 1.5,
          background: isDark
            ? "linear-gradient(180deg, transparent 0%, rgba(20, 184, 166, 0.03) 100%)"
            : "linear-gradient(180deg, transparent 0%, rgba(20, 184, 166, 0.02) 100%)",
        }}
      >
        <Tooltip title="Restore default layout" arrow>
          <Button
            variant="outlined"
            startIcon={<ResetIcon />}
            onClick={handleReset}
            sx={{
              color: isDark ? "#f87171" : "#dc2626",
              borderColor: isDark
                ? "rgba(248, 113, 113, 0.5)"
                : "rgba(239, 68, 68, 0.4)",
              backgroundColor: isDark
                ? "rgba(248, 113, 113, 0.1)"
                : "rgba(239, 68, 68, 0.08)",
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,
              py: 1,
              borderRadius: 2,
              "&:hover": {
                borderColor: isDark
                  ? "rgba(248, 113, 113, 0.6)"
                  : "rgba(239, 68, 68, 0.5)",
                backgroundColor: isDark
                  ? "rgba(248, 113, 113, 0.15)"
                  : "rgba(239, 68, 68, 0.12)",
                color: isDark ? "#f87171" : "#dc2626",
                transform: "translateY(-1px)",
              },
            }}
          >
            Reset to Default
          </Button>
        </Tooltip>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            color: colors.secondary_text,
            borderColor: colors.border_color,
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1,
            borderRadius: 2,
            "&:hover": {
              borderColor: colors.secondary_text,
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          startIcon={<CheckCircleIcon />}
          sx={{
            background: "linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)",
            color: "#fff",
            textTransform: "none",
            fontWeight: 700,
            px: 3.5,
            py: 1,
            borderRadius: 2,
            boxShadow: isDark
              ? "0 4px 12px -2px rgba(20, 184, 166, 0.4)"
              : "0 4px 12px -2px rgba(20, 184, 166, 0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #0d9488 0%, #06748c 100%)",
              boxShadow: isDark
                ? "0 6px 16px -4px rgba(20, 184, 166, 0.5)"
                : "0 6px 16px -4px rgba(20, 184, 166, 0.4)",
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
            transition: "all 0.2s ease",
          }}
        >
          Save Layout
        </Button>
      </DialogActions>
    </Dialog>
  );
}
