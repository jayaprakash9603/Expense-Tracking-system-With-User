import React from "react";
import { Droppable } from "react-beautiful-dnd";
import { Box, Typography } from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import SectionItem from "./SectionItem";
import { getDroppableStyles } from "./customizationStyles";

/**
 * DroppableColumn - Reusable droppable area for sections
 * Follows Open/Closed: Can be extended via props without modification
 */
const DroppableColumn = ({
  droppableId,
  sections,
  selectedIds,
  onSelect,
  onToggle,
  isActive,
  colors,
  isDark,
  title,
  subtitle,
  emptyIcon: EmptyIcon,
  emptyMessage,
  typeLabels,
  isMobile = false,
  isTablet = false,
}) => {
  const variant = isActive ? "active" : "available";
  const borderColor = isActive
    ? isDark
      ? "rgba(20, 184, 166, 0.4)"
      : "rgba(20, 184, 166, 0.3)"
    : colors.border_color;

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: isMobile ? "100%" : isTablet ? 300 : 380,
        maxWidth: isMobile ? "100%" : "none",
        display: "flex",
        flexDirection: "column",
        height: isMobile ? "auto" : "100%",
        minHeight: isMobile ? 180 : "auto",
        maxHeight: isMobile ? 280 : "none",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          mb: isMobile ? 1 : 2,
          pb: isMobile ? 1 : 1.5,
          borderBottom: `2px solid ${borderColor}`,
          flexShrink: 0,
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight="700"
          sx={{
            color: isActive
              ? isDark
                ? "#14b8a6"
                : "#0d9488"
              : colors.primary_text,
            fontSize: isMobile ? "0.8rem" : "0.9rem",
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          {title}
        </Typography>
        {!isMobile && (
          <Typography
            variant="caption"
            sx={{ color: colors.secondary_text, fontSize: "0.7rem" }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <Box
            {...provided.droppableProps}
            ref={provided.innerRef}
            sx={getDroppableStyles(isDark, snapshot.isDraggingOver, variant)}
          >
            {sections.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 6,
                  color: colors.secondary_text,
                }}
              >
                {EmptyIcon ? (
                  <EmptyIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                ) : isActive ? (
                  <VisibilityOffIcon
                    sx={{ fontSize: 48, opacity: 0.3, mb: 1 }}
                  />
                ) : (
                  <VisibilityIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                )}
                <Typography variant="body2">
                  {emptyMessage ||
                    (isActive
                      ? "Drag sections here to activate"
                      : "All sections are active!")}
                </Typography>
              </Box>
            ) : (
              sections.map((section, index) => (
                <SectionItem
                  key={section.id}
                  section={section}
                  index={index}
                  isSelected={selectedIds.includes(section.id)}
                  onSelect={onSelect}
                  onToggle={onToggle}
                  isActive={isActive}
                  colors={colors}
                  isDark={isDark}
                  typeLabels={typeLabels}
                />
              ))
            )}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Box>
  );
};

export default React.memo(DroppableColumn);
