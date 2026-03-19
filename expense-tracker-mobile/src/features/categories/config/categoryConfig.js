import { CATEGORY_TYPES } from "@/domain/categories/category.model";

export const CATEGORY_FORM_FIELDS = [
  { name: "name", label: "categories.form.name", type: "text", required: true },
  { name: "description", label: "categories.form.description", type: "textarea", required: false },
  { name: "type", label: "categories.form.type", type: "select", required: true, options: CATEGORY_TYPES.map((typeVal) => ({ value: typeVal, label: `categories.types.${typeVal.toLowerCase()}` })) },
  { name: "color", label: "categories.form.color", type: "color", required: false },
  { name: "icon", label: "categories.form.icon", type: "text", required: false },
];

export const CATEGORY_SEARCH_FIELDS = ["name", "description"];

export const CATEGORY_SORT_OPTIONS = [
  { value: "name", label: "categories.sort.name" },
  { value: "type", label: "categories.sort.type" },
];
