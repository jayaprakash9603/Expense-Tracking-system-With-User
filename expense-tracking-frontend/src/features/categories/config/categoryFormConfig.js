import {
  createCategory,
  updateCategory,
  fetchCategoryById,
  fetchCategoryExpenses,
} from "../../../Redux/Category/categoryActions";
import { getExpensesAction } from "../../../Redux/Expenses/expense.action";
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

export const categoryFormConfig = {
  entityName: "Category",
  createTitle: "New Category",
  pathPrefix: "/category-flow",

  buildRedirectPaths: (isFlow) => ({
    buildFriendPath: (fid) =>
      isFlow ? `/category-flow/${fid}` : `/friends/expenses/${fid}`,
    selfPath: isFlow ? "/category-flow" : "/friends/expenses",
    defaultPath: isFlow ? "/category-flow" : "/friends/expenses",
  }),

  initialFormData: {
    name: "",
    description: "",
    type: "Expense",
    color: DEFAULT_CATEGORY_COLOR,
    isGlobal: false,
    selectedExpenses: [],
    selectedIconKey: null,
  },

  validationRules: {
    name: (v) => {
      if (!v?.trim()) return "Category name is required";
      if (v.length > 50) return "Category name must be less than 50 characters";
      return null;
    },
    description: (v) =>
      v && v.length > 200
        ? "Description must be less than 200 characters"
        : null,
  },

  namePlaceholder: "Enter category name",
  descriptionPlaceholder: "Enter description",
  typePlaceholder: "Select type",
  additionalFields: [],

  typeOptions: CATEGORY_TYPES,
  colorOptions: CATEGORY_COLORS,
  iconCategories: CATEGORY_EMOJIS,
  defaultEmoji: DEFAULT_CATEGORY_EMOJI,

  globalCheckboxLabel:
    "Make this a global category (available to all users)",
  showExpenseSection: true,

  onCreateMount: (dispatch, friendId) => {
    dispatch(getExpensesAction("desc", friendId || ""));
  },

  createAction: (dispatch, payload, friendId) =>
    dispatch(createCategory(payload, friendId || "")),

  updateAction: (dispatch, id, payload, friendId) =>
    dispatch(updateCategory(id, payload, friendId || "")),

  fetchAction: async (dispatch, id, friendId) => {
    await dispatch(fetchCategoryById(id, friendId || ""));
    await dispatch(fetchCategoryExpenses(id, 1, 1000, friendId || ""));
  },

  fetchExpensesAction: (dispatch, id, friendId) =>
    dispatch(fetchCategoryExpenses(id, 1, 1000, friendId || "")),

  selectEditData: (state) => state.categories?.currentCategory,
  selectExpenses: (state) => state.categories?.categoryExpenses,
  selectCreateExpenses: (state) => state.expenses?.expenses,

  mapResponseToFormData: (category, userId) => {
    if (!category) return null;
    return {
      name: category.name || "",
      description: category.description || "",
      type: category.type || "Expense",
      color: category.color || DEFAULT_CATEGORY_COLOR,
      isGlobal: category.global || false,
      selectedExpenses: category.expenseIds?.[userId] || [],
      selectedIconKey: category.icon || null,
    };
  },

  buildSubmitPayload: (formData, id, friendId, userId, extras) => {
    const isEdit = !!id;
    const iconToUse = formData.selectedIconKey || DEFAULT_CATEGORY_EMOJI;

    let expenseIdValues;
    if (isEdit) {
      expenseIdValues = (extras.localExpenses || [])
        .filter((e) => e.includeInBudget)
        .map((e) => e.id);
    } else {
      expenseIdValues = formData.selectedExpenses || [];
    }

    return {
      id: isEdit ? parseInt(id) : null,
      name: formData.name,
      description: formData.description,
      type: formData.type || null,
      icon: iconToUse,
      color: formData.color || "",
      expenseIds: {
        [friendId || userId]: expenseIdValues,
      },
      userIds: isEdit ? extras.editData?.userIds || [] : [],
      editUserIds: isEdit ? extras.editData?.editUserIds || [] : [],
      global: formData.isGlobal,
    };
  },

  containerStyleBuilder: (colors, formData) => ({
    "--pm-text-primary": colors.primary_text,
    "--pm-text-secondary": colors.secondary_text,
    "--pm-text-tertiary": colors.secondary_text,
    "--pm-bg-primary": colors.active_bg,
    "--pm-bg-secondary": colors.secondary_bg,
    "--pm-border-color": colors.border_color,
    "--pm-accent-color": formData.color || colors.primary_accent,
    "--pm-hover-bg": colors.hover_bg,
    "--pm-scrollbar-thumb": formData.color || colors.primary_accent,
    "--pm-scrollbar-track": colors.secondary_bg,
  }),

  successRedirectDelay: 2000,
  LoadingSkeleton: CategoryEditSkeleton,
  renderErrorFallback: null,
};
