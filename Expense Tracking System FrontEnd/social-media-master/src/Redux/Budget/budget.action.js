import { api } from "../../config/api";
import {
  GET_BUDGET_FAILURE,
  GET_BUDGET_SUCCESS,
} from "../Expenses/expense.actionType";
import {
  CREATE_BUDGET_FAILURE,
  CREATE_BUDGET_REQUEST,
  CREATE_BUDGET_SUCCESS,
  DELETE_BUDGET_FAILURE,
  DELETE_BUDGET_REQUEST,
  DELETE_BUDGET_SUCCESS,
  EDIT_BUDGET_DATA_FAILURE,
  EDIT_BUDGET_DATA_REQUEST,
  EDIT_BUDGET_DATA_SUCCESS,
  GET_ALL_BUDGET_DATA_FAILURE,
  GET_ALL_BUDGET_DATA_REQUEST,
  GET_ALL_BUDGET_DATA_SUCCESS,
  GET_BUDGET_DATA_FAILURE,
  GET_BUDGET_DATA_REQUEST,
  GET_BUDGET_DATA_SUCCESS,
  GET_BUDGET_REPORT_REQUEST,
  GET_LIST_BUDGETS_FAILURE,
  GET_LIST_BUDGETS_REQUEST,
  GET_LIST_BUDGETS_SUCCESS,
  GET_SELECT_BUDGETS_FAILURE,
  GET_SELECT_BUDGETS_FAILURE_BY_EXPENSE_ID,
  GET_SELECT_BUDGETS_REQUEST,
  GET_SELECT_BUDGETS_REQUEST_BY_EXPENSE_ID,
  GET_SELECT_BUDGETS_SUCCESS_BY_EXPENSE_ID,
  GET_SELECTED_EXPENSE_BUDGET_FAILURE,
  GET_SELECTED_EXPENSE_BUDGET_REQUEST,
  GET_SELECTED_EXPENSE_BUDGET_SUCCESS,
} from "./budget.actionType";

const token = localStorage.getItem("jwt");
export const createBudgetAction = (budgetData) => async (dispatch) => {
  dispatch({ type: CREATE_BUDGET_REQUEST });

  if (!token) {
    console.error("JWT not found in localStorage");
    dispatch({ type: CREATE_BUDGET_FAILURE, payload: "JWT not found" });
    return;
  }

  console.log("Sending budget data:", budgetData);

  try {
    const { data } = await api.post(
      `/api/budgets`,
      budgetData, // ✅ correct: plain JSON body
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // optional, but good to include
        },
      }
    );

    console.log("budget creation response:", data);
    dispatch({ type: CREATE_BUDGET_SUCCESS, payload: data });
  } catch (error) {
    console.error("Error creating budget:", error);
    dispatch({ type: CREATE_BUDGET_FAILURE, payload: error });
  }
};

export const getBudgetData = () => async (dispatch) => {
  const token = localStorage.getItem("jwt");
  dispatch({ type: GET_ALL_BUDGET_DATA_REQUEST });

  if (!token) {
    console.error("JWT not found in localStorage");
    dispatch({ type: GET_ALL_BUDGET_DATA_FAILURE, payload: "JWT not found" });
    return;
  }

  try {
    const { data } = await api.get(`/api/budgets`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json", // optional, but good to include
      },
    });

    console.log("budget creation response:", data);
    dispatch({ type: GET_ALL_BUDGET_DATA_SUCCESS, payload: data });
  } catch (error) {
    console.error("Error creating budget:", error);
    dispatch({ type: GET_ALL_BUDGET_DATA_FAILURE, payload: error });
  }
};

