import axios from "axios";
import { api, API_BASE_URL } from "../../config/api";
import {
  CLEAR_ERROR,
  CREATE_EXPENSE_FAILURE,
  CREATE_EXPENSE_REQUEST,
  CREATE_EXPENSE_SUCCESS,
  DELETE_EXPENSE_FAILURE,
  DELETE_EXPENSE_REQUEST,
  DELETE_EXPENSE_SUCCESS,
  EDIT_EXPENSE_FAILURE,
  EDIT_EXPENSE_REQUEST,
  EDIT_EXPENSE_SUCCESS,
  EDIT_MUTLTIPLE_EXPENSE_REQUEST,
  EDIT_MUTLTIPLE_EXPENSE_SUCCESS,
  FETCH_CASHFLOW_EXPENSES_FAILURE,
  FETCH_CASHFLOW_EXPENSES_REQUEST,
  FETCH_CASHFLOW_EXPENSES_SUCCESS,
  FETCH_EXPENSES_FAILURE,
  FETCH_EXPENSES_REQUEST,
  FETCH_EXPENSES_SUCCESS,
  FETCH_PREVIOUS_EXPENSES_FAILURE,
  FETCH_PREVIOUS_EXPENSES_REQUEST,
  FETCH_PREVIOUS_EXPENSES_SUCCESS,
  GET_ALL_EXPENSES_FAILURE,
  GET_ALL_EXPENSES_REQUEST,
  GET_ALL_EXPENSES_SUCCESS,
  GET_BUDGET_EXPENSES_FAILURE,
  GET_BUDGET_EXPENSES_REQUEST,
  GET_BUDGET_EXPENSES_SUCCESS,
  GET_BUDGET_FAILURE,
  GET_BUDGET_REQUEST,
  GET_BUDGET_SUCCESS,
  GET_DATE_EXPENSES_FAILURE,
  GET_DATE_EXPENSES_REQUEST,
  GET_DATE_EXPENSES_SUCCESS,
  GET_EXPENSE_FAILURE,
  GET_EXPENSE_REQUEST,
  GET_EXPENSE_SUCCESS,
  GET_EXPENSE_SUMMARY_FAILURE,
  GET_EXPENSE_SUMMARY_REQUEST,
  GET_EXPENSE_SUMMARY_SUCCESS,
  GET_EXPENSES_HISTORY_FAILURE,
  GET_EXPENSES_HISTORY_REQUEST,
  GET_EXPENSES_HISTORY_SUCCESS,
  GET_EXPENSES_SUGGESTIONS_FAILURE,
  GET_EXPENSES_SUGGESTIONS_REQUEST,
  GET_EXPENSES_SUGGESTIONS_SUCCESS,
  GET_SELECTED_EXPENSE_BUDGET_FAILURE,
  GET_SELECTED_EXPENSE_BUDGET_REQUEST,
  GET_SELECTED_EXPENSE_BUDGET_SUCCESS,
  RESET_UPLOAD_STATE,
  SAVE_EXPENSES_FAILURE,
  SAVE_EXPENSES_REQUEST,
  SAVE_EXPENSES_SUCCESS,
  UPLOAD_FILE_FAILURE,
  UPLOAD_FILE_REQUEST,
  UPLOAD_FILE_SUCCESS,
  GET_PARTICULAR_DATE_EXPENSES_REQUEST,
  GET_PARTICULAR_DATE_EXPENSES_SUCCESS,
  GET_PARTICULAR_DATE_EXPENSES_FAILURE,
} from "./expense.actionType";

