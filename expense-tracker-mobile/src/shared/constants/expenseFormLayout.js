const ROOT_FONT_PX = 16;

export function pxToRem(px) {
  return `${px / ROOT_FONT_PX}rem`;
}

export const EXPENSE_FORM_LAYOUT = {
  shellMaxWidth: "77.5rem",
  commentsMaxWidth: "47.5rem",
  fieldColumnMaxWidth: "18.75rem",
  labelWidth: "9.375rem",
  autoFillBadgeLeft: "18.75rem",
  autoFillBadgeTop: "-1.25rem",
  controlHeightRem: "3rem",
  amountFieldMaxWidth: "18.75rem",
  quickActionLabelMaxWidth: "5.75rem",
  microText: "0.625rem",
};
