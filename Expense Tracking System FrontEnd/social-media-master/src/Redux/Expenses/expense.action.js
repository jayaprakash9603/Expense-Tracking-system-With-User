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
  FETCH_CATEGORIES_WITH_EXPENSES_REQUEST,
  FETCH_CATEGORIES_WITH_EXPENSES_SUCCESS,
  FETCH_CATEGORIES_WITH_EXPENSES_FAILURE,
  COPY_EXPENSE_REQUEST,
  COPY_EXPENSE_SUCCESS,
  COPY_EXPENSE_FAILURE,
  UPLOAD_CATEGORIES_REQUEST,
  UPLOAD_CATEGORIES_SUCCESS,
  UPLOAD_CATEGORIES_FAILURE,
} from "./expense.actionType";
import {
  getCashflowCacheDescriptor,
  getCashflowCacheKeyFromDescriptor,
} from "../../utils/cashflowCacheUtils";
import {
  getCategoryFlowCacheDescriptor,
  getCategoryFlowCacheKeyFromDescriptor,
} from "../../utils/categoryFlowCacheUtils";

export const getExpensesAction =
  (sortOrder = "desc", targetId) =>
  async (dispatch) => {
    dispatch({ type: GET_ALL_EXPENSES_REQUEST });

    try {
      const { data } = await api.get(`/api/expenses/fetch-expenses`, {
        params: {
          sortOrder,
          targetId: targetId || "", // Include targetId if provided
        },
      });

      console.log("all expenses", data);
      dispatch({ type: GET_ALL_EXPENSES_SUCCESS, payload: data });
    } catch (error) {
      console.log("Error fetching expenses: ", error);
      dispatch({ type: GET_ALL_EXPENSES_FAILURE, payload: error });
    }
  };

export const getExpensesSuggestions = (targetId) => async (dispatch) => {
  dispatch({ type: GET_EXPENSES_SUGGESTIONS_REQUEST });

  try {
    const { data } = await api.get(
      `/api/expenses/top-expense-names?topN=500&targetId=${targetId}`
    );

    dispatch({ type: GET_EXPENSES_SUGGESTIONS_SUCCESS, payload: data });
  } catch (error) {
    console.log("Error fetching expenses names ", error);
    dispatch({ type: GET_EXPENSES_SUGGESTIONS_FAILURE, payload: error });
  }
};

export const getHomeExpensesAction =
  (jwt, sortOrder = "desc", targetId) =>
  async (dispatch) => {
    dispatch({ type: GET_DATE_EXPENSES_REQUEST });

    try {
      const { data } = await api.get(`/api/expenses/groupedByDate`, {
        params: {
          sortOrder,
          targetId: targetId || "",
        },
      });

      dispatch({ type: GET_DATE_EXPENSES_SUCCESS, payload: data });
    } catch (error) {
      console.log("Error fetching expenses: ", error);
      dispatch({ type: GET_DATE_EXPENSES_FAILURE, payload: error });
    }
  };

export const getExpensesSummaryAction = (targetId) => async (dispatch) => {
  dispatch({ type: GET_EXPENSE_SUMMARY_REQUEST });

  try {
    const { data } = await api.get(`/api/expenses/summary-expenses`, {
      params: {
        targetId: targetId || "", // Include targetId if provided
      },
    });

    console.log("Expenses summary", data);
    dispatch({ type: GET_EXPENSE_SUMMARY_SUCCESS, payload: data });
  } catch (error) {
    console.log("Error fetching expenses: ", error);
    dispatch({ type: GET_EXPENSE_SUMMARY_FAILURE, payload: error });
  }
};
export const getExpenseAction = (id, targetId) => async (dispatch) => {
  dispatch({ type: GET_EXPENSE_REQUEST });

  try {
    const { data } = await api.get(`/api/expenses/expense/${id}`, {
      params: {
        targetId: targetId || "", // Include targetId if provided
      },
    });
    dispatch({ type: GET_EXPENSE_SUCCESS, payload: data });
    return data;
    console.log("get users expense", data);
  } catch (error) {
    console.log("error user expense error ", error);
    dispatch({ type: GET_EXPENSE_FAILURE, payload: error });
  }
};

