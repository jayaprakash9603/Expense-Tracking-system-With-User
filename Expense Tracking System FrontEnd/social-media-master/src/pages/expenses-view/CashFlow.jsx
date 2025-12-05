import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import useFriendAccess from "../../hooks/useFriendAccess";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import useCashflowData from "../../hooks/useCashflowData";
import useSelectionManager from "../../hooks/useSelectionManager";
import useExpenseSorting from "../../hooks/useExpenseSorting";
import useExpenseDeletion from "../../hooks/useExpenseDeletion";
import {
  formatCompactNumber,
  formatCurrencyCompact,
  formatNumberFull,
} from "../../utils/numberFormatters";
import { useTheme, useMediaQuery } from "@mui/material";
import CashFlowChart from "../../components/CashFlowChart";
import CashFlowExpenseCards from "../../components/cashflow/CashFlowExpenseCards";
import SelectionSummaryBar from "../../components/cashflow/SelectionSummaryBar";
import DeleteSelectedButton from "../../components/cashflow/DeleteSelectedButton";
import GenericFlowLayout from "../../components/common/GenericFlowLayout";
import { getListOfBudgetsByExpenseId } from "../../Redux/Budget/budget.action";
import { getExpenseAction } from "../../Redux/Expenses/expense.action";
import { getBillByExpenseId } from "../../Redux/Bill/bill.action";
import {
  fetchFriendship,
  fetchFriendsDetailed,
} from "../../Redux/Friends/friendsActions";
import { useTranslation } from "../../hooks/useTranslation";

