import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";

export function useEntityForm({
  mode = "create",
  entityId = null,
  model = {},
  validator = null,
  transformer = {},
  createAction = null,
  updateAction = null,
  fetchAction = null,
  onSuccess = null,
  onError = null,
}) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ ...model });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (mode === "edit" && entityId && fetchAction) {
      setIsLoading(true);
      dispatch(fetchAction(entityId)).then((result) => {
        setIsLoading(false);
        if (result?.success && result.data) {
          const transformed = transformer?.fromApi
            ? transformer.fromApi(result.data)
            : result.data;
          setFormData(transformed);
        }
      });
    }
  }, [mode, entityId, fetchAction, dispatch]);

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setIsDirty(true);
  }, []);

  const setFieldValues = useCallback((values) => {
    setFormData((prev) => ({ ...prev, ...values }));
    setIsDirty(true);
  }, []);

  const validate = useCallback(() => {
    if (!validator) return true;
    const result = validator(formData);
    if (!result.valid) {
      setErrors(result.errors);
      return false;
    }
    setErrors({});
    return true;
  }, [validator, formData]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return { success: false };

    setIsSubmitting(true);
    const payload = transformer?.toApi ? transformer.toApi(formData) : formData;

    try {
      let result;
      if (mode === "edit" && updateAction) {
        result = await dispatch(updateAction(entityId, payload));
      } else if (createAction) {
        result = await dispatch(createAction(payload));
      }

      setIsSubmitting(false);

      if (result?.success) {
        setIsDirty(false);
        onSuccess?.(result.data);
      } else {
        onError?.(result?.error);
      }

      return result;
    } catch (err) {
      setIsSubmitting(false);
      onError?.(err);
      return { success: false, error: err };
    }
  }, [validate, formData, mode, entityId, createAction, updateAction, transformer, dispatch, onSuccess, onError]);

  const reset = useCallback(() => {
    setFormData({ ...model });
    setErrors({});
    setIsDirty(false);
  }, [model]);

  return {
    formData,
    errors,
    isSubmitting,
    isLoading,
    isDirty,
    handleChange,
    setFieldValues,
    handleSubmit,
    validate,
    reset,
    setFormData,
    setErrors,
  };
}

export default useEntityForm;
