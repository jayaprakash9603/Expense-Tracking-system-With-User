import { useState, useCallback } from "react";

export default function useFormState(initialData = {}) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  const setFieldValue = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setMultipleFields = useCallback((updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const resolved = type === "checkbox" ? checked : value;
      setFormData((prev) => ({ ...prev, [name]: resolved }));

      if (errors[name]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
    },
    [errors],
  );

  const clearFieldError = useCallback((field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const setFieldError = useCallback((field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const validate = useCallback(
    (rules) => {
      const newErrors = {};
      Object.entries(rules).forEach(([field, rule]) => {
        const value = formData[field];
        if (typeof rule === "function") {
          const msg = rule(value, formData);
          if (msg) newErrors[field] = msg;
        } else if (rule === true) {
          if (!value || (typeof value === "string" && !value.trim())) {
            newErrors[field] = true;
          }
        }
      });
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formData],
  );

  const resetForm = useCallback(
    (data) => {
      setFormData(data ?? initialData);
      setErrors({});
    },
    [initialData],
  );

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    setFieldValue,
    setMultipleFields,
    handleInputChange,
    clearFieldError,
    setFieldError,
    validate,
    resetForm,
  };
}
