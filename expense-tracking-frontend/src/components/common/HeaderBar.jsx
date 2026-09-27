import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Badge, useMediaQuery } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
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
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const { t } = useTranslation();
  const searchEnabled = useFeature(FEATURE_KEYS.SEARCH);
  const { status, isPending, submitting, cancelDeletion } = useAccountDeletionStatus();
  const notificationsEnabled = useFeature(FEATURE_KEYS.NOTIFICATIONS);
  const sharingCreateEnabled = useFeature(SUB_FEATURE_KEYS.SHARING_CREATE);

  const isDark = mode === "dark";
  const isCompactHeader = useMediaQuery("(max-width:1024px)");
  const headerIconColor = isDark ? "#f3f4f6" : colors.primary_text;

  const headerIconSize = 18;
  const headerActionSize = 40;

  const headerIconSx = {
    fontSize: headerIconSize,
    color: "inherit",
    display: "block",
  };

  const headerActionSurface = isDark
    ? "rgba(255, 255, 255, 0.07)"
    : colors.tertiary_bg;

  const headerActionButtonStyle = {
    width: headerActionSize,
    height: headerActionSize,
    minWidth: headerActionSize,
    minHeight: headerActionSize,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    borderRadius: 10,
    backgroundColor: headerActionSurface,
    color: headerIconColor,
    lineHeight: 1,
    border: "none",
    boxShadow: "none",
    cursor: "pointer",
    flexShrink: 0,
  };

  const menuButtonStyle = {
    ...headerActionButtonStyle,
    backgroundColor: colors.primary_accent,
    color: "#0a0a0a",
    boxShadow: `0 2px 8px ${colors.primary_accent}40`,
  };

  const toggleAppSidebar = () => {
    window.dispatchEvent(new CustomEvent("app-sidebar-toggle"));
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
        className="flex items-center justify-between px-3 sm:px-5 transition-colors"
        style={{
          backgroundColor: colors.primary_bg,
          borderBottom: `1px solid ${
            isDark ? "rgba(255,255,255,0.08)" : colors.border_color
          }`,
          minHeight: 56,
          height: 56,
          boxSizing: "border-box",
        }}
      >
        {/* Left: mobile/tablet menu */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isCompactHeader ? (
            <button
              type="button"
              onClick={toggleAppSidebar}
              aria-label={t("header.openMenu", "Open menu")}
              className="transition-all duration-200 hover:opacity-95 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={menuButtonStyle}
            >
              <MenuRoundedIcon sx={{ fontSize: 20 }} />
            </button>
          ) : null}
        </div>

        {/* Center Section: Global messages or Deletion Pending Indicator */}
        <div className="flex-1 flex justify-end px-2 min-w-0">
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
          className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0"
          style={{ color: colors.primary_text }}
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
            type="button"
            onClick={toggleMasking}
            data-shortcut="masking"
            className="transition-all duration-200 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
            style={
              maskingEnabled
                ? {
                    ...headerActionButtonStyle,
                    border: "none",
                    color: colors.primary_accent,
                    backgroundColor: isDark
                      ? `${colors.primary_accent}22`
                      : `${colors.primary_accent}18`,
                  }
                : headerActionButtonStyle
            }
            aria-label={
              maskingEnabled ? t("header.showAmounts") : t("header.hideAmounts")
            }
            title={
              maskingEnabled ? t("header.showAmounts") : t("header.hideAmounts")
            }
          >
            {maskingEnabled ? (
              <VisibilityOffIcon sx={headerIconSx} />
            ) : (
              <VisibilityIcon sx={headerIconSx} />
            )}
          </button>

          {/* Theme Toggle Button — hidden when theme customization is dormant (dark mode only) */}
          {!themeLocked && (
          <button
            id="header-theme"
            type="button"
            onClick={handleThemeToggle}
            data-shortcut="theme"
            className="transition-all duration-200 hover:opacity-95 active:scale-[0.97] focus:outline-none focus-visible:ring-2"
            style={headerActionButtonStyle}
            aria-label={
              isDark ? t("header.switchToLight") : t("header.switchToDark")
            }
            title={
              isDark ? t("header.switchToLight") : t("header.switchToDark")
            }
          >
            {isDark ? (
              <LightModeOutlinedIcon sx={headerIconSx} aria-hidden />
            ) : (
              <DarkModeOutlinedIcon sx={headerIconSx} aria-hidden />
            )}
          </button>
          )}

          <SystemErrorIndicator
            isDark={isDark}
            buttonStyle={headerActionButtonStyle}
            iconColor={headerIconColor}
          />

          {/* Share Button */}
          {sharingCreateEnabled && totalSelectedItems > 0 && (
            <div className="relative">
              <button
                id="header-share"
                type="button"
                onClick={handleShareClick}
                className="transition-all duration-200 hover:opacity-95 active:scale-[0.97] focus:outline-none focus-visible:ring-2"
                style={headerActionButtonStyle}
                aria-label={t("header.shareSelected", "Share Selected Items")}
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
                  <Share2 size={18} color={headerIconColor} strokeWidth={2} />
                </Badge>
              </button>
            </div>
          )}

          {/* Notifications Button */}
          {notificationsEnabled && (
          <div className="relative">
            <button
              id="header-notifications"
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              data-shortcut="notifications"
              className="transition-all duration-200 hover:opacity-95 active:scale-[0.97] focus:outline-none focus-visible:ring-2"
              style={headerActionButtonStyle}
              aria-label={t("header.notifications")}
              title={t("header.notifications")}
            >
              <Badge
                badgeContent={unreadNotificationsCount}
                color="error"
                max={99}
                invisible={!unreadNotificationsCount}
                overlap="circular"
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "& .MuiBadge-badge": {
                    fontSize: "0.625rem",
                    height: "16px",
                    minWidth: "16px",
                    padding: "0 4px",
                  },
                }}
              >
                <NotificationsNoneOutlinedIcon sx={headerIconSx} aria-hidden />
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
