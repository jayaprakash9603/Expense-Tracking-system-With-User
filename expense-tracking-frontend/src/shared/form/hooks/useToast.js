import { useState, useCallback } from "react";

export default function useToast() {
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState("success");

  const showSuccess = useCallback((message) => {
    setToastMessage(message);
    setToastSeverity("success");
    setOpenToast(true);
  }, []);

  const showError = useCallback((message) => {
    setToastMessage(message);
    setToastSeverity("error");
    setOpenToast(true);
  }, []);

  const showWarning = useCallback((message) => {
    setToastMessage(message);
    setToastSeverity("warning");
    setOpenToast(true);
  }, []);

  const closeToast = useCallback(() => {
    setOpenToast(false);
  }, []);

  const toastProps = {
    open: openToast,
    message: toastMessage,
    severity: toastSeverity,
    anchorOrigin: { vertical: "top", horizontal: "center" },
    onClose: closeToast,
  };

  return {
    openToast,
    toastMessage,
    toastSeverity,
    showSuccess,
    showError,
    showWarning,
    closeToast,
    toastProps,
  };
}