// Relocated Cashflow component (was in pages/Landingpage). Functionality unchanged.
const Cashflow = () => {
  const [search, setSearch] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(true);
  const dispatch = useDispatch();
  const { friendId } = useParams();
  const isFriendView = Boolean(friendId && friendId !== "undefined");
  const {
    activeRange,
    setActiveRange,
    offset,
    setOffset,
    flowTab,
    setFlowTab,
    cashflowExpenses,
    loading,
    chartData,
    cardData,
    xKey,
    barChartStyles,
    totals,
    rangeLabel,
  } = useCashflowData({ friendId, isFriendView, search });
  const {
    selectedBar,
    selectedBars,
    selectedCardIdx,
    hoverBarIndex,
    setHoverBarIndex,
    handleBarClick,
    handleCardClick,
    selectionStats,
    clearSelection,
    setSelectedCardIdx,
    setSelectedBar,
    setSelectedBars,
  } = useSelectionManager({ chartData, activeRange });
  const { sortType, setSortType, sortedCardData } = useExpenseSorting(cardData);
  const {
    isDeleteModalOpen,
    expenseData,
    expenseToDelete,
    isDeleting,
    confirmationText,
    toastOpen,
    toastMessage,
    openMultiDelete,
    openSingleDelete,
    cancelDelete,
    confirmDelete,
    handleToastClose,
    showToast,
  } = useExpenseDeletion({
    activeRange,
    offset,
    flowTab,
    isFriendView,
    friendId,
    setSelectedCardIdx,
    setSelectedBar,
    setSelectedBars,
  });
  const { friendship, friends } = useSelector((state) => state.friends || {});
  const filterBtnRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  // Back button logic aligned with CategoryFlow: show only if friend view OR came from another flow.
  const originFlow = location?.state?.fromFlow;
  const navigatedThroughTabs = location?.state?.navigatedThroughTabs === true;
  const showBackButton =
    !navigatedThroughTabs && (isFriendView || Boolean(originFlow));
  const handlePageBack = () => {
    if (originFlow) {
      navigate(`/${originFlow}`);
      return;
    }
    // In friend view with no origin flow, go to friends list root
    if (isFriendView) {
      navigate("/friends");
      return;
    }
    navigate("/expenses");
  };
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const { hasWriteAccess } = useFriendAccess(friendId);
  const [addNewPopoverOpen, setAddNewPopoverOpen] = useState(false);
  const [addNewBtnRef, setAddNewBtnRef] = useState(null);
  const [shrinkFlowBtn, setShrinkFlowBtn] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (isFriendView) {
      if (friendId) dispatch(fetchFriendship(friendId));
      dispatch(fetchFriendsDetailed());
    }
  }, [dispatch, friendId, isFriendView]);

  // (Removed month-forcing effect; hook now defaults to 'month' directly.)

  useEffect(() => {
    if (location.state && location.state.selectedCategory) {
      console.log(
        "Category selected from navigation:",
        location.state.selectedCategory
      );
      console.log("Current search term:", search);
    }
  }, [location.state, search]);

  useEffect(() => {
    clearSelection();
  }, [activeRange, offset, flowTab]);

  useEffect(() => {
    if (!popoverOpen) return;
    function handleClick(e) {
      if (
        filterBtnRef.current &&
        !filterBtnRef.current.contains(e.target) &&
        !document.getElementById("sort-popover")?.contains(e.target)
      ) {
        setPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [popoverOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        addNewPopoverOpen &&
        addNewBtnRef &&
        !addNewBtnRef.contains(event.target)
      ) {
        const popover = document.querySelector('[data-popover="add-new"]');
        if (!popover || !popover.contains(event.target)) {
          setAddNewPopoverOpen(false);
        }
      }
    };
    if (addNewPopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [addNewPopoverOpen, addNewBtnRef]);

  useEffect(() => {
    if (location.state && location.state.toastMessage) {
      showToast(location.state.toastMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, showToast]);

  const translatedRangeLabel = useMemo(() => {
    if (!rangeLabel) return rangeLabel;
    if (offset === 0) {
      if (activeRange === "week" && rangeLabel === "This Week") {
        return t("cashflow.rangeLabels.thisWeek");
      }
      if (activeRange === "year" && rangeLabel === "This Year") {
        return t("cashflow.rangeLabels.thisYear");
      }
      if (activeRange === "month" && rangeLabel.startsWith("This Month")) {
        return rangeLabel.replace(
          "This Month",
          t("cashflow.rangeLabels.thisMonth")
        );
      }
    }
    return rangeLabel;
  }, [rangeLabel, activeRange, offset, t]);

  const filteredCardsByBar = useMemo(() => {
    if (!selectedBars.length) return sortedCardData;

    const barExpenseIds = new Set(
      selectedBars.flatMap((b) =>
        (b.data.expenses || []).map(
          (e) => e.id || e.expenseId || e.expense?.id || e.expense?.expenseId
        )
      )
    );

    return sortedCardData.filter((c) => {
      const cardId =
        c.id || c.expenseId || c.expense?.id || c.expense?.expenseId;
      return barExpenseIds.has(cardId);
    });
  }, [selectedBars, sortedCardData]);

  return (
    <GenericFlowLayout
      flowData={{
        activeRange,
        setActiveRange,
        offset,
        setOffset,
        flowTab,
        setFlowTab,
        loading,
        chartData,
        xKey,
        barChartStyles,
        totals,
        rangeLabel: translatedRangeLabel,
      }}
      cards={filteredCardsByBar}
      selection={{
        selectedCardIdx,
        selectedBars,
        hoverBarIndex,
        setHoverBarIndex,
        handleBarClick,
        handleCardClick,
        clearSelection,
        selectionStats,
      }}
      deletion={{
        isDeleteModalOpen,
        isDeleting,
        expenseData,
        confirmationText,
        toastOpen,
        toastMessage,
        onApprove: confirmDelete,
        onDecline: cancelDelete,
        onToastClose: handleToastClose,
      }}
      ui={{
        isMobile,
        isTablet,
        hasWriteAccess,
        shrinkFlowBtn,
        setShrinkFlowBtn,
        search,
        setSearch,
        sortType,
        setSortType,
        popoverOpen,
        setPopoverOpen,
        filterBtnRef,
        navigate,
        friendId,
        isFriendView,
        addNewOptions: [
          {
            label: t("expenses.addExpense"),
            route: isFriendView
              ? `/expenses/create/${friendId}`
              : "/expenses/create",
            color: "#00DAC6",
          },
          {
            label: t("cashflow.addNew.options.uploadFile"),
            route: isFriendView
              ? `/upload/expenses/${friendId}`
              : "/upload/expenses",
            color: "#5b7fff",
          },
          {
            label: t("budget.addBudget"),
            route: isFriendView
              ? `/budget/create/${friendId}`
              : "/budget/create",
            color: "#FFC107",
          },
          {
            label: t("categories.addCategory"),
            route: isFriendView
              ? `/category-flow/create/${friendId}`
              : "/category-flow/create",
            color: "#ff6b6b",
          },
        ],
        navItems: [
          {
            path: "/expenses/reports",
            icon: "report.png",
            label: t("cashflow.nav.reports"),
          },
          {
            path: "/category-flow",
            icon: "category.png",
            label: t("cashflow.nav.categories"),
          },
          {
            path: "/budget",
            icon: "budget.png",
            label: t("cashflow.nav.budget"),
          },
          {
            path: "/payment-method",
            icon: "payment-method.png",
            label: t("cashflow.nav.paymentMethod"),
          },
          {
            path: "/bill",
            icon: "bill.png",
            label: t("cashflow.nav.bill"),
          },
          {
            path: "/calendar-view",
            icon: "calendar.png",
            label: t("cashflow.nav.calendar"),
          },
        ],
        showBackButton,
        onPageBack: handlePageBack,
      }}
      components={{
        ChartComponent: CashFlowChart,
        CardsComponent: (props) => (
          <CashFlowExpenseCards
            {...props}
            dispatch={dispatch}
            navigate={navigate}
            friendId={friendId}
            isFriendView={isFriendView}
            handleDeleteClick={(row) => openSingleDelete(row)}
            getListOfBudgetsByExpenseId={getListOfBudgetsByExpenseId}
            getExpenseAction={getExpenseAction}
            getBillByExpenseId={getBillByExpenseId}
          />
        ),
        SummaryBar: (props) => (
          <SelectionSummaryBar
            selectionStats={props.selectionStats}
            selectedBarsLength={props.selectedBarsLength}
            isMobile={props.isMobile}
            summaryExpanded={summaryExpanded}
            setSummaryExpanded={setSummaryExpanded}
            clearSelection={props.clearSelection}
          />
        ),
        DeleteSelectedButton: (props) => (
          <DeleteSelectedButton
            count={selectedCardIdx.length}
            isMobile={isMobile}
            hasWriteAccess={hasWriteAccess}
            onDelete={() =>
              openMultiDelete(
                selectedCardIdx.map(
                  (idx) =>
                    sortedCardData[idx].id || sortedCardData[idx].expenseId
                ),
                selectedCardIdx.length
              )
            }
          />
        ),
      }}
      formatters={{
        formatCompactNumber,
        formatCurrencyCompact,
        formatNumberFull,
      }}
    />
  );
};

export default Cashflow;