export const getExpensesByBudgetId = (id, targetId) => async (dispatch) => {
  dispatch({ type: GET_BUDGET_EXPENSES_REQUEST });

  try {
    const { data } = await api.get(`/api/budgets/${id}/expenses`, {
      params: {
        targetId: targetId || "",
      },
    });
    dispatch({ type: GET_BUDGET_EXPENSES_SUCCESS, payload: data });
    console.log("get expenses by budget id", data);
  } catch (error) {
    console.log("error user expense error ", error);
    dispatch({ type: GET_BUDGET_EXPENSES_FAILURE, payload: error });
  }
};
export const getExpenseHistory = (targetId) => async (dispatch) => {
  dispatch({ type: GET_EXPENSES_HISTORY_REQUEST });

  try {
    const { data } = await api.get(`/api/audit-logs/all`, {
      params: {
        targetId: targetId || "", // Include targetId if provided
      },
    });
    dispatch({ type: GET_EXPENSES_HISTORY_SUCCESS, payload: data });
    console.log("get users expense", data);
  } catch (error) {
    console.log("error user expense error ", error);
    dispatch({ type: GET_EXPENSES_HISTORY_FAILURE, payload: error });
  }
};
export const createExpenseAction =
  (expenseData, targetId) => async (dispatch) => {
    dispatch({ type: CREATE_EXPENSE_REQUEST });

    try {
      // Add targetId to the URL if it's provided
      const endpoint = targetId
        ? `/api/expenses/add-expense?targetId=${targetId}`
        : `/api/expenses/add-expense`;

      const { data } = await api.post(
        endpoint,
        expenseData // Send the expense data in the body of the POST request
      );

      dispatch({ type: CREATE_EXPENSE_SUCCESS, payload: data });
      console.log("Expense created successfully:", data);
    } catch (error) {
      dispatch({ type: CREATE_EXPENSE_FAILURE, payload: error.message });
      console.error("Error creating expense:", error);
    }
  };

export const copyExpenseAction = (expenseId, targetId) => async (dispatch) => {
  dispatch({ type: COPY_EXPENSE_REQUEST });

  try {
    // Add targetId to the URL if it's provided
    const endpoint = targetId
      ? `/api/expenses/${expenseId}/copy?targetId=${targetId}`
      : `/api/expenses/${expenseId}/copy`;

    const { data } = await api.post(endpoint);

    dispatch({ type: COPY_EXPENSE_SUCCESS, payload: data });
    console.log("Expense copied successfully:", data);
  } catch (error) {
    dispatch({ type: COPY_EXPENSE_FAILURE, payload: error.message });
    console.error("Error copying expense:", error);
  }
};

export const editExpenseAction =
  (expenseId, updatedData, targetId) => async (dispatch) => {
    dispatch({ type: EDIT_EXPENSE_REQUEST });

    try {
      const response = await api.put(
        `/api/expenses/edit-expense/${expenseId}`,
        updatedData,
        {
          params: {
            targetId: targetId || "",
          },
        }
      ); // Adjust the API endpoint
      dispatch({ type: EDIT_EXPENSE_SUCCESS, payload: response.data });
      console.log("Expense edited successfully:", response.data);
    } catch (error) {
      dispatch({ type: EDIT_EXPENSE_FAILURE, payload: error.message });
      console.error("Error editing expense:", error);
    }
  };

export const editMultipleExpenseAction =
  (updatedData, targetId) => async (dispatch) => {
    dispatch({ type: EDIT_MUTLTIPLE_EXPENSE_REQUEST });

    try {
      const response = await api.put(
        `/api/expenses/edit-multiple`,
        updatedData,
        {
          params: {
            targetId: targetId || "",
          },
        }
      ); // Adjust the API endpoint
      dispatch({
        type: EDIT_MUTLTIPLE_EXPENSE_SUCCESS,
        payload: response.data,
      });
      console.log("Expense edited successfully:", response.data);
    } catch (error) {
      dispatch({ type: EDIT_EXPENSE_FAILURE, payload: error.message });
      console.error("Error editing expense:", error);
    }
  };

