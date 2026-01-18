import {
  legacy_createStore,
  applyMiddleware,
  combineReducers,
  compose,
} from "redux";
import { thunk } from "redux-thunk";
import { authReducer } from "./Auth/auth.reducer";
import { LOGOUT } from "./Auth/auth.actionType";
import {
  expenseReducer,
  saveExpensesReducer,
  uploadReducer,
} from "./Expenses/expense.reducer";
import { budgetReducer } from "./Budget/budget.reducer";
import categoryReducer from "./Category/categoryReducer";
import friendsReducer from "./Friends/friendsReducer";
import groupsReducer from "./Groups/groupsReducer";
import { paymentMethodReducer } from "./Payment Method/paymentMethod.reducer"; // Add this import
import billReducer from "./Bill/bill.reducer";
import chatReducer from "./chats/chatReducer";
import { themeReducer } from "./Theme/theme.reducer";
import userSettingsReducer from "./UserSettings/userSettings.reducer";
import { notificationReducer } from "./Notifications/notification.reducer";
import notificationPreferencesReducer from "./NotificationPreferences/notificationPreferences.reducer";
import { reportHistoryReducer } from "./ReportHistory/reportHistory.reducer";
import friendActivityReducer from "./FriendActivity/friendActivity.reducer";

// Combine reducers
const appReducer = combineReducers({
  auth: authReducer,
  expenses: expenseReducer,
  fileUpload: uploadReducer,
  savedExpenses: saveExpensesReducer,
  budgets: budgetReducer,
  categories: categoryReducer,
  friends: friendsReducer,
  groups: groupsReducer,
  paymentMethod: paymentMethodReducer,
  bill: billReducer,
  chats: chatReducer,
  theme: themeReducer,
  userSettings: userSettingsReducer,
  notifications: notificationReducer,
  notificationPreferences: notificationPreferencesReducer,
  reportHistory: reportHistoryReducer,
  friendActivity: friendActivityReducer,
});

const rootReducer = (state, action) => {
  if (action.type === LOGOUT) {
    state = undefined;
  }
  return appReducer(state, action);
};

// Compose enhancer with DevTools support
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Create store with DevTools and middleware
export const store = legacy_createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk)),
);