const token = localStorage.getItem("jwt");
export const getExpensesAction =
  (jwt, sortOrder = "desc") =>
  async (dispatch) => {
    dispatch({ type: GET_ALL_EXPENSES_REQUEST });

    const token = localStorage.getItem("jwt"); // ✅ move inside the function

    if (!token) {
      console.error("JWT not found in localStorage");
      dispatch({ type: GET_ALL_EXPENSES_FAILURE, payload: "JWT not found" });
      return;
    }

    try {
      const { data } = await api.get(`/api/expenses/fetch-expenses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          sortOrder,
        },
      });

      console.log("all expenses", data);
      dispatch({ type: GET_ALL_EXPENSES_SUCCESS, payload: data });
    } catch (error) {
      console.log("Error fetching expenses: ", error);
      dispatch({ type: GET_ALL_EXPENSES_FAILURE, payload: error });
    }
  };

export const getExpensesSuggestions = () => async (dispatch) => {
  dispatch({ type: GET_EXPENSES_SUGGESTIONS_REQUEST });

  const token = localStorage.getItem("jwt"); // ✅ move inside the function

  if (!token) {
    console.error("JWT not found in localStorage");
    dispatch({
      type: GET_EXPENSES_SUGGESTIONS_FAILURE,
      payload: "JWT not found",
    });
    return;
  }

  try {
    const { data } = await api.get(`/api/expenses/top-expense-names?topN=500`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({ type: GET_EXPENSES_SUGGESTIONS_SUCCESS, payload: data });
  } catch (error) {
    console.log("Error fetching expenses names ", error);
    dispatch({ type: GET_EXPENSES_SUGGESTIONS_FAILURE, payload: error });
  }
};

export const getHomeExpensesAction =
  (jwt, sortOrder = "desc") =>
  async (dispatch) => {
    dispatch({ type: GET_DATE_EXPENSES_REQUEST });

    const token = localStorage.getItem("jwt"); // ✅ move inside the function

    if (!token) {
      console.error("JWT not found in localStorage");
      dispatch({ type: GET_DATE_EXPENSES_FAILURE, payload: "JWT not found" });
      return;
    }

    try {
      const { data } = await api.get(`/api/expenses/groupedByDate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          sortOrder,
        },
      });

      dispatch({ type: GET_DATE_EXPENSES_SUCCESS, payload: data });
    } catch (error) {
      console.log("Error fetching expenses: ", error);
      dispatch({ type: GET_DATE_EXPENSES_FAILURE, payload: error });
    }
  };

