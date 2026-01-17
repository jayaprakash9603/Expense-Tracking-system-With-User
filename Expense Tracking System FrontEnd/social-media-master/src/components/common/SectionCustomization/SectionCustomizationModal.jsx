import React from "react";
import { DragDropContext } from "react-beautiful-dnd";
import {
  Dialog,
  DialogContent,
  Box,
  Fade,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import { Dashboard as DashboardIcon } from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import useSectionCustomization from "./useSectionCustomization";
import CustomizationModalHeader from "./CustomizationModalHeader";
import CustomizationModalFooter from "./CustomizationModalFooter";
import StatisticsChips from "./StatisticsChips";
import DroppableColumn from "./DroppableColumn";
import BulkMoveControls from "./BulkMoveControls";
import { getDialogStyles } from "./customizationStyles";

/**
 * SectionCustomizationModal - Main reusable customization modal
 * Composes smaller components following Composition over Inheritance
 *
 * Props:
 * - open: boolean - Modal visibility
 * - onClose: () => void - Close handler
 * - sections: Array<{id, name, type, visible}> - Section configuration
 * - onSaveLayout: (sections) => void - Save handler
 * - onResetLayout: () => void - Reset handler
 *
 * Customization Props:
 * - title: string - Modal title
 * - subtitle: string - Modal subtitle
 * - icon: Component - Header icon
 * - typeLabels: {full, half, bottom} - Labels for section types
 * - labels: object - Custom labels for all text
 * - showReset: boolean - Show reset button
 * - availableTitle: string - Available column title
 * - availableSubtitle: string - Available column subtitle
 * - activeTitle: string - Active column title
 * - activeSubtitle: string - Active column subtitle
 */
const SectionCustomizationModal = ({
  open,
  onClose,
  sections,
  onSaveLayout,
  onResetLayout,
  // Customization props with defaults
  title = "Customize Layout",
  subtitle = "Drag sections between columns • Reorder active sections",
  icon: HeaderIcon = DashboardIcon,
  typeLabels = { full: "Full", half: "Half", bottom: "Bottom" },
  labels = {},
  showReset = true,
  availableTitle = "📦 Available Sections",
  availableSubtitle = "Drag sections to the right to activate",
  activeTitle = "✓ Active Sections",
  activeSubtitle = "Reorder by dragging • Remove by dragging left",
  availableEmptyMessage = "All sections are active!",
  activeEmptyMessage = "Drag sections here to activate",
}) => {
  const { colors, isDark } = useTheme();
  const muiTheme = useMuiTheme();

  // Responsive breakpoints
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm")); // < 600px
  const isTablet = useMediaQuery(muiTheme.breakpoints.between("sm", "md")); // 600-900px
  const isSmallScreen = isMobile || isTablet;

  const {
    localSections,
    activeSections,
    availableSections,
    selectedAvailable,
    selectedActive,
    handleDragEnd,
    handleToggle,
    handleSelectAvailable,
    handleSelectActive,
    moveSelectedToActive,
    moveSelectedToAvailable,
    moveAllToActive,
    moveAllToAvailable,
    handleSave,
    handleReset,
  } = useSectionCustomization({
    sections,
    open,
    onSave: onSaveLayout,
    onReset: onResetLayout,
    onClose,
  });

  const dialogStyles = getDialogStyles(colors, isDark);

  const mergedLabels = {
    save: "Save Layout",
    reset: "Reset to Default",
    cancel: "Cancel",
    active: "Active",
    available: "Available",
    moveAllToActive: "Move all to Active",
    moveSelectedToActive: "Move selected to Active",
    moveSelectedToAvailable: "Move selected to Available",
    moveAllToAvailable: "Move all to Available",
    ...labels,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      key={open ? "open" : "closed"}
      TransitionComponent={Fade}
      BackdropProps={{ sx: dialogStyles.backdrop }}
      PaperProps={{ sx: dialogStyles.paper }}
    >
      <CustomizationModalHeader
        title={title}
        subtitle={subtitle}
        icon={HeaderIcon}
        onClose={onClose}
        colors={colors}
        isDark={isDark}
        isMobile={isMobile}
      />

      <DialogContent
        sx={{
          py: 0,
          px: { xs: 1.5, sm: 2, md: 3 },
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: isMobile ? "calc(100vh - 180px)" : "calc(70vh - 120px)",
          minHeight: { xs: 300, sm: 400, md: 450 },
          maxHeight: { xs: "none", sm: 550, md: 600 },
        }}
      >
        <StatisticsChips
          activeCount={activeSections.length}
          availableCount={availableSections.length}
          isDark={isDark}
          isMobile={isMobile}
          labels={{
            active: mergedLabels.active,
            available: mergedLabels.available,
          }}
        />

        {open && localSections.length > 0 && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 2, sm: 2, md: 3 },
                flex: 1,
                minHeight: 0,
                pb: { xs: 1, sm: 2, md: 3 },
                overflow: "hidden",
                width: "100%",
              }}
            >
              <DroppableColumn
                droppableId="available-sections"
                sections={availableSections}
                selectedIds={selectedAvailable}
                onSelect={handleSelectAvailable}
                onToggle={handleToggle}
                isActive={false}
                colors={colors}
                isDark={isDark}
                title={availableTitle}
                subtitle={availableSubtitle}
                emptyMessage={availableEmptyMessage}
                typeLabels={typeLabels}
                isMobile={isMobile}
                isTablet={isTablet}
              />

              <BulkMoveControls
                onMoveAllToActive={moveAllToActive}
                onMoveSelectedToActive={moveSelectedToActive}
                onMoveSelectedToAvailable={moveSelectedToAvailable}
                onMoveAllToAvailable={moveAllToAvailable}
                selectedAvailableCount={selectedAvailable.length}
                selectedActiveCount={selectedActive.length}
                availableCount={availableSections.length}
                activeCount={activeSections.length}
                colors={colors}
                isDark={isDark}
                labels={mergedLabels}
                isMobile={isMobile}
              />

              <DroppableColumn
                droppableId="active-sections"
                sections={activeSections}
                selectedIds={selectedActive}
                onSelect={handleSelectActive}
                onToggle={handleToggle}
                isActive={true}
                colors={colors}
                isDark={isDark}
                title={activeTitle}
                subtitle={activeSubtitle}
                emptyMessage={activeEmptyMessage}
                typeLabels={typeLabels}
                isMobile={isMobile}
                isTablet={isTablet}
              />
            </Box>
          </DragDropContext>
        )}
      </DialogContent>

      <CustomizationModalFooter
        onSave={handleSave}
        onReset={handleReset}
        onCancel={onClose}
        colors={colors}
        isDark={isDark}
        showReset={showReset}
        labels={mergedLabels}
        isMobile={isMobile}
      />
    </Dialog>
  );
};

export default SectionCustomizationModal;
