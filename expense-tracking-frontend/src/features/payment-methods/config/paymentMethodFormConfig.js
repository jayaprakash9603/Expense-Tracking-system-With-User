import React from "react";
import { Button, Typography } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import {
  createPaymentMethod,
  updatePaymentMethod,
  fetchPaymentMethodByTargetId,
} from "../../../Redux/Payment Method/paymentMethod.action";
import { fetchUncategorizedExpenses } from "../../../Redux/Category/categoryActions";
import {
  DEFAULT_CATEGORY_COLOR,
  CATEGORY_COLORS,
} from "../../../components/constants/categoryColors";
import {
  CATEGORY_EMOJIS,
  DEFAULT_CATEGORY_EMOJI,
  CATEGORY_TYPES,
} from "../../../components/constants/CategoryEmojis";
import CategoryEditSkeleton from "../../../components/Loaders/CategoryEditSkeleton";

const digitsOnlyHandler = (baseHandler) => (e) => {
  if (/^\d*$/.test(e.target.value)) {
    baseHandler(e);
  }
};

export const paymentMethodFormConfig = {
  entityName: "Payment Method",
  createTitle: "Payment Method",
  pathPrefix: "/payment-method",

  buildRedirectPaths: (isFlow) => ({
    buildFriendPath: (fid) =>
      isFlow ? `/payment-method/${fid}` : `/friends/expenses/${fid}`,
    selfPath: isFlow ? "/payment-method" : "/friends/expenses",
    defaultPath: isFlow ? "/payment-method" : "/friends/expenses",
  }),

  initialFormData: {
    name: "",
    description: "",
    type: "Expense",
    color: DEFAULT_CATEGORY_COLOR,
    isGlobal: false,
    selectedIconKey: null,
    amount: "",
  },

  validationRules: {
    name: (v) => {
      if (!v?.trim()) return "Payment method name is required";
      if (v.length > 50)
        return "Payment method name must be less than 50 characters";
      return null;
    },
    amount: (v) =>
      !v || isNaN(v) ? "Amount is required and must be a number" : null,
    description: (v) =>
      v && v.length > 200
        ? "Description must be less than 200 characters"
        : null,
  },

  namePlaceholder: "Enter payment method name",
  descriptionPlaceholder: "Enter description",
  typePlaceholder: "Select type",

  additionalFields: [
    {
      name: "amount",
      placeholder: "Enter amount",
      required: true,
      icon: <AttachMoneyIcon />,
      buildOnChange: (baseHandler) => digitsOnlyHandler(baseHandler),
    },
  ],

  typeOptions: CATEGORY_TYPES,
  colorOptions: CATEGORY_COLORS,
  iconCategories: CATEGORY_EMOJIS,
  defaultEmoji: DEFAULT_CATEGORY_EMOJI,

  globalCheckboxLabel:
    "Make this a global payment method (available to all users)",
  showExpenseSection: false,

  onCreateMount: (dispatch, friendId) => {
    dispatch(fetchUncategorizedExpenses(friendId || ""));
  },

  createAction: (dispatch, payload, friendId) =>
    dispatch(createPaymentMethod(payload, friendId || "")),

  updateAction: (dispatch, id, payload, friendId) =>
    dispatch(updatePaymentMethod(id, payload, friendId || "")),

  fetchAction: async (dispatch, id, friendId) => {
    const response = await dispatch(
      fetchPaymentMethodByTargetId(id, friendId || ""),
    );
    return response;
  },

  selectEditData: (state) => {
    const pm = state.paymentMethods?.paymentMethod;
    return pm || null;
  },

  mapResponseToFormData: (paymentMethod) => {
    if (!paymentMethod) return null;
    return {
      name: paymentMethod.name || "",
      description: paymentMethod.description || "",
      type: paymentMethod.type || "expense",
      amount: paymentMethod.amount?.toString() || "0",
      color: paymentMethod.color || DEFAULT_CATEGORY_COLOR,
      isGlobal: paymentMethod.global || paymentMethod.isGlobal || false,
      selectedIconKey: paymentMethod.icon || null,
    };
  },

  buildSubmitPayload: (formData, id) => {
    const isEdit = !!id;
    const iconToUse = formData.selectedIconKey || DEFAULT_CATEGORY_EMOJI;
    return {
      id: isEdit ? parseInt(id) : null,
      name: formData.name,
      description: formData.description,
      type: formData.type || null,
      amount: parseInt(formData.amount) || 0,
      icon: iconToUse,
      color: formData.color || "",
      userIds: [],
      editUserIds: [],
      global: formData.isGlobal,
    };
  },

  containerStyleBuilder: null,

  getSubmitErrorMessage: (error, isEditMode) => {
    if (!isEditMode && error?.response?.status === 409) {
      return "Payment method already exists. You cannot create another.";
    }
    return null;
  },

  successRedirectDelay: 200,
  LoadingSkeleton: CategoryEditSkeleton,

  renderErrorFallback: (errorMessage, handleClose, colors) => (
    <div style={{ backgroundColor: colors.primary_bg }}>
      <div
        className="flex lg:w-[calc(100vw-370px)] flex-col justify-center items-center sm:w-full"
        style={{
          height: "calc(100vh - 100px)",
          backgroundColor: colors.secondary_bg,
          borderRadius: "8px",
          border: `1px solid ${colors.border_color}`,
          padding: "16px",
        }}
      >
        <Typography sx={{ color: "red", fontSize: "1.2rem", mb: 2 }}>
          {errorMessage}
        </Typography>
        <Button
          onClick={handleClose}
          variant="contained"
          sx={{
            bgcolor: colors.button_bg,
            color: colors.button_text,
            "&:hover": { bgcolor: colors.button_hover },
          }}
        >
          Go Back
        </Button>
      </div>
    </div>
  ),
};
