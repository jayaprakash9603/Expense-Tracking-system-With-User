import { useState, useCallback } from "react";

export function useEntityFlow({
  listHook,
  formHook = null,
  deleteAction = null,
  dispatch = null,
}) {
  const [view, setView] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openCreate = useCallback(() => {
    setSelectedId(null);
    setView("create");
    formHook?.reset?.();
  }, [formHook]);

  const openEdit = useCallback((id) => {
    setSelectedId(id);
    setView("edit");
  }, []);

  const openDetail = useCallback((id) => {
    setSelectedId(id);
    setView("detail");
  }, []);

  const backToList = useCallback(() => {
    setSelectedId(null);
    setView("list");
    listHook?.refresh?.();
  }, [listHook]);

  const confirmDelete = useCallback((item) => {
    setDeleteTarget(item);
    setShowDeleteConfirm(true);
  }, []);

  const executeDelete = useCallback(async () => {
    if (!deleteTarget || !deleteAction || !dispatch) return;
    const result = await dispatch(deleteAction(deleteTarget.id));
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
    if (result?.success) listHook?.refresh?.();
    return result;
  }, [deleteTarget, deleteAction, dispatch, listHook]);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  }, []);

  return {
    view,
    setView,
    selectedId,
    openCreate,
    openEdit,
    openDetail,
    backToList,
    showDeleteConfirm,
    deleteTarget,
    confirmDelete,
    executeDelete,
    cancelDelete,
  };
}

export default useEntityFlow;
