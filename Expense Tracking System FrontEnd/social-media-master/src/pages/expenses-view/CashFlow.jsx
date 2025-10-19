import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import CashFlowChart from "../../components/CashFlowChart";
import useFriendAccess from "../../hooks/useFriendAccess";
import { Skeleton, useTheme, useMediaQuery } from "@mui/material";
import recentPng from "../../assests/recent.png";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import DeletionConfirmationWithToast from "../../components/common/DeletionConfirmationWithToast";
import { getListOfBudgetsByExpenseId } from "../../Redux/Budget/budget.action";
import { rangeTypes, weekDays, yearMonths } from "../../utils/flowDateUtils";
import RangePeriodNavigator from "../../components/common/RangePeriodNavigator";
import NoDataPlaceholder from "../../components/NoDataPlaceholder";
import CashFlowExpenseCards from "../../components/cashflow/CashFlowExpenseCards";
import FlowToggleButton from "../../components/cashflow/FlowToggleButton";
import DeleteSelectedButton from "../../components/cashflow/DeleteSelectedButton";
import SelectionSummaryBar from "../../components/cashflow/SelectionSummaryBar";
import SearchNavigationBar from "../../components/cashflow/SearchNavigationBar";
import {
  fetchFriendship,
  fetchFriendsDetailed,
} from "../../Redux/Friends/friendsActions";
import { getExpenseAction } from "../../Redux/Expenses/expense.action";
import { getBillByExpenseId } from "../../Redux/Bill/bill.action";
import SortPopover from "../../components/cashflow/SortPopover";
import useCashflowData from "../../hooks/useCashflowData";
import useSelectionManager from "../../hooks/useSelectionManager";
import useExpenseSorting from "../../hooks/useExpenseSorting";
import useExpenseDeletion from "../../hooks/useExpenseDeletion";
import {
  formatCompactNumber,
  formatCurrencyCompact,
  formatNumberFull,
} from "../../utils/numberFormatters";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const { hasWriteAccess } = useFriendAccess(friendId);
  const [addNewPopoverOpen, setAddNewPopoverOpen] = useState(false);
  const [addNewBtnRef, setAddNewBtnRef] = useState(null);
  const [shrinkFlowBtn, setShrinkFlowBtn] = useState(false);

  useEffect(() => {
    if (isFriendView) {
      if (friendId) dispatch(fetchFriendship(friendId));
      dispatch(fetchFriendsDetailed());
    }
  }, [dispatch, friendId, isFriendView]);

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

  const handleBack = () => setOffset((prev) => prev - 1);
  const handleNext = () => setOffset((prev) => prev + 1);
  const handleSort = (type) => {
    setSortType(type);
    setPopoverOpen(false);
  };

  const headerNames = {
    name: "Expense Name",
    amount: "Amount",
    type: "Type",
    paymentMethod: "Payment Method",
    netAmount: "Net Amount",
    comments: "Comments",
    creditDue: "Credit Due",
    date: "Date",
  };
  const handleDeleteClick = (row) => openSingleDelete(row);

  return (
    <>
      <div
        className="bg-[#0b0b0b] p-4 rounded-lg mt-[0px]"
        style={{
          width: isMobile
            ? "100vw"
            : isTablet
            ? "100vw"
            : "calc(100vw - 370px)",
          height: isMobile ? "auto" : isTablet ? "auto" : "calc(100vh - 100px)",
          marginRight: isMobile ? 0 : isTablet ? 0 : "20px",
          borderRadius: isMobile ? 0 : "8px",
          boxSizing: "border-box",
          position: "relative",
          padding: isMobile ? 8 : isTablet ? 12 : 16,
          minWidth: 0,
        }}
      >
        <DeletionConfirmationWithToast
          toastOpen={toastOpen}
          toastMessage={toastMessage}
          onToastClose={handleToastClose}
          isDeleteModalOpen={isDeleteModalOpen}
          isDeleting={isDeleting}
          expenseData={expenseData}
          headerNames={headerNames}
          onApprove={confirmDelete}
          onDecline={cancelDelete}
          approveText="Yes, Delete"
          declineText="No, Cancel"
          confirmationText={confirmationText}
        />
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            gap: 10,
            alignItems: "center",
            zIndex: 5,
          }}
        >
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
          <FlowToggleButton
            flowTab={flowTab}
            setFlowTab={setFlowTab}
            totals={totals}
            isMobile={isMobile}
            shrinkFlowBtn={shrinkFlowBtn}
            setShrinkFlowBtn={setShrinkFlowBtn}
            onResetSelections={() => {
              clearSelection();
              setSelectedCardIdx([]);
            }}
          />
        </div>
        <SelectionSummaryBar
          selectionStats={selectionStats}
          selectedBarsLength={selectedBars.length}
          isMobile={isMobile}
          summaryExpanded={summaryExpanded}
          setSummaryExpanded={setSummaryExpanded}
          clearSelection={clearSelection}
        />
        <RangePeriodNavigator
          isFriendView={isFriendView}
          friendId={friendId}
          navigate={navigate}
          rangeTypes={rangeTypes}
          activeRange={activeRange}
          setActiveRange={setActiveRange}
          offset={offset}
          handleBack={handleBack}
          handleNext={handleNext}
          rangeLabel={rangeLabel}
          onResetSelection={() => {
            setSelectedBar(null);
            setSelectedBars([]);
          }}
          disablePrevAt={-52}
          disableNextAt={0}
          isMobile={isMobile}
        />
        <div
          className="w-full h-[220px] rounded-lg p-4 mb-4"
          style={{
            background: "#1b1b1b",
            paddingRight: isMobile ? 8 : isTablet ? 24 : 60,
            height: isMobile ? 120 : isTablet ? 160 : 220,
            minWidth: 0,
          }}
        >
          {loading && !search ? (
            <Skeleton
              variant="rectangular"
              width="100%"
              height={160}
              animation="wave"
              sx={{ bgcolor: "#23243a", borderRadius: 2 }}
            />
          ) : chartData.length === 0 ? (
            <NoDataPlaceholder
              size={isMobile ? "md" : "lg"}
              fullWidth
              message="No data to display"
              subMessage="Try adjusting filters or date range"
            />
          ) : (
            <CashFlowChart
              chartData={chartData}
              xKey={xKey}
              barChartStyles={barChartStyles}
              isMobile={isMobile}
              isTablet={isTablet}
              selectedBars={selectedBars}
              hoverBarIndex={hoverBarIndex}
              setHoverBarIndex={setHoverBarIndex}
              handleBarClick={handleBarClick}
              flowTab={flowTab}
              activeRange={activeRange}
              offset={offset}
              formatCompactNumber={formatCompactNumber}
              formatCurrencyCompact={formatCurrencyCompact}
              formatNumberFull={formatNumberFull}
              yearMonths={yearMonths}
              weekDays={weekDays}
            />
          )}
        </div>
        <SearchNavigationBar
          search={search}
          setSearch={setSearch}
          onFilterToggle={() => setPopoverOpen((v) => !v)}
          filterRef={filterBtnRef}
          isMobile={isMobile}
          isTablet={isTablet}
          navItems={[
            {
              path: "/category-flow",
              icon: "category.png",
              label: "Categories",
            },
            { path: "/budget", icon: "budget.png", label: "Budget" },
            {
              path: "/payment-method",
              icon: "payment-method.png",
              label: "Payment Method",
            },
            { path: "/bill", icon: "bill.png", label: "Bill" },
            { path: "/calendar-view", icon: "calendar.png", label: "Calendar" },
          ]}
          friendId={friendId}
          isFriendView={isFriendView}
          hasWriteAccess={hasWriteAccess}
          navigate={navigate}
          addNewOptions={[
            {
              label: "Add Expense",
              route: isFriendView
                ? `/expenses/create/${friendId}`
                : "/expenses/create",
              color: "#00DAC6",
            },
            {
              label: "Upload File",
              route: isFriendView
                ? `/upload/expenses/${friendId}`
                : "/upload/expenses",
              color: "#5b7fff",
            },
            {
              label: "Add Budget",
              route: isFriendView
                ? `/budget/create/${friendId}`
                : "/budget/create",
              color: "#FFC107",
            },
            {
              label: "Add Category",
              route: isFriendView
                ? `/category-flow/create/${friendId}`
                : "/category-flow/create",
              color: "#ff6b6b",
            },
          ]}
          placeholder="Search expenses..."
        />
        <SortPopover
          open={popoverOpen}
          anchorRect={filterBtnRef.current?.getBoundingClientRect() || null}
          sortType={sortType}
          onSelect={(type) => handleSort(type)}
          recentIcon={recentPng}
        />
        <CashFlowExpenseCards
          data={sortedCardData}
          loading={loading}
          search={search}
          selectedCardIdx={selectedCardIdx}
          flowTab={flowTab}
          isMobile={isMobile}
          isTablet={isTablet}
          handleCardClick={handleCardClick}
          hasWriteAccess={hasWriteAccess}
          formatNumberFull={formatNumberFull}
          dispatch={dispatch}
          navigate={navigate}
          friendId={friendId}
          isFriendView={isFriendView}
          handleDeleteClick={handleDeleteClick}
          getListOfBudgetsByExpenseId={getListOfBudgetsByExpenseId}
          getExpenseAction={getExpenseAction}
          getBillByExpenseId={getBillByExpenseId}
        />
        <style>{`
  .custom-scrollbar::-webkit-scrollbar { width: 8px; background: #23243a; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: ${
    flowTab === "outflow"
      ? "#ff4d4f"
      : flowTab === "inflow"
      ? "#06d6a0"
      : "#5b7fff"
  }; border-radius: 6px; }
  .card-comments-clamp { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; white-space: normal; min-height: 0; max-height: 60px; }
  .summary-pills-scroll::-webkit-scrollbar { height: 6px; }
  .summary-pills-scroll::-webkit-scrollbar-track { background: #1b1b1b; }
  .summary-pills-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
  .summary-pills-scroll { -ms-overflow-style: none; scrollbar-width: thin; }
`}</style>
      </div>
    </>
  );
};

export default Cashflow;
