import React from "react";
import { Draggable } from "react-beautiful-dnd";
import {
  Box,
  Checkbox,
  IconButton,
  Typography,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  DragIndicator as DragIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { getDraggableItemStyles, getChipStyles } from "./customizationStyles";

/**
 * SectionItem - Single draggable section item
 * Follows Single Responsibility: Only renders one section item
 */
const SectionItem = ({
  section,
  index,
  isSelected,
  onSelect,
  onToggle,
  isActive,
  colors,
  isDark,
  typeLabels = { full: "Full", half: "Half", bottom: "Bottom" },
}) => {
  const getTypeLabel = (type) => typeLabels[type] || type;

  return (
    <Draggable key={section.id} draggableId={section.id} index={index}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{
            ...getDraggableItemStyles(
              colors,
              isDark,
              snapshot.isDragging,
              isActive
            ),
            cursor: "grab",
            "&:active": { cursor: "grabbing" },
          }}
        >
          <Checkbox
            checked={isSelected}
            onChange={() => onSelect(section.id)}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            sx={{
              padding: 0,
              color: isActive
                ? isDark
                  ? "rgba(20, 184, 166, 0.5)"
                  : "rgba(20, 184, 166, 0.7)"
                : colors.secondary_text,
              "&.Mui-checked": { color: "#14b8a6" },
            }}
          />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <DragIcon
              fontSize="small"
              sx={{ color: isActive ? "#14b8a6" : colors.secondary_text }}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
            <Typography
              variant="body2"
              fontWeight="600"
              sx={{
                color: isActive ? colors.primary_text : colors.secondary_text,
                fontSize: "0.875rem",
                lineHeight: 1.3,
              }}
            >
              {section.name}
            </Typography>
          </Box>
          <Chip
            label={getTypeLabel(section.type)}
            size="small"
            sx={getChipStyles(isDark, "type")}
          />
          <Tooltip
            title={isActive ? "Deactivate section" : "Activate section"}
            arrow
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggle(section.id);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              sx={{
                padding: 0.5,
                color: isActive
                  ? isDark
                    ? "#4ade80"
                    : "#16a34a"
                  : colors.secondary_text,
                "&:hover": {
                  color: isActive
                    ? colors.secondary_text
                    : isDark
                    ? "#4ade80"
                    : "#16a34a",
                  backgroundColor: isActive
                    ? isDark
                      ? "rgba(156, 163, 175, 0.1)"
                      : "rgba(107, 114, 128, 0.08)"
                    : isDark
                    ? "rgba(74, 222, 128, 0.1)"
                    : "rgba(34, 197, 94, 0.08)",
                },
              }}
            >
              {isActive ? (
                <VisibilityIcon sx={{ fontSize: 18 }} />
              ) : (
                <VisibilityOffIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Draggable>
  );
};

export default React.memo(SectionItem);
