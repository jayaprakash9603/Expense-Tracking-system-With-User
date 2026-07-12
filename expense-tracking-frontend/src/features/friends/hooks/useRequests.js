import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFriendRequests,
  fetchOutgoingRequests,
  respondToFriendRequest,
  cancelFriendRequest,
} from "../../../Redux/Friends/friendsActions";
import { REQUEST_TABS } from "../constants/friendsConstants";

export function useRequests() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(REQUEST_TABS.INCOMING);

  const friendRequests = useSelector((state) => state.friends?.friendRequests ?? []);
  const outgoingRequests = useSelector((state) => state.friends?.outgoingRequests ?? []);
  const loadingRequests = useSelector((state) => state.friends?.loadingRequests ?? false);
  const loadingOutgoingRequests = useSelector((state) => state.friends?.loadingOutgoingRequests ?? false);

  useEffect(() => {
    dispatch(fetchFriendRequests());
    dispatch(fetchOutgoingRequests());
  }, [dispatch]);

  const handleAccept = useCallback(
    (requestId) => dispatch(respondToFriendRequest(requestId, true)),
    [dispatch]
  );

  const handleReject = useCallback(
    (requestId) => dispatch(respondToFriendRequest(requestId, false)),
    [dispatch]
  );

  const handleCancel = useCallback(
    (requestId) => dispatch(cancelFriendRequest(requestId)),
    [dispatch]
  );

  const pendingCount = friendRequests.length;

  return {
    activeTab,
    setActiveTab,
    friendRequests,
    outgoingRequests,
    loadingRequests,
    loadingOutgoingRequests,
    handleAccept,
    handleReject,
    handleCancel,
    pendingCount,
  };
}
