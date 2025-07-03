import {
  FETCH_BILLS_REQUEST,
  FETCH_BILLS_SUCCESS,
  FETCH_BILLS_FAILURE,
  CREATE_BILL_REQUEST,
  CREATE_BILL_SUCCESS,
  CREATE_BILL_FAILURE,
  UPDATE_BILL_REQUEST,
  UPDATE_BILL_SUCCESS,
  UPDATE_BILL_FAILURE,
  DELETE_BILL_REQUEST,
  DELETE_BILL_SUCCESS,
  DELETE_BILL_FAILURE,
  GET_BILL_BY_ID_REQUEST,
  GET_BILL_BY_ID_SUCCESS,
  GET_BILL_BY_ID_FAILURE,
  FILTER_BILLS_BY_TYPE,
  SET_BILLS_PAGINATION,
  CLEAR_BILLS_ERROR,
  RESET_BILLS_STATE,
} from "./bill.actionType";

const initialState = {
  bills: [],
  currentBill: null,
  filteredBills: [],
  loading: false,
  error: null,
  filter: {
    type: "all", // 'all', 'gain', 'loss'
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 4,
    totalPages: 0,
  },
  summary: {
    totalBills: 0,
    totalAmount: 0,
    totalNetAmount: 0,
    totalCreditDue: 0,
    incomeCount: 0,
    expenseCount: 0,
  },
};

const billReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_BILLS_REQUEST:
    case CREATE_BILL_REQUEST:
    case UPDATE_BILL_REQUEST:
    case DELETE_BILL_REQUEST:
    case GET_BILL_BY_ID_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_BILLS_SUCCESS:
      const bills = action.payload;
      const filteredBills = filterBillsByType(bills, state.filter.type);
      const summary = calculateSummary(bills);
      const totalPages = Math.ceil(
        filteredBills.length / state.pagination.itemsPerPage
      );

      return {
        ...state,
        loading: false,
        bills,
        filteredBills,
        summary,
        pagination: {
          ...state.pagination,
          totalPages,
        },
        error: null,
      };

    case CREATE_BILL_SUCCESS:
      const newBills = [...state.bills, action.payload];
      const newFilteredBills = filterBillsByType(newBills, state.filter.type);
      const newSummary = calculateSummary(newBills);
      const newTotalPages = Math.ceil(
        newFilteredBills.length / state.pagination.itemsPerPage
      );

      return {
        ...state,
        loading: false,
        bills: newBills,
        filteredBills: newFilteredBills,
        summary: newSummary,
        pagination: {
          ...state.pagination,
          totalPages: newTotalPages,
        },
        error: null,
      };

    case UPDATE_BILL_SUCCESS:
      const updatedBills = state.bills.map((bill) =>
        bill.id === action.payload.id ? action.payload : bill
      );
      const updatedFilteredBills = filterBillsByType(
        updatedBills,
        state.filter.type
      );
      const updatedSummary = calculateSummary(updatedBills);

      return {
        ...state,
        loading: false,
        bills: updatedBills,
        filteredBills: updatedFilteredBills,
        summary: updatedSummary,
        currentBill: action.payload,
        error: null,
      };

    case DELETE_BILL_SUCCESS:
      const remainingBills = state.bills.filter(
        (bill) => bill.id !== action.payload
      );
      const remainingFilteredBills = filterBillsByType(
        remainingBills,
        state.filter.type
      );
      const remainingSummary = calculateSummary(remainingBills);
      const remainingTotalPages = Math.ceil(
        remainingFilteredBills.length / state.pagination.itemsPerPage
      );

      return {
        ...state,
        loading: false,
        bills: remainingBills,
        filteredBills: remainingFilteredBills,
        summary: remainingSummary,
        pagination: {
          ...state.pagination,
          totalPages: remainingTotalPages,
        },
        error: null,
      };

    case GET_BILL_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        currentBill: action.payload,
        error: null,
      };

    case FILTER_BILLS_BY_TYPE:
      const typeFilteredBills = filterBillsByType(state.bills, action.payload);
      const typeFilterTotalPages = Math.ceil(
        typeFilteredBills.length / state.pagination.itemsPerPage
      );

      return {
        ...state,
        filter: {
          ...state.filter,
          type: action.payload,
        },
        filteredBills: typeFilteredBills,
        pagination: {
          ...state.pagination,
          currentPage: 1, // Reset to first page when filter changes
          totalPages: typeFilterTotalPages,
        },
      };

    case SET_BILLS_PAGINATION:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          ...action.payload,
        },
      };

    case FETCH_BILLS_FAILURE:
    case CREATE_BILL_FAILURE:
    case UPDATE_BILL_FAILURE:
    case DELETE_BILL_FAILURE:
    case GET_BILL_BY_ID_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CLEAR_BILLS_ERROR:
      return {
        ...state,
        error: null,
      };

    case RESET_BILLS_STATE:
      return initialState;

    default:
      return state;
  }
};

// Helper function to filter bills by type
const filterBillsByType = (bills, type) => {
  switch (type) {
    case "gain":
      return bills.filter((bill) => bill.type === "gain");
    case "loss":
      return bills.filter((bill) => bill.type === "loss");
    case "all":
    default:
      return bills;
  }
};

// Helper function to calculate summary
const calculateSummary = (bills) => {
  const totalBills = bills.length;
  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const totalNetAmount = bills.reduce((sum, bill) => sum + bill.netAmount, 0);
  const totalCreditDue = bills.reduce((sum, bill) => sum + bill.creditDue, 0);
  const incomeCount = bills.filter((bill) => bill.type === "gain").length;
  const expenseCount = bills.filter((bill) => bill.type === "loss").length;

  return {
    totalBills,
    totalAmount,
    totalNetAmount,
    totalCreditDue,
    incomeCount,
    expenseCount,
  };
};

export default billReducer;
