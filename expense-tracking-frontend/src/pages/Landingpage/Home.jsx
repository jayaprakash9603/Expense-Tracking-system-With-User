import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Left from "./Left.jsx";
import { Outlet, useParams, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import FriendInfoBar from "../../features/friends/components/FriendInfoBar";
import HeaderBar from "../../components/common/HeaderBar";
import {
  fetchFriendship,
  fetchFriendsDetailed,
} from "../../Redux/Friends/friendsActions";
import { useTheme } from "../../hooks/useTheme";
import { FloatingNotificationContainer } from "../../components/common/FloatingNotifications";
import NotFound from "../../features/errors/pages/NotFoundPage";
import Loader from "../../components/Loaders/Loader";
import { GlobalShortcuts, RecommendationToast } from "../../features/keyboard";
import StoryViewer from "../../components/Stories/StoryViewer";
import TourGuide from "../../components/common/TourGuide/TourGuide";
import AccountDeletionGraceNotice from "../../features/settings/components/AccountDeletionGraceNotice";
import useFeature from "../../hooks/useFeature";
import { SIDEBAR_MENU_FEATURES } from "../../config/featureCatalog";
import useAccountDeletionStatus from "../../features/settings/hooks/useAccountDeletionStatus";
import { logoutAction } from "../../Redux/Auth/auth.action";
import ScrollingTextBanner from "../../shared/ui/feedback/ScrollingTextBanner";
import { useTranslation } from "../../hooks/useTranslation";

const Home = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { friendId } = useParams();
  const { status, isPending, submitting, cancelDeletion, loading: deletionLoading } = useAccountDeletionStatus();
  const isFriendView = Boolean(friendId && friendId !== "undefined");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { friendship, friends, loading } = useSelector(
    (state) => state.friends || {},
  );
  const currentMode = useSelector((state) => state.auth?.currentMode || "USER");
  const [showFriendInfo, setShowFriendInfo] = useState(true);
  const [isModeSwitching, setIsModeSwitching] = useState(false);
  const previousModeRef = useRef(currentMode);
  const isAdminMode = currentMode === "ADMIN";
  const currentPath = location.pathname || "/";
  const isAdminRoute = currentPath.startsWith("/admin");
  const storiesFeedEnabled = useFeature(SIDEBAR_MENU_FEATURES.storiesFeed);
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

  if (isModeSwitching || deletionLoading) {
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

  if (isPending) {
    const purgeDate = status?.scheduledPurgeAt ? new Date(status.scheduledPurgeAt).toLocaleString() : "";
    const scrollingMessage = t("settings.deletionScrollingBanner", { date: purgeDate }) || `Account scheduled for deletion on ${purgeDate}`;
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-12 text-center"
        style={{ backgroundColor: colors.primary_bg, color: colors.primary_text }}
      >
        <div
          className="w-full max-w-2xl rounded-2xl p-6 sm:p-10 shadow-2xl transition-all duration-300"
          style={{
            backgroundColor: colors.modal_bg || colors.card_bg || "rgba(255, 255, 255, 0.03)",
            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 50px -10px rgba(245, 158, 11, 0.1)",
          }}
        >
          {/* Header Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="p-4 rounded-full animate-pulse"
              style={{ backgroundColor: "rgba(245, 158, 11, 0.15)" }}
            >
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="#f59e0b"
                strokeWidth={2}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">
            {t("settings.deletionWelcomeTitle", "Welcome back — your account is still here")}
          </h1>

          {/* Subtitle / Lead */}
          <p className="text-base sm:text-lg mb-6 max-w-lg mx-auto" style={{ color: colors.secondary_text }}>
            {t("settings.deletionWelcomeLead", { date: purgeDate }) || `You requested account deletion. Everything will be permanently removed on ${purgeDate} unless you cancel.`}
          </p>

          {/* Scrolling Banner inside the page */}
          <div
            className="h-12 rounded-xl overflow-hidden mb-8 flex items-center px-4"
            style={{
              backgroundColor: "rgba(245, 158, 11, 0.08)",
            }}
          >
            <ScrollingTextBanner
              text={scrollingMessage}
              color="#fbbf24"
              durationSeconds={18}
            />
          </div>

          {/* Detailed Points */}
          <div className="text-left space-y-4 mb-8 p-5 rounded-xl" style={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
            <h3 className="font-semibold text-base mb-2">What you need to know:</h3>
            <ul className="space-y-3 text-sm" style={{ color: colors.secondary_text }}>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">✔</span>
                <span>{t("settings.deletionWelcomePointAccess", "Your expenses, budgets, and settings are still available during the grace period.")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">✔</span>
                <span>{t("settings.deletionWelcomePointCancel", "If this was a mistake, cancel deletion to fully restore your account.")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">✔</span>
                <span>{t("settings.deletionWelcomePointPurge", { date: purgeDate }) || `If you do nothing, your account and personal data will be permanently deleted on ${purgeDate}.`}</span>
              </li>
            </ul>
            <div
              className="rounded-lg px-3 py-2 text-xs mt-4"
              style={{
                backgroundColor: "rgba(59, 130, 246, 0.12)",
                color: colors.primary_text,
              }}
            >
              {t("settings.deletionWelcomeFooter", "Need help? Contact support before your deletion date.")}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              disabled={submitting}
              onClick={async () => {
                try {
                  await cancelDeletion();
                  window.dispatchEvent(new Event("account-deletion-status-changed"));
                } catch (err) {
                  console.error("Failed to cancel deletion", err);
                }
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              style={{
                backgroundColor: colors.accent || "#14b8a6",
                color: "#ffffff",
              }}
            >
              {submitting ? t("settings.cancellingDeletion", "Restoring Account...") : t("settings.cancelDeletion", "Restore Account / Cancel Deletion")}
            </button>

            <button
              onClick={() => {
                dispatch(logoutAction());
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm border hover:bg-red-500/10 active:scale-95 transition-all duration-200"
              style={{
                color: colors.error || "#ef4444",
                borderColor: `${colors.error || "#ef4444"}40`,
              }}
            >
              {t("auth.logout", "Logout")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (shouldBlockAccess) {
    return <NotFound />;
  }

  return (
    <div
      className="flex flex-col lg:flex-row min-h-screen overflow-x-hidden"
      style={{ backgroundColor: colors.primary_bg }}
    >
      <TourGuide />

      {/* Global Keyboard Shortcuts - Registers navigation and action shortcuts */}
      <GlobalShortcuts />

      {/* Smart Shortcut Recommendations - Shows tips based on user behavior */}
      <RecommendationToast />

      {/* Global Floating Notifications - Visible across all pages */}
      <FloatingNotificationContainer />

      {/* Story Viewer Modal - Visible across all pages when stories feed is enabled */}
      {storiesFeedEnabled && <StoryViewer />}

      <div className="w-0 lg:w-[350px] flex-shrink-0">
        <Left />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
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
        <div className="flex-1 overflow-x-hidden">
          <Outlet key={location?.key || location?.pathname} />
        </div>
      </div>
    </div>
  );
};

export default Home;
