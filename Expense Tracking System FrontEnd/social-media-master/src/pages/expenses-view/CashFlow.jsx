import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import useFriendAccess from "../../hooks/useFriendAccess";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import useCashflowData from "../../hooks/useCashflowData";
import useSelectionManager from "../../hooks/useSelectionManager";
import useExpenseSorting from "../../hooks/useExpenseSorting";
import useExpenseDeletion from "../../hooks/useExpenseDeletion";
import { useDebouncedSearch } from "../../hooks/useDebounce";
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
import ShareSelectedButton from "../../components/cashflow/ShareSelectedButton";
import GenericFlowLayout from "../../components/common/GenericFlowLayout";
import { getListOfBudgetsByExpenseId } from "../../Redux/Budget/budget.action";
import { getExpenseAction } from "../../Redux/Expenses/expense.action";
import { getBillByExpenseId } from "../../Redux/Bill/bill.action";
import {
  fetchFriendship,
  fetchFriendsDetailed,
} from "../../Redux/Friends/friendsActions";
import { useTranslation } from "../../hooks/useTranslation";

// Memoized CashFlowChart to prevent re-renders when only cards change
const MemoizedCashFlowChart = React.memo(CashFlowChart);

// Memoized CashFlowExpenseCards to prevent re-renders when only chart hover changes
const MemoizedCashFlowExpenseCards = React.memo(
  CashFlowExpenseCards,
  (prevProps, nextProps) => {
    // Custom comparison - only re-render when these props actually change
    return (
      prevProps.data === nextProps.data &&
      prevProps.loading === nextProps.loading &&
      prevProps.search === nextProps.search &&
      prevProps.selectedCardIdx === nextProps.selectedCardIdx &&
      prevProps.flowTab === nextProps.flowTab &&
      prevProps.activeRange === nextProps.activeRange &&
      prevProps.isMobile === nextProps.isMobile &&
      prevProps.isTablet === nextProps.isTablet &&
      prevProps.hasWriteAccess === nextProps.hasWriteAccess &&
      prevProps.friendId === nextProps.friendId &&
      prevProps.isFriendView === nextProps.isFriendView
    );
  },
);

// Relocated Cashflow component (was in pages/Landingpage). Functionality unchanged.
const Cashflow = () => {
  // Use debounced search - inputValue for immediate UI, debouncedValue for expensive operations
  const {
    inputValue: searchInput,
    debouncedValue: search,
    setInputValue: setSearch,
  } = useDebouncedSearch("", 300);
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
    expenseNames, // Pre-extracted unique names from API for autocomplete
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
        location.state.selectedCategory,
      );
      console.log("Current search term:", search);
    }
  }, [location.state, search]);

  useEffect(() => {
    clearSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          t("cashflow.rangeLabels.thisMonth"),
        );
      }
    }
    return rangeLabel;
  }, [rangeLabel, activeRange, offset, t]);

  const cardsWithSourceIndex = useMemo(
    () =>
      sortedCardData.map((card, idx) => ({
        ...card,
        __sourceIndex: idx,
      })),
    [sortedCardData],
  );

  const filteredCardsByBar = useMemo(() => {
    if (!selectedBars.length) return cardsWithSourceIndex;

    const barExpenseIds = new Set(
      selectedBars.flatMap((b) =>
        (b.data.expenses || []).map(
          (e) => e.id || e.expenseId || e.expense?.id || e.expense?.expenseId,
        ),
      ),
    );

    return cardsWithSourceIndex.filter((c) => {
      const cardId =
        c.id || c.expenseId || c.expense?.id || c.expense?.expenseId;
      return barExpenseIds.has(cardId);
    });
  }, [cardsWithSourceIndex, selectedBars]);

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
        search: searchInput, // Use immediate value for input display
        setSearch,
        sortType,
        setSortType,
        popoverOpen,
        setPopoverOpen,
        filterBtnRef,
        navigate,
        friendId,
        isFriendView,
        autocompleteOptions: expenseNames, // Pre-extracted unique names from API (performance optimized)
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
        ChartComponent: MemoizedCashFlowChart,
        CardsComponent: MemoizedCashFlowExpenseCards,
        SummaryBar: SelectionSummaryBar,
        DeleteSelectedButton: DeleteSelectedButton,
        ShareSelectedButton: ShareSelectedButton,
      }}
      // Extra props for CardsComponent (passed through GenericFlowLayout)
      cardsExtraProps={{
        dispatch,
        navigate,
        friendId,
        isFriendView,
        handleDeleteClick: openSingleDelete,
        getListOfBudgetsByExpenseId,
        getExpenseAction,
        getBillByExpenseId,
      }}
      // Extra props for SummaryBar
      summaryExtraProps={{
        summaryExpanded,
        setSummaryExpanded,
      }}
      // Extra props for DeleteSelectedButton
      deleteButtonExtraProps={{
        count: selectedCardIdx.length,
        hasWriteAccess,
        onDelete: () =>
          openMultiDelete(
            selectedCardIdx.map(
              (idx) =>
                sortedCardData[idx]?.id || sortedCardData[idx]?.expenseId,
            ),
            selectedCardIdx.length,
          ),
      }}
      // Extra props for ShareSelectedButton
      shareButtonExtraProps={{
        count: selectedCardIdx.length,
        selectedItems: selectedCardIdx.map((idx) => {
          const expense = sortedCardData[idx];
          return {
            internalId: expense?.id || expense?.expenseId,
            externalRef: expense?.externalRef || `EXP-${expense?.id || expense?.expenseId}`,
            displayName: expense?.name || expense?.description || `Expense #${expense?.id || expense?.expenseId}`,
          };
        }),
        resourceType: "EXPENSE",
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
