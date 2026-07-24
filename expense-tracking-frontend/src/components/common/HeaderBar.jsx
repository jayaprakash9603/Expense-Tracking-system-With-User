import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Share2 } from "lucide-react";
import { useMasking } from "../../hooks/useMasking";
import { useTheme } from "../../hooks/useTheme";
import { toggleTheme } from "../../Redux/Theme/theme.actions";
import { updateUserSettings } from "../../Redux/UserSettings/userSettings.action";
import NotificationsPanelRedux from "./NotificationsPanelRedux";
import SystemErrorIndicator from "./SystemErrorIndicator";
import ProfileDropdown from "./ProfileDropdown";
import { useTranslation } from "../../hooks/useTranslation";
import GlobalHeaderMessageSlot from "./GlobalHeaderMessage/GlobalHeaderMessageSlot";
import { InlineSearchBar, UniversalSearchModal } from "./UniversalSearch";
import { useFeature } from "../../hooks/useFeature";
import { FEATURE_KEYS, SUB_FEATURE_KEYS } from "../../config/featureCatalog";
import useAccountDeletionStatus from "../../features/settings/hooks/useAccountDeletionStatus";
import ScrollingTextBanner from "../../shared/ui/feedback/ScrollingTextBanner";

/**
 * HeaderBar Component
 * Displays notifications icon, theme toggle, user profile with dropdown menu
 * Used in the main layout when not in friend view
 */
const HeaderBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, colors, themeLocked } = useTheme();
  const { isMasking, toggleMasking } = useMasking();
  const maskingEnabled = isMasking();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(5);
  const { t } = useTranslation();
  const searchEnabled = useFeature(FEATURE_KEYS.SEARCH);
  const { status, isPending, submitting, cancelDeletion } = useAccountDeletionStatus();
  const notificationsEnabled = useFeature(FEATURE_KEYS.NOTIFICATIONS);
  const sharingCreateEnabled = useFeature(SUB_FEATURE_KEYS.SHARING_CREATE);

  const isDark = mode === "dark";
  const headerActionButtonStyle = {
    backgroundColor: colors.button_inactive,
    color: colors.icon_default,
  };

  // Calculate total selected items for sharing
  const sharedSelection = useSelector((state) => state.sharedSelection) || {
    selectedExpenses: [],
    selectedCategories: [],
    selectedPaymentMethods: [],
    selectedBills: [],
    selectedBudgets: [],
  };
  const totalSelectedItems =
    sharedSelection.selectedExpenses.length +
    sharedSelection.selectedCategories.length +
    sharedSelection.selectedPaymentMethods.length +
    sharedSelection.selectedBills.length +
    sharedSelection.selectedBudgets.length;

  const handleThemeToggle = () => {
    if (themeLocked) return;
    dispatch(toggleTheme());

    // Update user settings in backend
    const newMode = isDark ? "light" : "dark";
    dispatch(updateUserSettings({ themeMode: newMode })).catch((error) => {
      console.error("Failed to update theme setting:", error);
    });
  };

  // Get full lists to map names for CreateSharePage
  const expenses = useSelector((state) => state.expenses?.expenses);
  const categories = useSelector((state) => state.categories?.categories);
  const budgets = useSelector((state) => state.budgets?.budgets);

  const handleShareClick = () => {
    if (totalSelectedItems === 0) return;

    const expenseList = Array.isArray(expenses) ? expenses : expenses?.content || [];
    const categoryList = Array.isArray(categories) ? categories : categories?.content || [];
    const budgetList = Array.isArray(budgets) ? budgets : budgets?.content || [];

    const expenseItems = sharedSelection.selectedExpenses.map((id) => {
      const exp = expenseList.find((e) => e.id === id);
      const details = exp?.expense || exp;
      return {
        internalId: id,
        id,
        externalRef: `EXPENSE_${id}`,
        displayName: details?.name || details?.expenseName || `Expense #${id}`,
        subtitle: details?.categoryName || details?.category?.name || "",
        amount: details?.amount,
        date: details?.date || details?.createdAt,
      };
    });

    const categoryItems = sharedSelection.selectedCategories.map((id) => {
      const cat = categoryList.find((c) => c.id === id);
      return {
        internalId: id,
        id,
        externalRef: `CATEGORY_${id}`,
        displayName: cat?.name || `Category #${id}`,
      };
    });

    const budgetItems = sharedSelection.selectedBudgets.map((id) => {
      const budget = budgetList.find((b) => b.id === id);
      return {
        internalId: id,
        id,
        externalRef: `BUDGET_${id}`,
        displayName: budget?.name || `Budget #${id}`,
      };
    });

    // CreateSharePage supports one type at a time - use the type with most items
    const typeCounts = {
      EXPENSE: expenseItems.length,
      CATEGORY: categoryItems.length,
      BUDGET: budgetItems.length,
    };
    const preSelectedType =
      typeCounts.EXPENSE >= typeCounts.CATEGORY && typeCounts.EXPENSE >= typeCounts.BUDGET
        ? "EXPENSE"
        : typeCounts.CATEGORY >= typeCounts.BUDGET
          ? "CATEGORY"
          : "BUDGET";

    const preSelectedItems =
      preSelectedType === "EXPENSE"
        ? expenseItems
        : preSelectedType === "CATEGORY"
          ? categoryItems
          : budgetItems;

    navigate("/my-shares/create", {
      state: {
        preSelectedType,
        preSelectedItems,
        returnRoute: location.pathname,
        returnRouteState: location.state,
      },
    });
  };

  return (
    <>
      {/* Universal Search Modal - Opens with Ctrl/Cmd + K */}
      <UniversalSearchModal />

      <div
        className="h-[50px] flex items-center justify-between px-4 sm:px-6 transition-colors"
        style={{
          backgroundColor: colors.primary_bg,
        }}
      >
        {/* Left Section: Empty or logo */}
        <div className="flex items-center gap-3">
          {/* Placeholder for left content */}
        </div>

        {/* Center Section: Global messages or Deletion Pending Indicator */}
        <div className="flex-1 flex justify-end px-2">
          {isPending ? (
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-full border text-xs"
              style={{
                borderColor: "rgba(245, 158, 11, 0.35)",
                backgroundColor: "rgba(245, 158, 11, 0.08)",
                width: "100%",
                maxWidth: 400,
                height: 32,
              }}
            >
              <span className="text-amber-500 font-bold flex-shrink-0 animate-pulse">⚠ DELETION PENDING:</span>
              <div className="flex-1 min-w-0 h-full flex items-center">
                <ScrollingTextBanner
                  text={t("settings.deletionScrollingBanner", { date: new Date(status?.scheduledPurgeAt).toLocaleString() })}
                  color="#fbbf24"
                  durationSeconds={15}
                />
              </div>
              <button
                onClick={async () => {
                  try {
                    await cancelDeletion();
                    window.dispatchEvent(new Event("account-deletion-status-changed"));
                  } catch (err) {
                    console.error("Failed to cancel deletion", err);
                  }
                }}
                disabled={submitting}
                className="px-2 py-0.5 rounded text-[10px] font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95 flex-shrink-0"
                style={{
                  backgroundColor: colors.accent || "#14b8a6",
                }}
              >
                {submitting ? "Restoring..." : "Cancel"}
              </button>
            </div>
          ) : (
            <div className="w-full" style={{ maxWidth: 500 }}>
              <GlobalHeaderMessageSlot className="justify-end" />
            </div>
          )}
        </div>

        {/* Right Section: Search, Masking Toggle, Theme Toggle & Profile */}
        <div
          className="flex items-center gap-3 sm:gap-4"
          style={{ color: colors.icon_default }}
        >
          {/* Inline Search Bar */}
          {searchEnabled && (
            <div id="header-search">
              <InlineSearchBar />
            </div>
          )}

          {/* Masking Toggle Button */}
          <button
            id="header-masking"
            onClick={toggleMasking}
            data-shortcut="masking"
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
            style={headerActionButtonStyle}
            title={
              maskingEnabled ? t("header.showAmounts") : t("header.hideAmounts")
            }
          >
            {maskingEnabled ? (
              <VisibilityOffIcon className="w-5 h-5" />
            ) : (
              <VisibilityIcon className="w-5 h-5" />
            )}
          </button>

          {/* Theme Toggle Button — hidden when theme customization is dormant (dark mode only) */}
          {!themeLocked && (
          <button
            id="header-theme"
            onClick={handleThemeToggle}
            data-shortcut="theme"
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
            style={headerActionButtonStyle}
            title={
              isDark ? t("header.switchToLight") : t("header.switchToDark")
            }
          >
            {isDark ? (
              // Sun Icon (Light Mode)
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              // Moon Icon (Dark Mode)
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          )}

          <SystemErrorIndicator isDark={isDark} />

          {/* Share Button */}
          {sharingCreateEnabled && totalSelectedItems > 0 && (
            <div className="relative">
              <button
                id="header-share"
                onClick={handleShareClick}
                className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                style={headerActionButtonStyle}
                title={t("header.shareSelected", "Share Selected Items")}
              >
                <Badge
                  badgeContent={totalSelectedItems}
                  color="primary"
                  max={99}
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.625rem",
                      height: "16px",
                      minWidth: "16px",
                      padding: "0 4px",
                    },
                  }}
                >
                  <Share2 className="w-5 h-5" />
                </Badge>
              </button>
            </div>
          )}

          {/* Notifications Button */}
          {notificationsEnabled && (
          <div className="relative">
            <button
              id="header-notifications"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              data-shortcut="notifications"
              className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
              style={headerActionButtonStyle}
              title={t("header.notifications")}
            >
              <Badge
                badgeContent={unreadNotificationsCount}
                color="error"
                max={99}
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: "0.625rem",
                    height: "16px",
                    minWidth: "16px",
                    padding: "0 4px",
                  },
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </Badge>
            </button>
          </div>
          )}
          <div id="header-profile">
            <ProfileDropdown />
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      {notificationsEnabled && (
      <NotificationsPanelRedux
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNotificationRead={setUnreadNotificationsCount}
      />
      )}
    </>
  );
};

export default HeaderBar;