export const getBudgetById = (id) => async (dispatch) => {
  dispatch({ type: GET_BUDGET_DATA_REQUEST });

  if (!token) {
    console.error("JWT not found in localStorage");
    dispatch({ type: GET_BUDGET_DATA_FAILURE, payload: "JWT not found" });
    return;
  }

  try {
    const { data } = await api.get(`/api/budgets/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json", // optional, but good to include
      },
    });

    console.log("budget creation response:", data);
    dispatch({ type: GET_BUDGET_DATA_SUCCESS, payload: data });
  } catch (error) {
    console.error("Error creating budget:", error);
    dispatch({ type: GET_BUDGET_DATA_FAILURE, payload: error });
  }
};

export const getListOfBudgetsById = (date) => async (dispatch) => {
  dispatch({ type: GET_LIST_BUDGETS_REQUEST });

  if (!token) {
    console.error("JWT not found in localStorage");
    dispatch({ type: GET_BUDGET_DATA_FAILURE, payload: "JWT not found" });
    return;
  }

  try {
    const { data } = await api.get(`/api/budgets/filter-by-date`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json", // optional, but good to include
      },
      params: {
        date: date,
      },
    });

    console.log("budget creation response:", data);
    dispatch({ type: GET_LIST_BUDGETS_SUCCESS, payload: data });
  } catch (error) {
    console.error("Error creating budget:", error);
    dispatch({ type: GET_LIST_BUDGETS_FAILURE, payload: error });
  }
};

export const getListOfBudgetsByExpenseId =
  ({ id, date }) =>
  async (dispatch) => {
    dispatch({ type: GET_SELECT_BUDGETS_REQUEST_BY_EXPENSE_ID });

    if (!token) {
      console.error("JWT not found in localStorage");
      dispatch({
        type: GET_SELECT_BUDGETS_FAILURE_BY_EXPENSE_ID,
        payload: "JWT not found",
      });
      return;
    }

    try {
      const { data } = await api.get(`/api/budgets/expenses`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: { expenseId: id, date: date },
      });

      console.log("budget list of summary response:", data);
      dispatch({
        type: GET_SELECT_BUDGETS_SUCCESS_BY_EXPENSE_ID,
        payload: data,
      });
    } catch (error) {
      console.error("Error fetching budgets by expense ID:", error);
      dispatch({
        type: GET_SELECT_BUDGETS_FAILURE_BY_EXPENSE_ID,
        payload: error.response?.data || error.message,
      });
    }
  };

export const getBudgetReportById = (id) => async (dispatch) => {
  dispatch({ type: GET_BUDGET_REPORT_REQUEST });

  if (!token) {
    console.error("JWT not found in localStorage");
    dispatch({ type: GET_BUDGET_FAILURE, payload: "JWT not found" });
    return;
  }

  try {
    const { data } = await api.get(`/api/budgets/report/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json", // optional, but good to include
      },
    });

    console.log("Budget Report response:", data);
    dispatch({ type: GET_BUDGET_SUCCESS, payload: data });
  } catch (error) {
    console.error("Error creating budget:", error);
    dispatch({ type: GET_BUDGET_FAILURE, payload: error });
  }
};
export const editBudgetAction = (id, budgetData) => async (dispatch) => {
  dispatch({ type: EDIT_BUDGET_DATA_REQUEST });

  if (!token) {
    console.error("JWT not found in localStorage");
    dispatch({ type: EDIT_BUDGET_DATA_FAILURE, payload: "JWT not found" });
    return;
  }

  try {
    const response = await api.put(`/api/budgets/${id}`, budgetData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("budget update response:", response.data);
    dispatch({ type: EDIT_BUDGET_DATA_SUCCESS, payload: response.data });
  } catch (error) {
    console.error("Error editing budget:", error);
    dispatch({
      type: EDIT_BUDGET_DATA_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};
export const deleteBudgetData = (deleteId) => async (dispatch) => {
  dispatch({ type: DELETE_BUDGET_REQUEST });

  if (!token) {
    console.error("JWT not found in localStorage");
    dispatch({ type: DELETE_BUDGET_FAILURE, payload: "JWT not found" });
    return;
  }

  try {
    const { data } = await api.delete(`/api/budgets/${deleteId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json", // optional, but good to include
      },
    });

    console.log("budget creation response:", data);
    dispatch({ type: DELETE_BUDGET_SUCCESS, payload: data });
  } catch (error) {
    console.error("Error creating budget:", error);
    dispatch({ type: DELETE_BUDGET_FAILURE, payload: error });
  }
};
