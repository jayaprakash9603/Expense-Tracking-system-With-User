import { legacy_createStore, applyMiddleware, combineReducers } from "redux"; // Correct import for legacy_createStore
import { thunk } from "redux-thunk"; // Correct import for thunk
import { authReducer } from "./Auth/auth.reducer"; // Ensure this path is correct
import {
  expenseReducer,
  saveExpensesReducer,
  uploadReducer,
} from "./Expenses/expense.reducer";

// Combine reducers
const rootreducers = combineReducers({
  auth: authReducer,
  expenses: expenseReducer,
  fileUpload: uploadReducer,
  savedExpenses: saveExpensesReducer,
});

// Create store with middleware
export const store = legacy_createStore(rootreducers, applyMiddleware(thunk));
