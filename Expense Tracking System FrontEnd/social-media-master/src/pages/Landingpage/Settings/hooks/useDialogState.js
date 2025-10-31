import { useState, useCallback } from "react";

/**
 * Custom hook for managing dialog states
 * Follows Single Responsibility Principle - handles only dialog state
 * Implements DRY principle - reusable dialog management
 */
export const useDialogState = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const openDeleteDialog = useCallback(() => setDeleteDialogOpen(true), []);
  const closeDeleteDialog = useCallback(() => setDeleteDialogOpen(false), []);
  const openPasswordDialog = useCallback(() => setPasswordDialogOpen(true), []);
  const closePasswordDialog = useCallback(
    () => setPasswordDialogOpen(false),
    []
  );

  return {
    deleteDialogOpen,
    passwordDialogOpen,
    openDeleteDialog,
    closeDeleteDialog,
    openPasswordDialog,
    closePasswordDialog,
    setDeleteDialogOpen,
    setPasswordDialogOpen,
  };
};
