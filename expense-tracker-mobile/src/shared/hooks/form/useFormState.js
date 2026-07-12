import { useCallback, useEffect, useRef, useState } from "react";

export function useSyncedRef(value) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

export function useFormFields({
  getInitialForm,
  getInitialErrors,
  trackDirty = false,
  clearErrorOnChange = false,
}) {
  const [formData, setFormData] = useState(getInitialForm);
  const [errors, setErrors] = useState(getInitialErrors);
  const [isDirty, setIsDirty] = useState(false);

  const clearFieldError = useCallback((field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      return { ...prev, [field]: "" };
    });
  }, []);

  const setFieldValue = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (trackDirty) setIsDirty(true);
      if (clearErrorOnChange) clearFieldError(field);
    },
    [clearFieldError, clearErrorOnChange, trackDirty],
  );

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    isDirty,
    setIsDirty,
    setFieldValue,
    clearFieldError,
  };
}

export function useEditLoader(enabled, load, ...effectDeps) {
  const loadRef = useSyncedRef(load);
  const [isLoading, setIsLoading] = useState(() => Boolean(enabled));

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return undefined;
    }
    let cancelled = false;
    setIsLoading(true);

    void (async () => {
      await loadRef.current({
        cancelled: () => cancelled,
        setIsLoading,
      });
    })();

    return () => {
      cancelled = true;
      setIsLoading(false);
    };
  }, [enabled, ...effectDeps]);

  return isLoading;
}
