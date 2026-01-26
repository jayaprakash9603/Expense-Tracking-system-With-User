import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Left from "./Left.jsx";
import { Outlet, useParams, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import FriendInfoBar from "./FriendInfoBar";
import HeaderBar from "../../components/common/HeaderBar";
import {
  fetchFriendship,
  fetchFriendsDetailed,
} from "../../Redux/Friends/friendsActions";
import { useTheme } from "../../hooks/useTheme";
import { FloatingNotificationContainer } from "../../components/common/FloatingNotifications";
import NotFound from "./Errors/NotFound";
import Loader from "../../components/Loaders/Loader";
import { GlobalShortcuts, RecommendationToast } from "../../features/keyboard";

const Home = () => {
  const { colors } = useTheme();
  const { friendId } = useParams();
  const isFriendView = Boolean(friendId && friendId !== "undefined");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { friendship, friends, loading } = useSelector(
    (state) => state.friends || {}
  );
  const currentMode = useSelector((state) => state.auth?.currentMode || "USER");
  const [showFriendInfo, setShowFriendInfo] = useState(true);
  const [isModeSwitching, setIsModeSwitching] = useState(false);
  const previousModeRef = useRef(currentMode);
  const isAdminMode = currentMode === "ADMIN";
  const currentPath = location.pathname || "/";
  const isAdminRoute = currentPath.startsWith("/admin");
  const rawShouldBlock = Boolean(currentMode)
    ? (isAdminMode && !isAdminRoute) || (!isAdminMode && isAdminRoute)
    : false;
  const shouldBlockAccess = !isModeSwitching && rawShouldBlock;

  useLayoutEffect(() => {
    if (!currentMode) return;
    if (previousModeRef.current === currentMode) return;

    previousModeRef.current = currentMode;
    setIsModeSwitching(true);

    const targetRoute =
      currentMode === "ADMIN" ? "/admin/dashboard" : "/dashboard";
    navigate(targetRoute, { replace: true, state: { fromModeToggle: true } });
  }, [currentMode, navigate]);

  useEffect(() => {
    if (!isModeSwitching) return;
    const modeMatchesRoute =
      currentMode === "ADMIN" ? isAdminRoute : !isAdminRoute;
    if (modeMatchesRoute) {
      setIsModeSwitching(false);
    }
  }, [isModeSwitching, currentMode, isAdminRoute]);

  // Fetch friendship & friends list when entering friend view or switching friend
  useEffect(() => {
    if (shouldBlockAccess || isModeSwitching) {
      return;
    }
    if (isFriendView) {
      if (friendId) dispatch(fetchFriendship(friendId));
      dispatch(fetchFriendsDetailed());
    }
  }, [dispatch, friendId, isFriendView, shouldBlockAccess, isModeSwitching]);

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

  if (isModeSwitching) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: colors.primary_bg }}
      >
        <Loader />
      </div>
    );
  }

  if (shouldBlockAccess) {
    return <NotFound />;
  }

  return (
    <div
      className="flex flex-col md:flex-row min-h-screen"
      style={{ backgroundColor: colors.primary_bg }}
    >
      {/* Global Keyboard Shortcuts - Registers navigation and action shortcuts */}
      <GlobalShortcuts />

      {/* Smart Shortcut Recommendations - Shows tips based on user behavior */}
      <RecommendationToast />

      {/* Global Floating Notifications - Visible across all pages */}
      <FloatingNotificationContainer />

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
          <Outlet key={location?.key || location?.pathname} />
        </div>
      </div>
    </div>
  );
};

export default Home;
