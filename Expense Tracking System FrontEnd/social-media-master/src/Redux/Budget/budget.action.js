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
  GET_DETAILED_BUDGET_REPORT_REQUEST,
  GET_DETAILED_BUDGET_REPORT_SUCCESS,
  GET_DETAILED_BUDGET_REPORT_FAILURE,
  GET_FILTERED_BUDGETS_REPORT_REQUEST,
  GET_FILTERED_BUDGETS_REPORT_SUCCESS,
  GET_FILTERED_BUDGETS_REPORT_FAILURE,
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

export const createBudgetAction =
  (budgetData, targetId) => async (dispatch) => {
    dispatch({ type: CREATE_BUDGET_REQUEST });

    console.log("Sending budget data:", budgetData);

    try {
      const { data } = await api.post(
        `/api/budgets`,
        budgetData, // ✅ correct: plain JSON body
        {
          params: {
            targetId: targetId, // Pass targetId as a query parameter
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

export const getBudgetData = (targetId) => async (dispatch) => {
  dispatch({ type: GET_ALL_BUDGET_DATA_REQUEST });

  try {
    const { data } = await api.get(`/api/budgets`, {
      params: {
        targetId: targetId, // Pass targetId as a query parameter
      },
    });

    console.log("budget creation response:", data);
    dispatch({ type: GET_ALL_BUDGET_DATA_SUCCESS, payload: data });
  } catch (error) {
    console.error("Error creating budget:", error);
    dispatch({ type: GET_ALL_BUDGET_DATA_FAILURE, payload: error });
  }
};

export const getBudgetById = (id, targetId) => async (dispatch) => {
  dispatch({ type: GET_BUDGET_DATA_REQUEST });

  try {
    const { data } = await api.get(`/api/budgets/${id}`, {
      params: {
        targetId: targetId || "",
      },
    });

    console.log("budget creation response:", data);
    dispatch({ type: GET_BUDGET_DATA_SUCCESS, payload: data });
  } catch (error) {
    console.error("Error creating budget:", error);
    dispatch({ type: GET_BUDGET_DATA_FAILURE, payload: error });
  }
};

export const getListOfBudgetsById = (date, targetId) => async (dispatch) => {
  dispatch({ type: GET_LIST_BUDGETS_REQUEST });

  try {
    const { data } = await api.get(`/api/budgets/filter-by-date`, {
      params: {
        date: date,
        targetId: targetId || "",
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
  ({ id, date, targetId }) =>
  async (dispatch) => {
    dispatch({ type: GET_SELECT_BUDGETS_REQUEST_BY_EXPENSE_ID });

    console.log("Fetching budgets by expense ID:", id, "and date:", date);
    try {
      const { data } = await api.get(`/api/budgets/expenses`, {
        params: { expenseId: id, date: date, targetId: targetId || "" },
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

export const getBudgetReportById = (id, targetId) => async (dispatch) => {
  dispatch({ type: GET_BUDGET_REPORT_REQUEST });

  try {
    const { data } = await api.get(`/api/budgets/report/${id}`, {
      params: {
        targetId: targetId || "",
      },
    });

    console.log("Budget Report response:", data);
    dispatch({ type: GET_BUDGET_SUCCESS, payload: data });
  } catch (error) {
    console.error("Error creating budget:", error);
    dispatch({ type: GET_BUDGET_FAILURE, payload: error });
  }
};
export const editBudgetAction =
  (id, budgetData, targetId) => async (dispatch) => {
    dispatch({ type: EDIT_BUDGET_DATA_REQUEST });

    try {
      const response = await api.put(`/api/budgets/${id}`, budgetData, {
        params: {
          targetId: targetId || "",
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
export const deleteBudgetData = (deleteId, targetId) => async (dispatch) => {
  dispatch({ type: DELETE_BUDGET_REQUEST });

  try {
    const { data } = await api.delete(`/api/budgets/${deleteId}`, {
      params: {
        targetId: targetId || "",
      },
    });

    console.log("budget creation response:", data);
    dispatch({ type: DELETE_BUDGET_SUCCESS, payload: data });
  } catch (error) {
    console.error("Error creating budget:", error);
    dispatch({ type: DELETE_BUDGET_FAILURE, payload: error });
  }
};

export const getDetailedBudgetReport =
  (
    id,
    targetId,
    rangeType = "all",
    offset = 0,
    flowType = "all",
    fromDate = null,
    toDate = null
  ) =>
  async (dispatch) => {
    dispatch({ type: GET_DETAILED_BUDGET_REPORT_REQUEST });

    try {
      const params = {
        targetId: targetId || "",
      };

      // Prefer explicit dates if provided
      if (fromDate && toDate) {
        params.fromDate = fromDate;
        params.toDate = toDate;
      } else {
        params.rangeType = rangeType;
        params.offset = offset;
      }

      if (flowType && flowType !== "all") {
        params.flowType = flowType;
      }

      const { data } = await api.get(`/api/budgets/detailed-report/${id}`, {
        params,
      });

      console.log("Detailed Budget Report response:", data);
      dispatch({ type: GET_DETAILED_BUDGET_REPORT_SUCCESS, payload: data });
      return data;
    } catch (error) {
      console.error("Error fetching detailed budget report:", error);
      dispatch({ type: GET_DETAILED_BUDGET_REPORT_FAILURE, payload: error });
      throw error;
    }
  };

export const getFilteredBudgetsReport =
  ({ fromDate, toDate, rangeType, offset = 0, flowType, targetId }) =>
  async (dispatch) => {
    dispatch({ type: GET_FILTERED_BUDGETS_REPORT_REQUEST });

    try {
      const params = {
        targetId: targetId || "",
      };

      if (fromDate && toDate) {
        params.fromDate = fromDate;
        params.toDate = toDate;
      } else if (rangeType) {
        params.rangeType = rangeType;
        params.offset = offset;
      }

      if (flowType && flowType !== "all") {
        params.flowType = flowType;
      }

      const { data } = await api.get(
        `/api/budgets/all-with-expenses/detailed/filtered`,
        {
          params,
        }
      );

      console.log("Filtered Budgets Report response:", data);
      dispatch({ type: GET_FILTERED_BUDGETS_REPORT_SUCCESS, payload: data });
      return data;
    } catch (error) {
      console.error("Error fetching filtered budgets report:", error);
      dispatch({
        type: GET_FILTERED_BUDGETS_REPORT_FAILURE,
        payload: error.response?.data || error.message,
      });
      throw error;
    }
  };
