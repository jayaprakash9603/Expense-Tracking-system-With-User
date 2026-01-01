import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Box,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  DragIndicator as DragIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  KeyboardDoubleArrowRight as DoubleArrowRightIcon,
  KeyboardDoubleArrowLeft as DoubleArrowLeftIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

/**
 * Reusable dual-list drag & drop manager for dashboard sections.
 *
 * Props:
 * - sections: Array<{ id: string, name: string, type: "full"|"half"|"bottom", visible: boolean }>
 * - onChange: (updatedSections) => void
 */
export default function SectionsDualList({ sections, onChange }) {
  const { colors, isDark } = useTheme();
  const [selectedAvailable, setSelectedAvailable] = useState([]);
  const [selectedActive, setSelectedActive] = useState([]);

  const activeSections = sections.filter((s) => s.visible);
  const availableSections = sections.filter((s) => !s.visible);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    const currentActive = [...activeSections];
    const currentAvailable = [...availableSections];

    if (source.droppableId !== destination.droppableId) {
      let movedSection;

      if (source.droppableId === "available-sections") {
        movedSection = currentAvailable[source.index];
        currentAvailable.splice(source.index, 1);
        movedSection = { ...movedSection, visible: true };
        currentActive.splice(destination.index, 0, movedSection);
      } else {
        movedSection = currentActive[source.index];
        currentActive.splice(source.index, 1);
        movedSection = { ...movedSection, visible: false };
        currentAvailable.splice(destination.index, 0, movedSection);
      }
    } else {
      if (source.droppableId === "active-sections") {
        const [reorderedItem] = currentActive.splice(source.index, 1);
        currentActive.splice(destination.index, 0, reorderedItem);
      } else {
        const [reorderedItem] = currentAvailable.splice(source.index, 1);
        currentAvailable.splice(destination.index, 0, reorderedItem);
      }
    }

    onChange([...currentActive, ...currentAvailable]);
  };

  const handleToggle = (sectionId) => {
    onChange(
      sections.map((section) =>
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

    onChange(
      sections.map((section) =>
        selectedAvailable.includes(section.id)
          ? { ...section, visible: true }
          : section
      )
    );
    setSelectedAvailable([]);
  };

  const moveSelectedToAvailable = () => {
    if (selectedActive.length === 0) return;

    onChange(
      sections.map((section) =>
        selectedActive.includes(section.id)
          ? { ...section, visible: false }
          : section
      )
    );
    setSelectedActive([]);
  };

  const moveAllToActive = () => {
    onChange(sections.map((section) => ({ ...section, visible: true })));
    setSelectedAvailable([]);
  };

  const moveAllToAvailable = () => {
    onChange(sections.map((section) => ({ ...section, visible: false })));
    setSelectedActive([]);
  };

  return (
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
                {availableSections.length === 0 ? (
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
                  availableSections.map((section, index) => (
                    <Draggable
                      key={section.id}
                      draggableId={section.id}
                      index={index}
                    >
                      {(providedDraggable, snapshotDraggable) => (
                        <Box
                          ref={providedDraggable.innerRef}
                          {...providedDraggable.draggableProps}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            padding: "12px 14px",
                            backgroundColor: snapshotDraggable.isDragging
                              ? isDark
                                ? "rgba(156, 163, 175, 0.12)"
                                : "rgba(156, 163, 175, 0.08)"
                              : colors.cardBackground || colors.secondary_bg,
                            border: `1.5px solid ${
                              snapshotDraggable.isDragging
                                ? isDark
                                  ? "#9ca3af"
                                  : "#6b7280"
                                : isDark
                                ? "rgba(156, 163, 175, 0.2)"
                                : "rgba(156, 163, 175, 0.15)"
                            }`,
                            borderRadius: 2,
                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                            opacity: 0.8,
                            boxShadow: snapshotDraggable.isDragging
                              ? isDark
                                ? "0 8px 16px -4px rgba(0, 0, 0, 0.4)"
                                : "0 8px 16px -4px rgba(0, 0, 0, 0.2)"
                              : "none",
                            transform: snapshotDraggable.isDragging
                              ? "scale(1.02)"
                              : "scale(1)",
                            userSelect: "none",
                            WebkitUserSelect: "none",
                            MozUserSelect: "none",
                            msUserSelect: "none",
                            "&:hover": {
                              opacity: 1,
                              borderColor: isDark ? "#9ca3af" : "#6b7280",
                            },
                          }}
                        >
                          <Checkbox
                            checked={selectedAvailable.includes(section.id)}
                            onChange={() => handleSelectAvailable(section.id)}
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
                            {...providedDraggable.dragHandleProps}
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
                              <VisibilityOffIcon sx={{ fontSize: 18 }} />
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
              disabled={availableSections.length === 0}
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
                  selectedAvailable.length > 0 ? `2px solid #14b8a6` : "none",
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
              disabled={activeSections.length === 0}
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
                isDark ? "rgba(20, 184, 166, 0.4)" : "rgba(20, 184, 166, 0.3)"
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
                {activeSections.length === 0 ? (
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
                  activeSections.map((section, index) => (
                    <Draggable
                      key={section.id}
                      draggableId={section.id}
                      index={index}
                    >
                      {(providedDraggable, snapshotDraggable) => (
                        <Box
                          ref={providedDraggable.innerRef}
                          {...providedDraggable.draggableProps}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            padding: "12px 14px",
                            backgroundColor: snapshotDraggable.isDragging
                              ? isDark
                                ? "rgba(20, 184, 166, 0.12)"
                                : "rgba(20, 184, 166, 0.08)"
                              : colors.cardBackground || colors.secondary_bg,
                            border: `1.5px solid ${
                              snapshotDraggable.isDragging
                                ? "#14b8a6"
                                : isDark
                                ? "rgba(20, 184, 166, 0.3)"
                                : "rgba(20, 184, 166, 0.25)"
                            }`,
                            borderRadius: 2,
                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                            boxShadow: snapshotDraggable.isDragging
                              ? isDark
                                ? "0 8px 16px -4px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(20, 184, 166, 0.3)"
                                : "0 8px 16px -4px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(20, 184, 166, 0.2)"
                              : "none",
                            transform: snapshotDraggable.isDragging
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
                            checked={selectedActive.includes(section.id)}
                            onChange={() => handleSelectActive(section.id)}
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
                            {...providedDraggable.dragHandleProps}
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
  );
}
