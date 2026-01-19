import React from "react";
import RangePeriodNavigator from "./RangePeriodNavigator";
import DeletionConfirmationWithToast from "./DeletionConfirmationWithToast";
import SearchNavigationBar from "../cashflow/SearchNavigationBar";
import SortPopover from "../cashflow/SortPopover";
import FlowToggleButton from "../cashflow/FlowToggleButton";
import CashFlowChartSkeleton from "../skeletons/CashFlowChartSkeleton";
import NoDataPlaceholder from "../NoDataPlaceholder";
import { rangeTypes } from "../../utils/flowDateUtils";
import recentPng from "../../assests/recent.png";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";

// Flexible layout wrapper used by CashFlow to integrate multi-selection and bulk deletion.
const GenericFlowLayout = ({
  flowData: {
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
    rangeLabel,
  },
  cards: sortedCardData,
  selection: {
    selectedCardIdx,
    selectedBars,
    hoverBarIndex,
    setHoverBarIndex,
    handleBarClick,
    handleCardClick,
    clearSelection,
    selectionStats,
  },
  deletion: {
    isDeleteModalOpen,
    isDeleting,
    expenseData,
    confirmationText,
    toastOpen,
    toastMessage,
    onApprove,
    onDecline,
    onToastClose,
  },
  ui: {
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
    addNewOptions,
    navItems,
    showBackButton,
    onPageBack,
  },
  components: {
    ChartComponent,
    CardsComponent,
    SummaryBar,
    DeleteSelectedButton,
  },
  // Extra props passed through to individual components
  cardsExtraProps = {},
  summaryExtraProps = {},
  deleteButtonExtraProps = {},
  formatters: { formatCompactNumber, formatCurrencyCompact, formatNumberFull },
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <div
      className="rounded-lg mt-[0px]"
      style={{
        backgroundColor: colors.secondary_bg,
        width: isMobile ? "100vw" : isTablet ? "100vw" : "calc(100vw - 370px)",
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
        onToastClose={onToastClose}
        isDeleteModalOpen={isDeleteModalOpen}
        isDeleting={isDeleting}
        expenseData={expenseData}
        headerNames={{
          name: t("cashflow.tableHeaders.name"),
          amount: t("cashflow.tableHeaders.amount"),
          type: t("cashflow.tableHeaders.type"),
          paymentMethod: t("cashflow.tableHeaders.paymentMethod"),
          netAmount: t("cashflow.tableHeaders.netAmount"),
          comments: t("cashflow.tableHeaders.comments"),
          creditDue: t("cashflow.tableHeaders.creditDue"),
          date: t("cashflow.tableHeaders.date"),
        }}
        onApprove={onApprove}
        onDecline={onDecline}
        approveText={t("cashflow.deletion.approve")}
        declineText={t("cashflow.deletion.decline")}
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
          count={deleteButtonExtraProps.count ?? selectedCardIdx.length}
          isMobile={isMobile}
          hasWriteAccess={
            deleteButtonExtraProps.hasWriteAccess ?? hasWriteAccess
          }
          onDelete={deleteButtonExtraProps.onDelete}
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
          }}
        />
      </div>
      <SummaryBar
        selectionStats={selectionStats}
        selectedBarsLength={selectedBars.length}
        isMobile={isMobile}
        clearSelection={clearSelection}
        {...summaryExtraProps}
      />
      <RangePeriodNavigator
        showBackButton={showBackButton}
        onBackNavigate={onPageBack}
        rangeTypes={rangeTypes}
        activeRange={activeRange}
        setActiveRange={setActiveRange}
        offset={offset}
        handleBack={() => setOffset((p) => p - 1)}
        handleNext={() => setOffset((p) => p + 1)}
        rangeLabel={rangeLabel}
        onResetSelection={() => {
          clearSelection();
        }}
        disablePrevAt={-52}
        disableNextAt={0}
        isMobile={isMobile}
      />
      <div
        className="w-full h-[220px] rounded-lg p-4 mb-4"
        style={{
          background: colors.primary_bg,
          paddingRight: isMobile ? 8 : isTablet ? 24 : 60,
          height: isMobile ? 120 : isTablet ? 160 : 220,
          minWidth: 0,
        }}
      >
        {loading && !search ? (
          <CashFlowChartSkeleton />
        ) : chartData.length === 0 ? (
          <NoDataPlaceholder
            size={isMobile ? "md" : "lg"}
            fullWidth
            message={t("cashflow.messages.noDataChart")}
            subMessage={t("cashflow.messages.adjustFilters")}
          />
        ) : (
          <ChartComponent
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
        navItems={navItems}
        friendId={friendId}
        isFriendView={isFriendView}
        hasWriteAccess={hasWriteAccess}
        navigate={navigate}
        addNewOptions={addNewOptions}
        placeholder={t("cashflow.searchPlaceholder")}
        // Use 'expenses' as origin so other flows back button returns to the main expenses view
        currentFlow="expenses"
      />
      <SortPopover
        open={popoverOpen}
        anchorRect={filterBtnRef.current?.getBoundingClientRect() || null}
        sortType={sortType}
        onSelect={(type) => {
          setSortType(type);
          setPopoverOpen(false);
        }}
        recentIcon={recentPng}
      />
      <CardsComponent
        data={sortedCardData}
        loading={loading}
        search={search}
        selectedCardIdx={selectedCardIdx}
        flowTab={flowTab}
        activeRange={activeRange}
        isMobile={isMobile}
        isTablet={isTablet}
        handleCardClick={handleCardClick}
        hasWriteAccess={hasWriteAccess}
        formatNumberFull={formatNumberFull}
        friendId={friendId}
        isFriendView={isFriendView}
        {...cardsExtraProps}
      />
      <style>{`
				.custom-scrollbar::-webkit-scrollbar { 
          width: 8px; 
          background: ${colors.hover_bg}; 
        }
				.custom-scrollbar::-webkit-scrollbar-thumb { 
          background: ${
            flowTab === "outflow"
              ? "#ff4d4f"
              : flowTab === "inflow"
                ? "#06d6a0"
                : "#5b7fff"
          }; 
          border-radius: 6px; 
        }
			`}</style>
    </div>
  );
};

export default GenericFlowLayout;
