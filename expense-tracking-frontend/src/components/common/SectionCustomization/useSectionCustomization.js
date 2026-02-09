import { useState, useEffect, useCallback } from "react";

/**
 * useSectionCustomization
 * Reusable hook for managing section visibility, selection, and reordering.
 * Follows Single Responsibility: Only handles state logic, no UI concerns.
 */
const useSectionCustomization = ({
  sections,
  open,
  onSave,
  onReset,
  onClose,
}) => {
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

  const activeSections = localSections.filter((s) => s.visible);
  const availableSections = localSections.filter((s) => !s.visible);

  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    setLocalSections((current) => {
      const active = [...current.filter((s) => s.visible)];
      const available = [...current.filter((s) => !s.visible)];

      if (source.droppableId !== destination.droppableId) {
        let movedSection;
        if (source.droppableId === "available-sections") {
          movedSection = available[source.index];
          available.splice(source.index, 1);
          movedSection.visible = true;
          active.splice(destination.index, 0, movedSection);
        } else {
          movedSection = active[source.index];
          active.splice(source.index, 1);
          movedSection.visible = false;
          available.splice(destination.index, 0, movedSection);
        }
      } else {
        if (source.droppableId === "active-sections") {
          const [reorderedItem] = active.splice(source.index, 1);
          active.splice(destination.index, 0, reorderedItem);
        } else {
          const [reorderedItem] = available.splice(source.index, 1);
          available.splice(destination.index, 0, reorderedItem);
        }
      }

      return [...active, ...available];
    });
  }, []);

  const handleToggle = useCallback((sectionId) => {
    setLocalSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? { ...section, visible: !section.visible }
          : section
      )
    );
  }, []);

  const handleSelectAvailable = useCallback((sectionId) => {
    setSelectedAvailable((current) =>
      current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId]
    );
  }, []);

  const handleSelectActive = useCallback((sectionId) => {
    setSelectedActive((current) =>
      current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId]
    );
  }, []);

  const moveSelectedToActive = useCallback(() => {
    if (selectedAvailable.length === 0) return;
    setLocalSections((current) =>
      current.map((section) =>
        selectedAvailable.includes(section.id)
          ? { ...section, visible: true }
          : section
      )
    );
    setSelectedAvailable([]);
  }, [selectedAvailable]);

  const moveSelectedToAvailable = useCallback(() => {
    if (selectedActive.length === 0) return;
    setLocalSections((current) =>
      current.map((section) =>
        selectedActive.includes(section.id)
          ? { ...section, visible: false }
          : section
      )
    );
    setSelectedActive([]);
  }, [selectedActive]);

  const moveAllToActive = useCallback(() => {
    setLocalSections((current) =>
      current.map((section) => ({ ...section, visible: true }))
    );
    setSelectedAvailable([]);
  }, []);

  const moveAllToAvailable = useCallback(() => {
    setLocalSections((current) =>
      current.map((section) => ({ ...section, visible: false }))
    );
    setSelectedActive([]);
  }, []);

  const handleSave = useCallback(() => {
    onSave?.(localSections);
    onClose?.();
  }, [localSections, onSave, onClose]);

  const handleReset = useCallback(() => {
    onReset?.();
    onClose?.();
  }, [onReset, onClose]);

  return {
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
  };
};

export default useSectionCustomization;