export const deleteExpenseAction = (id, targetId) => async (dispatch) => {
  dispatch({ type: DELETE_EXPENSE_REQUEST });

  try {
    await api.delete(`/api/expenses/delete/${id}?targetId=${targetId || ""}`);
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

export const deleteMultiExpenses = (ids, targetId) => async (dispatch) => {
  dispatch({ type: DELETE_EXPENSE_REQUEST });

  try {
    await api.delete(
      `/api/expenses/delete-multiple?targetId=${targetId || ""}`,
      { data: ids }
    );
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
  (expenseName, date, targetId) => async (dispatch) => {
    dispatch({ type: FETCH_PREVIOUS_EXPENSES_REQUEST });

    try {
      const response = await api.get(
        `/api/expenses/before/${expenseName}/${date}`,
        {
          params: {
            targetId: targetId || "", // Include targetId if provided
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

      // Extract error message safely
      const errorMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Failed to fetch previous expenses";

      dispatch({
        type: FETCH_PREVIOUS_EXPENSES_FAILURE,
        payload: errorMessage,
      });
    }
  };

export const uploadFile = (file, targetId) => async (dispatch) => {
  dispatch({ type: UPLOAD_FILE_REQUEST });

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post(`/api/expenses/upload`, formData, {
      params: {
        targetId: targetId || "",
      },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("File upload response:", response.data);
    dispatch({ type: UPLOAD_FILE_SUCCESS, payload: response.data });
  } catch (error) {
    console.error("Error uploading file:", error);
    dispatch({
      type: UPLOAD_FILE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};
export const resetUploadState = () => ({
  type: RESET_UPLOAD_STATE,
});

// Upload categories Excel (Category Summary sheet) and get preview list
export const uploadCategoriesFile = (file, targetId) => async (dispatch) => {
  dispatch({ type: UPLOAD_CATEGORIES_REQUEST });

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post(
      `/api/expenses/upload-categories`,
      formData,
      {
        params: {
          targetId: targetId || "",
        },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    dispatch({ type: UPLOAD_CATEGORIES_SUCCESS, payload: response.data });
    return response.data;
  } catch (error) {
    dispatch({
      type: UPLOAD_CATEGORIES_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

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
export const saveExpenses = (expenses, targetId) => {
  console.log("saved expenses", expenses);
  return async (dispatch) => {
    dispatch(saveExpensesRequest());
    try {
      const response = await api.post(`/api/expenses/add-multiple`, expenses, {
        params: {
          targetId: targetId || "",
        },
      });

      console.log("Save expenses response:", response.data);
      dispatch(saveExpensesSuccess(response.data));
    } catch (error) {
      console.error("Error saving expenses:", error);
      dispatch({
        type: SAVE_EXPENSES_FAILURE,
        payload: error.response?.data?.message || error.message,
      });
    }
  };
};

// Start a tracked bulk save and return jobId
export const startTrackedSaveExpenses = (expenses, targetId) => async () => {
  const { data } = await api.post(
    `/api/expenses/add-multiple/tracked`,
    expenses,
    {
      params: { targetId: targetId || "" },
    }
  );
  return data?.jobId;
};

// Poll progress for a jobId; returns the ProgressStatus
export const pollSaveProgress = async (jobId) => {
  const { data } = await api.get(
    `/api/expenses/add-multiple/progress/${jobId}`
  );
  return data; // { jobId, total, processed, percent, status, message }
};
export const fetchExpenses =
  (from, to, sortOrder = "desc", targetId) =>
  async (dispatch) => {
    dispatch({ type: FETCH_EXPENSES_REQUEST });

    try {
      const { data } = await api.get("/api/expenses/fetch-expenses-by-date", {
        params: {
          from,
          to,
          sortOrder,
          targetId: targetId || "", // optional, only if backend supports it
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
  (id, startDate, endDate, targetId) => async (dispatch) => {
    dispatch({ type: GET_SELECTED_EXPENSE_BUDGET_REQUEST });

    try {
      const { data } = await api.get(`/api/expenses/${id}/expenses`, {
        params: {
          startDate: startDate,
          endDate: endDate,
          targetId: targetId || "", // optional, only if backend supports it
        },
      });

      console.log("budget creation response:", data);
      dispatch({ type: GET_SELECTED_EXPENSE_BUDGET_SUCCESS, payload: data });
    } catch (error) {
      console.error("Error creating budget:", error);
      dispatch({ type: GET_SELECTED_EXPENSE_BUDGET_FAILURE, payload: error });
    }
  };
// Update the existing fetchCashflowExpenses function
// Enhanced cashflow fetch supporting explicit dates, type and grouping
// Usage examples:
//  fetchCashflowExpenses({ range:'month', offset:0 })
//  fetchCashflowExpenses({ startDate:'2025-09-01', endDate:'2025-09-30', type:'loss', groupBy:true })
export const fetchCashflowExpenses =
  ({
    range,
    offset = 0,
    flowType,
    category,
    type,
    startDate,
    endDate,
    groupBy = false,
    targetId,
    ownerId,
  }) =>
  async (dispatch, getState) => {
    const normalizedParams = getCashflowCacheDescriptor({
      range,
      offset,
      flowType,
      category,
      type,
      startDate,
      endDate,
      groupBy,
      targetId,
      ownerId,
    });
    const requestSignature =
      getCashflowCacheKeyFromDescriptor(normalizedParams);
    const cachedData = getState()?.expenses?.cashflowCache?.[requestSignature];

    if (cachedData !== undefined) {
      dispatch({
        type: FETCH_CASHFLOW_EXPENSES_SUCCESS,
        payload: cachedData,
        meta: {
          requestDescriptor: normalizedParams,
          requestSignature,
          cached: true,
        },
      });
      return cachedData;
    }

    try {
      dispatch({ type: FETCH_CASHFLOW_EXPENSES_REQUEST });

      const params = new URLSearchParams();
      if (normalizedParams.startDate && normalizedParams.endDate) {
        params.append("startDate", normalizedParams.startDate);
        params.append("endDate", normalizedParams.endDate);
      } else {
        if (normalizedParams.range) {
          params.append("range", normalizedParams.range);
        }
        params.append("offset", String(normalizedParams.offset));
      }
      if (normalizedParams.flowType) {
        params.append("flowType", normalizedParams.flowType);
      }
      if (normalizedParams.category) {
        params.append("category", normalizedParams.category);
      }
      if (normalizedParams.type) {
        params.append("type", normalizedParams.type);
      }
      if (normalizedParams.groupBy) {
        params.append("groupBy", "true");
      }
      if (normalizedParams.targetId) {
        params.append("targetId", normalizedParams.targetId);
      }

      const { data } = await api.get(
        `/api/expenses/cashflow?${params.toString()}`
      );

      dispatch({
        type: FETCH_CASHFLOW_EXPENSES_SUCCESS,
        payload: data,
        meta: {
          requestDescriptor: normalizedParams,
          requestSignature,
          cached: false,
        },
      });
      return data;
    } catch (error) {
      console.log("Error fetching cashflow expenses:", error);
      dispatch({
        type: FETCH_CASHFLOW_EXPENSES_FAILURE,
        payload: error.response?.data?.message || "Failed to fetch expenses",
      });
      throw error;
    }
  };
export const getExpensesByParticularDate =
  (date, targetId) => async (dispatch) => {
    dispatch({ type: GET_PARTICULAR_DATE_EXPENSES_REQUEST });

    try {
      const { data } = await api.get(
        `/api/expenses/particular-date?date=${date}`,
        {
          params: {
            targetId: targetId || "", // Include targetId if provided
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

export const fetchCategoriesWithExpenses =
  ({ forceRefetch = false, ...rawParams } = {}) =>
  async (dispatch, getState) => {
    const normalizedParams = getCategoryFlowCacheDescriptor(rawParams);
    const requestSignature =
      getCategoryFlowCacheKeyFromDescriptor(normalizedParams);
    const cachedData =
      getState()?.expenses?.categoryFlowCache?.[requestSignature];

    if (!forceRefetch && cachedData !== undefined) {
      dispatch({
        type: FETCH_CATEGORIES_WITH_EXPENSES_SUCCESS,
        payload: cachedData,
        meta: {
          requestDescriptor: normalizedParams,
          requestSignature,
          cached: true,
        },
      });
      return cachedData;
    }

    try {
      dispatch({ type: FETCH_CATEGORIES_WITH_EXPENSES_REQUEST });

      const queryParams = new URLSearchParams();
      queryParams.append("rangeType", normalizedParams.rangeType || "month");
      queryParams.append("offset", String(normalizedParams.offset));
      if (normalizedParams.flowType) {
        queryParams.append("flowType", normalizedParams.flowType);
      }

      const { data } = await api.get(
        `/api/expenses/all-by-categories/detailed/filtered?${queryParams.toString()}`,
        {
          params: {
            targetId: normalizedParams.targetId || "",
          },
        }
      );

      dispatch({
        type: FETCH_CATEGORIES_WITH_EXPENSES_SUCCESS,
        payload: data,
        meta: {
          requestDescriptor: normalizedParams,
          requestSignature,
          cached: false,
        },
      });

      return data;
    } catch (error) {
      console.log("Error fetching categories with expenses:", error);
      dispatch({
        type: FETCH_CATEGORIES_WITH_EXPENSES_FAILURE,
        payload:
          error.response?.data?.message || "Failed to fetch category expenses",
      });
      throw error;
    }
  };
