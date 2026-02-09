/**
 * useToast - Custom hook for managing toast notifications state
 *
 * Usage:
 *   const { toast, showToast, hideToast, ToastComponent } = useToast();
 *
 *   // Show a toast
 *   showToast('Operation successful!', 'success');
 *
 *   // In render:
 *   return (
 *     <>
 *       <button onClick={() => showToast('Hello!', 'info')}>Click</button>
 *       <ToastComponent />
 *     </>
 *   );
 */
import { useState, useCallback, useMemo } from "react";
import AppToast from "./AppToast";

const useToast = (defaultOptions = {}) => {
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
    title: undefined,
    ...defaultOptions,
  });

  // Show toast with message and optional severity/options
  const showToast = useCallback((message, severityOrOptions = "info") => {
    const options =
      typeof severityOrOptions === "string"
        ? { severity: severityOrOptions }
        : severityOrOptions;

    setToast((prev) => ({
      ...prev,
      open: true,
      message,
      severity: options.severity || "info",
      title: options.title,
      autoHideDuration: options.autoHideDuration,
    }));
  }, []);

  // Hide toast
  const hideToast = useCallback((event, reason) => {
    // Optionally ignore clickaway
    if (reason === "clickaway") {
      return;
    }
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  // Convenience methods for each severity
  const success = useCallback(
    (message, options = {}) =>
      showToast(message, { severity: "success", ...options }),
    [showToast],
  );

  const error = useCallback(
    (message, options = {}) =>
      showToast(message, { severity: "error", ...options }),
    [showToast],
  );

  const warning = useCallback(
    (message, options = {}) =>
      showToast(message, { severity: "warning", ...options }),
    [showToast],
  );

  const info = useCallback(
    (message, options = {}) =>
      showToast(message, { severity: "info", ...options }),
    [showToast],
  );

  // Toast component for rendering
  const ToastComponent = useMemo(
    () =>
      function ToastWrapper(props) {
        return (
          <AppToast
            open={toast.open}
            message={toast.message}
            severity={toast.severity}
            title={toast.title}
            autoHideDuration={toast.autoHideDuration || 3000}
            onClose={hideToast}
            {...props}
          />
        );
      },
    [toast, hideToast],
  );

  return {
    // State
    toast,
    isOpen: toast.open,

    // Actions
    showToast,
    hideToast,
    success,
    error,
    warning,
    info,

    // Component
    ToastComponent,
  };
};

export default useToast;
