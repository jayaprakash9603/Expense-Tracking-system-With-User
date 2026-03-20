import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { authReducer } from "./auth/auth.reducer";
import { themeReducer } from "./theme/theme.reducer";
import { userSettingsReducer } from "./userSettings/userSettings.reducer";
import { expensesReducer } from "./expenses/expenses.reducer";
import { budgetsReducer } from "./budgets/budgets.reducer";
import { categoriesReducer } from "./categories/categories.reducer";
import { billsReducer } from "./bills/bills.reducer";
import { notificationsReducer } from "./notifications/notifications.reducer";
import { friendsReducer } from "./friends/friends.reducer";
import { sharesReducer } from "./shares/shares.reducer";
import { reportsReducer } from "./reports/reports.reducer";
import { paymentMethodsReducer } from "./paymentMethods/paymentMethods.reducer";
import { groupsReducer } from "./groups/groups.reducer";
import { LOGOUT } from "./auth/auth.actionTypes";

const appReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  userSettings: userSettingsReducer,
  expenses: expensesReducer,
  budgets: budgetsReducer,
  categories: categoriesReducer,
  bills: billsReducer,
  notifications: notificationsReducer,
  friends: friendsReducer,
  shares: sharesReducer,
  reports: reportsReducer,
  paymentMethods: paymentMethodsReducer,
  groups: groupsReducer,
});

const rootReducer = (state, action) => {
  if (action.type === LOGOUT) {
    const { theme } = state || {};
    state = { theme };
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== "production",
});
