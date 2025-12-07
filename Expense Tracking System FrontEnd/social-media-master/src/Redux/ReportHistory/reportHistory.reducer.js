import * as actionTypes from "./reportHistory.actionTypes";

const initialState = {
  reports: [],
  statistics: {
    totalReports: 0,
    successfulReports: 0,
    failedReports: 0,
    successRate: 0,
  },
  loading: false,
  error: null,
};

export const reportHistoryReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch all report history
    case actionTypes.FETCH_REPORT_HISTORY_REQUEST:
    case actionTypes.FETCH_REPORT_HISTORY_BY_STATUS_REQUEST:
    case actionTypes.FETCH_RECENT_REPORT_HISTORY_REQUEST:
    case actionTypes.FETCH_REPORT_HISTORY_BY_DATE_RANGE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.FETCH_REPORT_HISTORY_SUCCESS:
    case actionTypes.FETCH_REPORT_HISTORY_BY_STATUS_SUCCESS:
    case actionTypes.FETCH_RECENT_REPORT_HISTORY_SUCCESS:
    case actionTypes.FETCH_REPORT_HISTORY_BY_DATE_RANGE_SUCCESS:
      return {
        ...state,
        reports: action.payload,
        loading: false,
        error: null,
      };

    case actionTypes.FETCH_REPORT_HISTORY_FAILURE:
    case actionTypes.FETCH_REPORT_HISTORY_BY_STATUS_FAILURE:
    case actionTypes.FETCH_RECENT_REPORT_HISTORY_FAILURE:
    case actionTypes.FETCH_REPORT_HISTORY_BY_DATE_RANGE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Fetch report statistics
    case actionTypes.FETCH_REPORT_STATISTICS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.FETCH_REPORT_STATISTICS_SUCCESS:
      return {
        ...state,
        statistics: action.payload,
        loading: false,
        error: null,
      };

    case actionTypes.FETCH_REPORT_STATISTICS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Clear report history
    case actionTypes.CLEAR_REPORT_HISTORY:
      return initialState;

    default:
      return state;
  }
};
