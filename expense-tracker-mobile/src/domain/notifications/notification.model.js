export const NOTIFICATION_TYPES = [
  "EXPENSE_ADDED", "BUDGET_ALERT", "BILL_DUE", "FRIEND_REQUEST",
  "SHARE_RECEIVED", "SYSTEM", "REMINDER",
];

export const NOTIFICATION_DEFAULTS = {
  type: "SYSTEM",
  title: "",
  message: "",
  read: false,
  actionUrl: null,
};
