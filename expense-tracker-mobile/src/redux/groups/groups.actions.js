import { groupApi } from "@/infrastructure/api";
import {
  FETCH_GROUPS_REQUEST,
  FETCH_GROUPS_SUCCESS,
  FETCH_GROUPS_FAILURE,
  FETCH_GROUP_BY_ID_REQUEST,
  FETCH_GROUP_BY_ID_SUCCESS,
  FETCH_GROUP_BY_ID_FAILURE,
  CREATE_GROUP_SUCCESS,
  LEAVE_GROUP_SUCCESS,
  FETCH_GROUP_INVITATIONS_REQUEST,
  FETCH_GROUP_INVITATIONS_SUCCESS,
  FETCH_GROUP_INVITATIONS_FAILURE,
  RESPOND_INVITATION_SUCCESS,
  CLEAR_GROUP_ERROR,
  RESET_GROUP_STATE,
} from "./groups.actionTypes";

export const fetchGroupsAction = () => async (dispatch) => {
  dispatch({ type: FETCH_GROUPS_REQUEST });
  const { data, error } = await groupApi.getAll();
  if (error) {
    dispatch({ type: FETCH_GROUPS_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_GROUPS_SUCCESS, payload: data });
  return { success: true, data };
};

export const fetchGroupByIdAction = (id) => async (dispatch) => {
  dispatch({ type: FETCH_GROUP_BY_ID_REQUEST });
  const { data, error } = await groupApi.getById(id);
  if (error) {
    dispatch({ type: FETCH_GROUP_BY_ID_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_GROUP_BY_ID_SUCCESS, payload: data });
  return { success: true, data };
};

export const createGroupAction = (data) => async (dispatch) => {
  const { data: result, error } = await groupApi.create(data);
  if (error) return { success: false, error };
  dispatch({ type: CREATE_GROUP_SUCCESS, payload: result });
  return { success: true, data: result };
};

export const leaveGroupAction = (groupId) => async (dispatch) => {
  const { error } = await groupApi.leave(groupId);
  if (error) return { success: false, error };
  dispatch({ type: LEAVE_GROUP_SUCCESS, payload: groupId });
  return { success: true };
};

export const fetchGroupInvitationsAction = () => async (dispatch) => {
  dispatch({ type: FETCH_GROUP_INVITATIONS_REQUEST });
  const { data, error } = await groupApi.getPendingInvitations();
  if (error) {
    dispatch({ type: FETCH_GROUP_INVITATIONS_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_GROUP_INVITATIONS_SUCCESS, payload: data });
  return { success: true, data };
};

export const respondToInvitationAction = (invId, accept) => async (dispatch) => {
  const { error } = await groupApi.respondToInvitation(invId, accept);
  if (error) return { success: false, error };
  dispatch({ type: RESPOND_INVITATION_SUCCESS, payload: invId });
  return { success: true };
};

export const clearGroupError = () => ({ type: CLEAR_GROUP_ERROR });
export const resetGroupState = () => ({ type: RESET_GROUP_STATE });
