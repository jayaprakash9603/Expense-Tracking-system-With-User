import React, { useEffect, useState } from "react";
import Left from "./Left.jsx";
import { Outlet, useParams, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import FriendInfoBar from "./FriendInfoBar";
import HeaderBar from "../../components/common/HeaderBar";
import {
  fetchFriendship,
  fetchFriendsDetailed,
} from "../../Redux/Friends/friendsActions";

const Home = () => {
  const { friendId } = useParams();
  const isFriendView = Boolean(friendId && friendId !== "undefined");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { friendship, friends, loading } = useSelector(
    (state) => state.friends || {}
  );
  const [showFriendInfo, setShowFriendInfo] = useState(true);

  // Fetch friendship & friends list when entering friend view or switching friend
  useEffect(() => {
    if (isFriendView) {
      if (friendId) dispatch(fetchFriendship(friendId));
      dispatch(fetchFriendsDetailed());
    }
  }, [dispatch, friendId, isFriendView]);

  // Helper: replace current friendId segment in path
  const handleRouteChange = async (newFriendId) => {
    if (!newFriendId) return;
    const segments = location.pathname.split("/").filter(Boolean);
    const idx = segments.findIndex((s) => s === friendId);
    if (idx !== -1) {
      segments[idx] = newFriendId;
      navigate("/" + segments.join("/"));
    } else {
      // Fallback: navigate to expenses for that friend
      navigate(`/friends/expenses/${newFriendId}`);
    }
  };

  const refreshData = async (newFriendId) => {
    const id = newFriendId || friendId;
    if (!id) return;
    dispatch(fetchFriendship(id));
    dispatch(fetchFriendsDetailed());
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#1b1b1b]">
      <div className="md:w-[400px] lg:w-[450px]">
        <Left />
      </div>
      <div className="flex-1 flex flex-col">
        {/* Global Friend Info Bar (optional per-page duplicates can be removed later) */}
        {isFriendView ? (
          <FriendInfoBar
            friendship={friendship}
            friendId={friendId}
            friends={friends || []}
            loading={loading}
            onRouteChange={handleRouteChange}
            refreshData={refreshData}
            showInfoBar={showFriendInfo}
          />
        ) : (
          <HeaderBar />
        )}
        <div className="flex-1">
          <Outlet /> {/* Renders HomeContent or other route components */}
        </div>
      </div>
    </div>
  );
};

export default Home;
