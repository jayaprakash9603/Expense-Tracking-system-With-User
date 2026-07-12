import { useState, useEffect, useCallback } from "react";

export function useSectionCustomization({ sections, open, onSave, onReset, onClose }) {
  const [localSections, setLocalSections] = useState(sections);
  const [selectedAvailable, setSelectedAvailable] = useState([]);
  const [selectedActive, setSelectedActive] = useState([]);

  useEffect(() => {
    if (open) {
      setLocalSections(sections);
      setSelectedAvailable([]);
      setSelectedActive([]);
    }
  }, [open, sections]);

  const activeSections = localSections.filter((s) => s.visible);
  const availableSections = localSections.filter((s) => !s.visible);

  const handleToggle = useCallback((sectionId) => {
    setLocalSections((current) =>
      current.map((s) => (s.id === sectionId ? { ...s, visible: !s.visible } : s))
    );
  }, []);

  const handleReorder = useCallback((sectionId, direction) => {
    setLocalSections((current) => {
      const active = current.filter((s) => s.visible);
      const inactive = current.filter((s) => !s.visible);
      const idx = active.findIndex((s) => s.id === sectionId);
      if (idx < 0) return current;

      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= active.length) return current;

      const reordered = [...active];
      [reordered[idx], reordered[targetIdx]] = [reordered[targetIdx], reordered[idx]];
      return [...reordered, ...inactive];
    });
  }, []);

  const handleSelectAvailable = useCallback((sectionId) => {
    setSelectedAvailable((cur) =>
      cur.includes(sectionId) ? cur.filter((id) => id !== sectionId) : [...cur, sectionId]
    );
  }, []);

  const handleSelectActive = useCallback((sectionId) => {
    setSelectedActive((cur) =>
      cur.includes(sectionId) ? cur.filter((id) => id !== sectionId) : [...cur, sectionId]
    );
  }, []);

  const moveSelectedToActive = useCallback(() => {
    if (!selectedAvailable.length) return;
    setLocalSections((cur) =>
      cur.map((s) => (selectedAvailable.includes(s.id) ? { ...s, visible: true } : s))
    );
    setSelectedAvailable([]);
  }, [selectedAvailable]);

  const moveSelectedToAvailable = useCallback(() => {
    if (!selectedActive.length) return;
    setLocalSections((cur) =>
      cur.map((s) => (selectedActive.includes(s.id) ? { ...s, visible: false } : s))
    );
    setSelectedActive([]);
  }, [selectedActive]);

  const moveAllToActive = useCallback(() => {
    setLocalSections((cur) => cur.map((s) => ({ ...s, visible: true })));
    setSelectedAvailable([]);
  }, []);

  const moveAllToAvailable = useCallback(() => {
    setLocalSections((cur) => cur.map((s) => ({ ...s, visible: false })));
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
    handleToggle,
    handleReorder,
    handleSelectAvailable,
    handleSelectActive,
    moveSelectedToActive,
    moveSelectedToAvailable,
    moveAllToActive,
    moveAllToAvailable,
    handleSave,
    handleReset,
  };
}

export default useSectionCustomization;
