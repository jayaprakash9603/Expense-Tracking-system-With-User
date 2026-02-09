import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "../../../hooks/useTranslation";
import { useTheme } from "../../../hooks/useTheme";
import { updateProfileAction } from "../../../Redux/Auth/auth.action";

const TourGuide = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Only run if user is loaded and hasn't completed tour
    if (user && user.isTourCompleted === false) {
      // Small delay to ensure everything is rendered
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setRun(false);
    }
  }, [user?.isTourCompleted]); // Dependency on isTourCompleted

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      // Update backend
      if (user) {
        dispatch(updateProfileAction({ isTourCompleted: true }));
      }
    }
  };

  // Define Navigation Items (Matches Sidebar)
  const navItems = [
    { id: "#nav-item-dashboard", messageKey: "tour.dashboardMessage" },
    { id: "#nav-item-expenses", messageKey: "tour.expensesMessage" },
    { id: "#nav-item-category-flow", messageKey: "tour.categoriesMessage" },
    { id: "#nav-item-payment-method", messageKey: "tour.paymentsMessage" },
    { id: "#nav-item-bill", messageKey: "tour.billMessage" },
    { id: "#nav-item-friends", messageKey: "tour.friendsMessage" },
    { id: "#nav-item-groups", messageKey: "tour.groupsMessage" },
    { id: "#nav-item-budget", messageKey: "tour.budgetsMessage" },
    { id: "#nav-item-reports", messageKey: "tour.reportsMessage" },
    { id: "#nav-item-utilities", messageKey: "tour.utilitiesMessage" },
  ];

  // Define Header Items (Matches HeaderBar)
  const headerItems = [
    { id: "#header-search", messageKey: "tour.headerSearchMessage" },
    { id: "#header-masking", messageKey: "tour.headerMaskingMessage" },
    { id: "#header-theme", messageKey: "tour.headerThemeMessage" },
    {
      id: "#header-notifications",
      messageKey: "tour.headerNotificationsMessage",
    },
    { id: "#header-profile", messageKey: "tour.headerProfileMessage" },
  ];

  const steps = [
    {
      target: "#sidebar-profile-section",
      content: t(
        "tour.profileMessage",
        "This is your profile area. View stories, friend updates, and your status here.",
      ),
      placement: "right",
    },
    ...navItems.map((item) => ({
      target: item.id,
      content: t(item.messageKey),
      placement: "right",
    })),
    ...headerItems.map((item) => ({
      target: item.id,
      content: t(item.messageKey),
      placement: "bottom",
    })),
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      scrollToFirstStep
      disableOverlayClose={true} // Force user to use buttons
      spotlightPadding={5}
      locale={{
        back: t("common.back", "Back"),
        close: t("common.close", "Close"),
        last: t("common.finish", "Finish"),
        next: t("common.next", "Next"),
        skip: t("common.skip", "Skip"),
      }}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          arrowColor: colors.card_bg,
          backgroundColor: colors.card_bg,
          overlayColor: "rgba(0, 0, 0, 0.6)",
          primaryColor: colors.primary_accent,
          textColor: colors.primary_text,
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: "8px",
          fontFamily: "inherit",
        },
        tooltipContainer: {
          textAlign: "left",
        },
        buttonNext: {
          backgroundColor: colors.primary_accent,
          color: "#fff",
          outline: "none",
          borderRadius: "4px",
        },
        buttonBack: {
          color: colors.primary_text,
          marginRight: 10,
        },
        buttonSkip: {
          color: colors.secondary_text,
        },
      }}
    />
  );
};

export default TourGuide;