export const getExpensesSummaryAction = () => async (dispatch) => {
  dispatch({ type: GET_EXPENSE_SUMMARY_REQUEST });

  const token = localStorage.getItem("jwt"); // ✅ move inside the function

  if (!token) {
    console.error("JWT not found in localStorage");
    dispatch({ type: GET_EXPENSE_SUMMARY_FAILURE, payload: "JWT not found" });
    return;
  }

  try {
    const { data } = await api.get(`/api/expenses/summary-expenses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Expenses summary", data);
    dispatch({ type: GET_EXPENSE_SUMMARY_SUCCESS, payload: data });
  } catch (error) {
    console.log("Error fetching expenses: ", error);
    dispatch({ type: GET_EXPENSE_SUMMARY_FAILURE, payload: error });
  }
};
export const getExpenseAction = (id) => async (dispatch) => {
  dispatch({ type: GET_EXPENSE_REQUEST });

  const jwt = localStorage.getItem("jwt");

  if (!jwt) {
    console.error("JWT not found in localStorage");
    dispatch({ type: CREATE_EXPENSE_FAILURE, payload: "JWT not found" });
    return;
  }

  try {
    const { data } = await api.get(`/api/expenses/expense/${id}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    dispatch({ type: GET_EXPENSE_SUCCESS, payload: data });
    console.log("get users expense", data);
  } catch (error) {
    console.log("error user expense error ", error);
    dispatch({ type: GET_EXPENSE_FAILURE, payload: error });
  }
};

export const getExpensesByBudgetId = (id) => async (dispatch) => {
  dispatch({ type: GET_BUDGET_EXPENSES_REQUEST });

  const jwt = localStorage.getItem("jwt");

  if (!jwt) {
    console.error("JWT not found in localStorage");
    dispatch({ type: GET_BUDGET_EXPENSES_FAILURE, payload: "JWT not found" });
    return;
  }

  try {
    const { data } = await api.get(`/api/budgets/${id}/expenses`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    dispatch({ type: GET_BUDGET_EXPENSES_SUCCESS, payload: data });
    console.log("get expenses by budget id", data);
  } catch (error) {
    console.log("error user expense error ", error);
    dispatch({ type: GET_BUDGET_EXPENSES_FAILURE, payload: error });
  }
};
export const getExpenseHistory = () => async (dispatch) => {
  dispatch({ type: GET_EXPENSES_HISTORY_REQUEST });

  const jwt = localStorage.getItem("jwt");

  if (!jwt) {
    console.error("JWT not found in localStorage");
    dispatch({ type: GET_EXPENSES_HISTORY_FAILURE, payload: "JWT not found" });
    return;
  }

  try {
    const { data } = await api.get(`/api/audit-logs/all`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    dispatch({ type: GET_EXPENSES_HISTORY_SUCCESS, payload: data });
    console.log("get users expense", data);
  } catch (error) {
    console.log("error user expense error ", error);
    dispatch({ type: GET_EXPENSES_HISTORY_FAILURE, payload: error });
  }
};
export const createExpenseAction = (expenseData) => async (dispatch) => {
  dispatch({ type: CREATE_EXPENSE_REQUEST });

  const jwt = localStorage.getItem("jwt");

  if (!jwt) {
    console.error("JWT not found in localStorage");
    dispatch({ type: CREATE_EXPENSE_FAILURE, payload: "JWT not found" });
    return;
  }

  try {
    const { data } = await api.post(
      `/api/expenses/add-expense`,
      expenseData, // Send the expense data in the body of the POST request
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    dispatch({ type: CREATE_EXPENSE_SUCCESS, payload: data });
    console.log("Expense created successfully:", data);
  } catch (error) {
    dispatch({ type: CREATE_EXPENSE_FAILURE, payload: error.message });
    console.error("Error creating expense:", error);
  }
};

export const editExpenseAction =
  (expenseId, updatedData) => async (dispatch) => {
    dispatch({ type: EDIT_EXPENSE_REQUEST });

    try {
      const response = await api.put(
        `/api/expenses/edit-expense/${expenseId}`,
        updatedData
      ); // Adjust the API endpoint
      dispatch({ type: EDIT_EXPENSE_SUCCESS, payload: response.data });
      console.log("Expense edited successfully:", response.data);
    } catch (error) {
      dispatch({ type: EDIT_EXPENSE_FAILURE, payload: error.message });
      console.error("Error editing expense:", error);
    }
  };

export const editMultipleExpenseAction = (updatedData) => async (dispatch) => {
  dispatch({ type: EDIT_MUTLTIPLE_EXPENSE_REQUEST });

  try {
    const response = await api.put(`/api/expenses/edit-multiple`, updatedData); // Adjust the API endpoint
    dispatch({ type: EDIT_MUTLTIPLE_EXPENSE_SUCCESS, payload: response.data });
    console.log("Expense edited successfully:", response.data);
  } catch (error) {
    dispatch({ type: EDIT_EXPENSE_FAILURE, payload: error.message });
    console.error("Error editing expense:", error);
  }
};

export const deleteExpenseAction = (id) => async (dispatch) => {
  dispatch({ type: DELETE_EXPENSE_REQUEST });

  try {
    await api.delete(`/api/expenses/delete/${id}`);
    dispatch({
      type: DELETE_EXPENSE_SUCCESS,
      payload: "Expense deleted successfully",
    });
    console.log("Expense deleted successfully");
  } catch (error) {
    dispatch({
      type: DELETE_EXPENSE_FAILURE,
      payload: error.message,
    });
    console.error("Error deleting expense:", error);
  }
};

export const fetchPreviousExpenses =
  (expenseName, date) => async (dispatch) => {
    dispatch({ type: FETCH_PREVIOUS_EXPENSES_REQUEST });

    console.log(
      "Fetching previous expenses for:",
      expenseName,
      "on date:",
      date
    );

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/expenses/before/${expenseName}/${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response from backend:", response);

      dispatch({
        type: FETCH_PREVIOUS_EXPENSES_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      console.log("Error fetching previous expenses:", error);

      dispatch({
        type: FETCH_PREVIOUS_EXPENSES_FAILURE,
        payload: error.response?.data || error.message,
      });
    }
  };

export const uploadFile = (file) => async (dispatch) => {
  dispatch({ type: UPLOAD_FILE_REQUEST });

  const token = localStorage.getItem("jwt");
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_BASE_URL}/api/expenses/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Upload failed");
    }

    const result = await response.json();
    console.log(result);
    dispatch({ type: UPLOAD_FILE_SUCCESS, payload: result });
  } catch (error) {
    dispatch({ type: UPLOAD_FILE_FAILURE, payload: error.message });
  }
};

export const resetUploadState = () => ({
  type: RESET_UPLOAD_STATE,
});

export const saveExpensesRequest = () => ({
  type: SAVE_EXPENSES_REQUEST,
});

export const saveExpensesSuccess = (data) => ({
  type: SAVE_EXPENSES_SUCCESS,
  payload: data,
});

export const saveExpensesFailure = (error) => ({
  type: SAVE_EXPENSES_FAILURE,
  payload: error,
});

export const saveExpenses = (expenses) => {
  console.log("saved exepsens", expenses);
  return async (dispatch) => {
    dispatch(saveExpensesRequest());
    try {
      const response = await fetch(`${API_BASE_URL}/api/expenses/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expenses),
      });

      if (!response.ok) {
        throw new Error("Failed to save expenses");
      }

      const data = await response.json();
      dispatch(saveExpensesSuccess(data));
    } catch (error) {
      dispatch(saveExpensesFailure(error.message));
    }
  };
};
export const fetchExpenses =
  (from, to, sortOrder = "desc") =>
  async (dispatch) => {
    dispatch({ type: FETCH_EXPENSES_REQUEST });

    const token = localStorage.getItem("jwt");
    if (!token) {
      console.error("JWT not found in localStorage");
      dispatch({ type: FETCH_EXPENSES_FAILURE, payload: "JWT not found" });
      return;
    }

    try {
      const { data } = await api.get("/api/expenses/fetch-expenses-by-date", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          from,
          to,
          sortOrder, // optional, only if backend supports it
        },
      });

      console.log("Fetched expenses by date:", data);
      dispatch({ type: FETCH_EXPENSES_SUCCESS, payload: data });
    } catch (error) {
      console.error("Error fetching expenses:", error);
      dispatch({ type: FETCH_EXPENSES_FAILURE, payload: error.message });
    }
  };

export const getExpensesByBudget =
  (id, startDate, endDate) => async (dispatch) => {
    dispatch({ type: GET_SELECTED_EXPENSE_BUDGET_REQUEST });

    if (!token) {
      console.error("JWT not found in localStorage");
      dispatch({
        type: GET_SELECTED_EXPENSE_BUDGET_FAILURE,
        payload: "JWT not found",
      });
      return;
    }

    try {
      const { data } = await api.get(`/api/expenses/${id}/expenses`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // optional, but good to include
        },
        params: {
          startDate: startDate,
          endDate: endDate,
        },
      });

      console.log("budget creation response:", data);
      dispatch({ type: GET_SELECTED_EXPENSE_BUDGET_SUCCESS, payload: data });
    } catch (error) {
      console.error("Error creating budget:", error);
      dispatch({ type: GET_SELECTED_EXPENSE_BUDGET_FAILURE, payload: error });
    }
  };
export const fetchCashflowExpenses =
  (rangeType, offset = 0, flowType = "") =>
  async (dispatch) => {
    dispatch({ type: FETCH_CASHFLOW_EXPENSES_REQUEST });
    const jwt = localStorage.getItem("jwt");
    try {
      const { data } = await api.get("/api/expenses/range/offset", {
        params: { rangeType, offset, flowType }, // Pass flowType to API
        headers: { Authorization: `Bearer ${jwt}` },
      });
      dispatch({ type: FETCH_CASHFLOW_EXPENSES_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: FETCH_CASHFLOW_EXPENSES_FAILURE,
        payload: error.message,
      });
    }
  };
export const getExpensesByParticularDate = (date) => async (dispatch) => {
  dispatch({ type: GET_PARTICULAR_DATE_EXPENSES_REQUEST });
  const token = localStorage.getItem("jwt");
  try {
    const { data } = await axios.get(
      `${API_BASE_URL}/api/expenses/particular-date?date=${date}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch({ type: GET_PARTICULAR_DATE_EXPENSES_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_PARTICULAR_DATE_EXPENSES_FAILURE,
      payload: error?.response?.data?.message || error.message,
    });
  }
};
