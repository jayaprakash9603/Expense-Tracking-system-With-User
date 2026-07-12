import {
  CATEGORY_ICON_MAP as SHARED_CATEGORY_ICON_MAP,
  getCategoryIconComponent,
} from "@/shared/icons";

export const CATEGORY_ICON_MAP = SHARED_CATEGORY_ICON_MAP;

export function getCategoryIcon(categoryName) {
  return getCategoryIconComponent(categoryName);
}
