import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getProfileAction } from "../../../Redux/Auth/auth.action";
import { Box, Button, Grid, Snackbar, Alert, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { ExpenseListTable } from "../../../components/common/ExpenseListTable/ExpenseListTable";
import { useStandardExpenseColumns } from "../../../features/expenses/hooks/useStandardExpenseColumns";
import {
  CATEGORY_COLORS,
} from "../../../components/constants/categoryColors";
import {
  CATEGORY_EMOJIS,
  DEFAULT_CATEGORY_EMOJI,
  CATEGORY_TYPES,
} from "../../../components/constants/CategoryEmojis";
import useFormPage from "../../form/hooks/useFormPage";
import useFormState from "../../form/hooks/useFormState";
import FormPageShell from "../../form/components/FormPageShell";
import SubmitButton from "../../form/components/SubmitButton";
import EntityFormLayout from "./EntityFormLayout";
import GlobalCheckbox from "./GlobalCheckbox";

export default function EntityFormPage({
  mode: modeProp,
  config,
  onClose: onCloseProp,
  onEntityCreated,
}) {
  const location = useLocation();
  const isFlowPath = location.pathname.startsWith(config.pathPrefix);

  const redirectPaths = config.buildRedirectPaths(isFlowPath);
  const { colors, navigate, dispatch, params, friendId, hasWriteAccess } =
    useFormPage({ redirectConfig: redirectPaths });

  const entityId = params?.id;
  const isEditMode = modeProp === "edit" && !!entityId;

  const {
    formData,
    setFormData,
    errors,
    setErrors,
    handleInputChange,
    setFieldValue,
    validate,
  } = useFormState(config.initialFormData);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [showExpenses, setShowExpenses] = useState(false);
  const [, setLoadingExpenses] = useState(false);
  const [localExpenses, setLocalExpenses] = useState([]);

  const userId = useSelector((state) => state.auth?.user?.id);
  const reduxState = useSelector((state) => state);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) dispatch(getProfileAction(token));
  }, [dispatch]);

  useEffect(() => {
    if (!isEditMode) {
      config.onCreateMount?.(dispatch, friendId);
      return;
    }

    const fetchData = async () => {
      try {
        setInitialLoading(true);
        await config.fetchAction(dispatch, entityId, friendId);
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          fetch: `Failed to load ${config.entityName.toLowerCase()} data.`,
        }));
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isEditMode, entityId, friendId]);

  const editData = config.selectEditData?.(reduxState);

  useEffect(() => {
    if (!isEditMode || !editData) return;
    const mapped = config.mapResponseToFormData(editData, userId);
    if (mapped) {
      setFormData(mapped);
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData, userId, isEditMode, setFormData, setErrors]);

  useEffect(() => {
    if (!isEditMode || !config.showExpenseSection) return;
    const expenses = config.selectExpenses?.(reduxState);
    if (expenses) setLocalExpenses(expenses);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, reduxState]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasWriteAccess) return;
    if (!validate(config.validationRules)) return;

    const extras = {
      localExpenses,
      editData,
    };

    const payload = config.buildSubmitPayload(
      formData,
      entityId,
      friendId,
      userId,
      extras,
    );

    setIsSubmitting(true);
    setErrors({});

    try {
      if (isEditMode) {
        await config.updateAction(dispatch, entityId, payload, friendId);
      } else {
        await config.createAction(dispatch, payload, friendId);
      }
      setShowSuccessMessage(true);
      if (onEntityCreated) onEntityCreated();
      setTimeout(() => navigate(-1), config.successRedirectDelay ?? 2000);
    } catch (error) {
      const fallback = isEditMode
        ? `Failed to update ${config.entityName.toLowerCase()}.`
        : `Failed to create ${config.entityName.toLowerCase()}.`;
      const errorMessage =
        config.getSubmitErrorMessage?.(error, isEditMode) ||
        error.message ||
        fallback;
      setErrors((prev) => ({ ...prev, submit: errorMessage }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (onCloseProp) {
      onCloseProp();
    } else {
      navigate(-1);
    }
  };

  const handleShowExpenses = () => {
    if (isEditMode && config.fetchExpensesAction) {
      setLoadingExpenses(true);
      config
        .fetchExpensesAction(dispatch, entityId, friendId)
        .finally(() => setLoadingExpenses(false));
    }
    setShowExpenses((prev) => !prev);
  };

  const standardColumns = useStandardExpenseColumns(null, navigate, {
    includeActions: false,
  });

  const expenseColumns = useMemo(() => {
    const typeCol = {
      key: "type",
      label: "Type",
      width: "100px",
      value: (row) => row.expense?.type || row.type || "-",
      render: (v) => v,
    };
    const paymentCol = {
      key: "paymentMethod",
      label: "Payment Method",
      width: "140px",
      value: (row) => row.expense?.paymentMethod || row.paymentMethod || "-",
      render: (v) => v,
    };
    const cols = [...standardColumns];
    const commentsIdx = cols.findIndex((c) => c.key === "comments");
    if (commentsIdx >= 0) {
      cols.splice(commentsIdx, 0, typeCol, paymentCol);
    } else {
      cols.push(typeCol, paymentCol);
    }
    return cols;
  }, [standardColumns]);

  const expenseRows = isEditMode
    ? localExpenses
    : config.selectCreateExpenses?.(reduxState) || [];

  const selectedExpenseIds = isEditMode
    ? (localExpenses || [])
        .filter((e) => e.includeInBudget)
        .map((e, idx) => e.id ?? idx)
    : formData.selectedExpenses || [];

  const handleExpenseSelectionChange = (newIds) => {
    if (isEditMode) {
      const newIdSet = new Set(newIds);
      setLocalExpenses((prev) =>
        prev.map((e, idx) => ({
          ...e,
          includeInBudget: newIdSet.has(e.id ?? idx),
        })),
      );
    } else {
      setFormData((prev) => ({ ...prev, selectedExpenses: newIds }));
    }
  };

  const containerStyle = config.containerStyleBuilder?.(colors, formData);

  const additionalFields = useMemo(
    () =>
      (config.additionalFields || []).map((field) => ({
        ...field,
        onChange: field.buildOnChange
          ? field.buildOnChange(handleInputChange)
          : undefined,
      })),
    [config.additionalFields, handleInputChange],
  );

  const title = isEditMode
    ? `Edit ${config.entityName}`
    : `Create ${config.createTitle || `New ${config.entityName}`}`;
  const submitLabel = isEditMode
    ? `Update ${config.entityName}`
    : `Create ${config.entityName}`;
  const loadingLabel = isEditMode ? "Updating..." : "Creating...";
  const successMsg = `${config.entityName} ${isEditMode ? "updated" : "created"} successfully!`;
  const globalLabel =
    config.globalCheckboxLabel ||
    `Make this a global ${config.entityName.toLowerCase()} (available to all users)`;
  const expenseToggleLabel = showExpenses
    ? "Hide Expenses"
    : isEditMode
      ? "View Expenses"
      : "Link Expenses";

  if (initialLoading && config.LoadingSkeleton) {
    const Skeleton = config.LoadingSkeleton;
    return <Skeleton />;
  }

  if (config.renderErrorFallback && errors.submit && isEditMode && !formData.name) {
    return config.renderErrorFallback(errors.submit, handleClose, colors);
  }

  return (
    <div style={{ backgroundColor: colors.primary_bg }}>
      <FormPageShell
        title={title}
        onClose={handleClose}
        colors={colors}
        titleClassName="font-extrabold text-2xl sm:text-3xl"
        containerStyle={containerStyle}
      >
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <EntityFormLayout
            formData={formData}
            onChange={handleInputChange}
            onTypeChange={(e, newValue) => setFieldValue("type", newValue)}
            onColorChange={(color) => setFieldValue("color", color)}
            onIconSelect={(icon) => setFieldValue("selectedIconKey", icon)}
            errors={errors}
            colors={colors}
            typeOptions={config.typeOptions ?? CATEGORY_TYPES}
            colorOptions={config.colorOptions ?? CATEGORY_COLORS}
            iconCategories={config.iconCategories ?? CATEGORY_EMOJIS}
            defaultEmoji={config.defaultEmoji ?? DEFAULT_CATEGORY_EMOJI}
            namePlaceholder={config.namePlaceholder}
            descriptionPlaceholder={config.descriptionPlaceholder}
            typePlaceholder={config.typePlaceholder}
            additionalFields={additionalFields}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <GlobalCheckbox
                    checked={formData.isGlobal}
                    onChange={handleInputChange}
                    label={globalLabel}
                    accentColor={formData.color || colors.primary_accent}
                    colors={colors}
                  />
                  {config.showExpenseSection && (
                    <Button
                      variant="outlined"
                      onClick={handleShowExpenses}
                      startIcon={showExpenses ? <CloseIcon /> : <AddIcon />}
                      sx={{
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        color: formData.color,
                        borderColor: formData.color,
                        "&:hover": {
                          borderColor: formData.color,
                          backgroundColor: `${formData.color}33`,
                        },
                      }}
                    >
                      {expenseToggleLabel}
                    </Button>
                  )}
                </Box>
              </Grid>

              {config.showExpenseSection && showExpenses && (
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Box sx={{ width: "100%", overflow: "hidden" }}>
                    <ExpenseListTable
                      rows={expenseRows}
                      columns={expenseColumns}
                      enableSelection
                      selectedRows={selectedExpenseIds}
                      onSelectionChange={handleExpenseSelectionChange}
                      showPagination
                    />
                  </Box>
                </Grid>
              )}
            </Grid>
          </EntityFormLayout>

          {errors.submit && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.submit}
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 3,
              gap: 2,
            }}
          >
            {hasWriteAccess && (
              <SubmitButton
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e);
                }}
                label={submitLabel}
                loadingLabel={loadingLabel}
                isSubmitting={isSubmitting}
                colors={colors}
              />
            )}
          </Box>
        </Box>

        <Snackbar
          open={showSuccessMessage}
          autoHideDuration={2000}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          onClose={() => setShowSuccessMessage(false)}
        >
          <Alert
            severity="success"
            sx={{
              width: "100%",
              backgroundColor: formData.color,
              color: "black",
              "& .MuiAlert-icon": { color: "black" },
            }}
          >
            {successMsg}
          </Alert>
        </Snackbar>
      </FormPageShell>
    </div>
  );
}
