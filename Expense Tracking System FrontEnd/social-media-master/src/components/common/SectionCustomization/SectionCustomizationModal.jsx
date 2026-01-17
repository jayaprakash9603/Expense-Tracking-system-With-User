import React from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { Dialog, DialogContent, Box, Fade } from "@mui/material";
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
      />

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
        <StatisticsChips
          activeCount={activeSections.length}
          availableCount={availableSections.length}
          isDark={isDark}
          labels={{
            active: mergedLabels.active,
            available: mergedLabels.available,
          }}
        />

        {open && localSections.length > 0 && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Box sx={{ display: "flex", gap: 3, flex: 1, minHeight: 0, pb: 3 }}>
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
      />
    </Dialog>
  );
};

export default SectionCustomizationModal;
