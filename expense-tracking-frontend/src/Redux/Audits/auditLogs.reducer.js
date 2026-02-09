import {
  GET_AUDIT_LOGS_REQUEST,
  GET_AUDIT_LOGS_SUCCESS,
  GET_AUDIT_LOGS_FAILURE,
  SEND_AUDIT_LOGS_EMAIL_REQUEST,
  SEND_AUDIT_LOGS_EMAIL_SUCCESS,
  SEND_AUDIT_LOGS_EMAIL_FAILURE,
} from "./auditLogs.actionType";

const initialState = {
  auditLogs: [],
  loading: false,
  error: null,
  emailSending: false,
  emailSuccess: false,
};

export const auditLogsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_AUDIT_LOGS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_AUDIT_LOGS_SUCCESS:
      return {
        ...state,
        loading: false,
        auditLogs: action.payload,
        error: null,
      };

    case GET_AUDIT_LOGS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        auditLogs: [],
      };

    case SEND_AUDIT_LOGS_EMAIL_REQUEST:
      return {
        ...state,
        emailSending: true,
        emailSuccess: false,
        error: null,
      };

    case SEND_AUDIT_LOGS_EMAIL_SUCCESS:
      return {
        ...state,
        emailSending: false,
        emailSuccess: true,
        error: null,
      };

    case SEND_AUDIT_LOGS_EMAIL_FAILURE:
      return {
        ...state,
        emailSending: false,
        emailSuccess: false,
        error: action.payload,
      };

    default:
      return state;
  }
};
