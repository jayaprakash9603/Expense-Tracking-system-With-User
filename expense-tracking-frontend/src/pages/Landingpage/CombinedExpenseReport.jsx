import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGroupedCashflow from "../../hooks/useGroupedCashflow";
import useCategoryDistributionData from "../../hooks/useCategoryDistributionData";
import usePaymentMethodsData from "../../hooks/usePaymentMethodsData";
import useExpenseReportLayout from "../../hooks/useExpenseReportLayout";
import ReportHeader from "../../components/ReportHeader";
import GroupedExpensesAccordion from "../../components/GroupedExpensesAccordion";
import SharedOverviewCards from "../../components/charts/SharedOverviewCards";
import CategoryBreakdownChart from "../Dashboard/CategoryBreakdownChart";
import PaymentMethodChart from "../Dashboard/PaymentMethodChart";
import DailySpendingChart from "../Dashboard/DailySpendingChart";
import DailySpendingDrilldownDrawer from "../../components/charts/DailySpendingDrilldownDrawer";
import ExpenseReportCustomizationModal from "../../components/ExpenseReportCustomizationModal";
import {
  normalizeFlowTypeForChart,
  buildDailySpendingByBucket,
} from "../../utils/dailySpendingAggregation";
import {
  ReportHeaderSkeleton,
  OverviewCardSkeleton,
  PieChartSkeleton,
  AccordionSkeleton,
  ChartSkeleton,
} from "../../components/skeletons/CommonSkeletons";
import { DailySpendingSkeleton } from "../Dashboard";
import { getChartColors } from "../../utils/chartColors";
import { useTheme } from "../../hooks/useTheme";
import ReportFilterDrawer from "../../components/reportFilters/ReportFilterDrawer";
import useExpenseReportFilters from "../../hooks/reportFilters/useExpenseReportFilters";
import AllSectionsHiddenCard from "../../components/common/AllSectionsHiddenCard";
import ReportActionsMenu, {
  createDefaultReportMenuItems,
} from "../../components/common/ReportActionsMenu";
import "../Landingpage/Payment Report/PaymentReport.css"; // Reuse existing payment report styles

// Combined Expenses Report: Overview, payment method distribution, usage, category distribution, expenses accordion.
const COLORS = getChartColors(12);

export default function CombinedExpenseReport() {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const { colors, mode } = useTheme();

  // Layout configuration for section customization
  const layoutConfig = useExpenseReportLayout();

  // Check if all sections are hidden early
  const allSectionsHidden = layoutConfig.visibleSections.length === 0;

  // State for customization modal
  const [customizationOpen, setCustomizationOpen] = useState(false);

  // Independent state for each chart
  const [categoryTimeframe, setCategoryTimeframe] = useState("this_month");
  const [categoryFlowType, setCategoryFlowType] = useState("loss");
  const [paymentMethodTimeframe, setPaymentMethodTimeframe] =
    useState("this_month");
  const [paymentMethodFlowType, setPaymentMethodFlowType] = useState("loss");

  // Skip API calls when all sections are hidden
  const {
    timeframe,
    setTimeframe,
    flowType,
    setFlowType,
    loading,
    error,
    rawData,
    summary,
    methodsData,
    refetch,
    dateRange,
    setCustomDateRange,
    resetDateRange,
    isCustomRange,
  } = useGroupedCashflow({ friendId, skip: allSectionsHidden });

  const {
    filterDefaults: baseExpenseFilterDefaults,
    filterValues,
    sections: expenseFilterSections,
    isFilterOpen,
    openFilters,
    closeFilters,
    handleApplyFilters,
    handleResetFilters,
    filtersActive,
    filteredMethodsData,
    filteredExpenseSummary,
  } = useExpenseReportFilters({
    timeframe,
    flowType,
    setTimeframe,
    setFlowType,
    dateRange,
    setCustomDateRange,
    resetDateRange,
    isCustomRange,
    methodsData,
    summary,
  });

  // Fetch category data with independent state (skip if all sections hidden or category not visible)
  const categoryVisible = layoutConfig.visibleSections.some(
    (s) => s.id === "category-breakdown"
  );
  const { distribution: categoryDistribution, loading: categoryLoading } =
    useCategoryDistributionData({
      timeframe: categoryTimeframe,
      flowType: categoryFlowType,
      refreshTrigger: rawData,
      skip: allSectionsHidden || !categoryVisible,
    });

  // Fetch payment methods data using independent state (skip if all sections hidden or payment not visible)
  const paymentVisible = layoutConfig.visibleSections.some(
    (s) => s.id === "payment-methods"
  );
  const {
    data: paymentMethodsData,
    rawData: paymentMethodsRawData,
    loading: paymentMethodsLoading,
  } = usePaymentMethodsData({
    timeframe: paymentMethodTimeframe,
    flowType: paymentMethodFlowType,
    refreshTrigger: rawData,
    skip: allSectionsHidden || !paymentVisible,
  });

  // Removed category and fallback category spending logic

  const handleBack = () => {
    if (friendId && friendId !== "undefined") {
      navigate(`/friends/expenses/${friendId}`);
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/expenses");
    }
  };

  const handleExport = () => {
    // Perform export using latest data (placeholder for real export logic/hook)
    console.log(
      "Export triggered for timeframe",
      timeframe,
      "flowType",
      flowType
    );
    // Could integrate download logic here or via new hook (future enhancement)
  };

  const chartTimeframe = useMemo(() => {
    switch (timeframe) {
      case "week":
        return "this_week";
      case "month":
        return "this_month";
      case "quarter":
        return "quarter";
      case "year":
        return "this_year";
      case "last_year":
        return "last_year";
      case "all_time":
        return "all_time";
      case "all":
        return "all_time";
      default:
        return "this_month";
    }
  }, [timeframe]);

  const chartSelectedType = useMemo(() => {
    return normalizeFlowTypeForChart(flowType);
  }, [flowType]);

  const dailySpendingData = useMemo(() => {
    return buildDailySpendingByBucket(
      (Array.isArray(filteredMethodsData) ? filteredMethodsData : []).map(
        (m) => ({
          name: m?.method,
          expenses: m?.expenses,
        })
      )
    );
  }, [filteredMethodsData]);

  const [dailyDrawerOpen, setDailyDrawerOpen] = useState(false);
  const [dailySelectedPoint, setDailySelectedPoint] = useState(null);

  const handleDailyPointClick = useCallback((point) => {
    setDailySelectedPoint(point);
    setDailyDrawerOpen(true);
  }, []);

  const handleCloseDailyDrawer = useCallback(() => {
    setDailyDrawerOpen(false);
  }, []);

  // Helper to check if a section is visible
  const isSectionVisible = (sectionId) => {
    const section = layoutConfig.visibleSections.find(
      (s) => s.id === sectionId
    );
    return Boolean(section);
  };

  // Three-dot menu component using reusable ReportActionsMenu
  const reportHeaderActions = (
    <ReportActionsMenu
      menuItems={createDefaultReportMenuItems({
        onExport: handleExport,
        onCustomize: () => setCustomizationOpen(true),
        customizeLabel: "Customize Report",
      })}
    />
  );

  // If all sections are hidden, show AllSectionsHiddenCard immediately (no loading/skeleton)
  if (allSectionsHidden) {
    return (
      <div
        className="payment-methods-report"
        style={{
          background: colors.secondary_bg,
          minHeight: "100vh-100px",
          padding: "0",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            background: colors.secondary_bg,
            paddingLeft: "24px",
            paddingRight: "24px",
          }}
        >
          <ReportHeader
            className="payment-methods-header"
            title="🧾 Expenses Report"
            subtitle="Expenses grouped together"
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            onBack={handleBack}
            flowType={flowType}
            onFlowTypeChange={setFlowType}
            rightActions={reportHeaderActions}
            showExportButton={false}
            showFilterButton={false}
          />
        </div>
        <div style={{ padding: "24px" }}>
          <AllSectionsHiddenCard
            title="All Report Sections Hidden"
            message="You've hidden all sections from this expense report. Click the button below or use the menu to customize and restore sections."
            onCustomize={() => setCustomizationOpen(true)}
            customizeButtonLabel="Customize Report"
            height={280}
          />
        </div>
        {/* Customization Modal */}
        <ExpenseReportCustomizationModal
          open={customizationOpen}
          onClose={() => setCustomizationOpen(false)}
          sections={layoutConfig.sections}
          onToggleSection={layoutConfig.toggleSection}
          onReorderSections={layoutConfig.reorderSections}
          onResetLayout={layoutConfig.resetLayout}
          onSaveLayout={layoutConfig.saveLayout}
        />
      </div>
    );
  }

  // Render aligned skeleton based on visible sections order
  if (loading) {
    return (
      <div
        className="payment-methods-report"
        style={{
          background: colors.secondary_bg,
          minHeight: "100vh-100px",
          padding: "0",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            background: colors.secondary_bg,
            paddingLeft: "24px",
            paddingRight: "24px",
          }}
        >
          <ReportHeaderSkeleton />
        </div>
        <div style={{ padding: "0 24px 24px 24px" }}>
          <div
            className="charts-grid"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {layoutConfig.visibleSections.map((section) => {
              switch (section.id) {
                case "overview-cards":
                  return (
                    <div
                      key={section.id}
                      className="payment-overview-cards"
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(240px, 1fr))",
                        gap: "16px",
                      }}
                    >
                      {[1, 2, 3, 4].map((i) => (
                        <OverviewCardSkeleton key={i} />
                      ))}
                    </div>
                  );
                case "daily-spending":
                  return (
                    <div key={section.id} className="chart-row full-width">
                      <DailySpendingSkeleton height={260} />
                    </div>
                  );
                case "category-breakdown": {
                  const catIdx = layoutConfig.visibleSections.findIndex(
                    (s) => s.id === "category-breakdown"
                  );
                  const pmIdx = layoutConfig.visibleSections.findIndex(
                    (s) => s.id === "payment-methods"
                  );
                  const pmVisible = pmIdx !== -1;
                  const adjacent = pmVisible && Math.abs(catIdx - pmIdx) === 1;
                  // Skip if payment-methods comes before and they are adjacent (payment will render both)
                  if (adjacent && pmIdx < catIdx) return null;
                  // If payment-methods comes right after, render them side-by-side
                  if (adjacent && pmIdx > catIdx) {
                    return (
                      <div
                        key="skeleton-cat-pay"
                        className="chart-row"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "24px",
                        }}
                      >
                        <PieChartSkeleton height={360} chipCount={7} />
                        <PieChartSkeleton height={360} chipCount={7} />
                      </div>
                    );
                  }
                  // Render category alone (full width)
                  return (
                    <div key={section.id} className="chart-row full-width">
                      <PieChartSkeleton height={360} chipCount={7} />
                    </div>
                  );
                }
                case "payment-methods": {
                  const pmIdx2 = layoutConfig.visibleSections.findIndex(
                    (s) => s.id === "payment-methods"
                  );
                  const catIdx2 = layoutConfig.visibleSections.findIndex(
                    (s) => s.id === "category-breakdown"
                  );
                  const catVisible2 = catIdx2 !== -1;
                  const adjacent2 =
                    catVisible2 && Math.abs(catIdx2 - pmIdx2) === 1;
                  // Skip if category-breakdown comes before and they are adjacent (category will render both)
                  if (adjacent2 && catIdx2 < pmIdx2) return null;
                  // If category-breakdown comes right after, render them side-by-side
                  if (adjacent2 && pmIdx2 < catIdx2) {
                    return (
                      <div
                        key="skeleton-pay-cat"
                        className="chart-row"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "24px",
                        }}
                      >
                        <PieChartSkeleton height={360} chipCount={7} />
                        <PieChartSkeleton height={360} chipCount={7} />
                      </div>
                    );
                  }
                  // Render payment alone (full width)
                  return (
                    <div key={section.id} className="chart-row full-width">
                      <PieChartSkeleton height={360} chipCount={7} />
                    </div>
                  );
                }
                case "expenses-accordion":
                  return (
                    <div key={section.id} className="chart-row full-width">
                      <AccordionSkeleton items={8} />
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="payment-methods-report"
      style={{
        background: colors.secondary_bg,
        minHeight: "100vh-100px",
        padding: "0",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: colors.secondary_bg,
          paddingLeft: "24px",
          paddingRight: "24px",
        }}
      >
        <ReportHeader
          className="payment-methods-header"
          title="🧾 Expenses Report"
          subtitle="Expenses grouped together"
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          onFilter={openFilters}
          onBack={handleBack}
          flowType={flowType}
          onFlowTypeChange={setFlowType}
          dateRangeProps={{
            fromDate: dateRange?.fromDate,
            toDate: dateRange?.toDate,
            onApply: setCustomDateRange,
            onReset: resetDateRange,
          }}
          isCustomRangeActive={isCustomRange}
          showFilterButton={expenseFilterSections.length > 0}
          filterButtonLabel="Filter"
          isFilterActive={filtersActive}
          rightActions={reportHeaderActions}
          showExportButton={false}
        />
      </div>

      <div style={{ padding: "0 24px 24px 24px" }}>
        {error && (
          <div
            style={{
              color: "#ff6b6b",
              marginBottom: 16,
              padding: "12px 16px",
              background:
                mode === "dark"
                  ? "rgba(255, 107, 107, 0.1)"
                  : "rgba(255, 107, 107, 0.15)",
              borderRadius: "8px",
              border: `1px solid ${
                mode === "dark"
                  ? "rgba(255, 107, 107, 0.3)"
                  : "rgba(255, 107, 107, 0.4)"
              }`,
            }}
          >
            <div>Expenses Error: {error}</div>
          </div>
        )}

        {/* Render sections in the order defined by layout config */}
        <div
          className="charts-grid"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {layoutConfig.visibleSections.map((section) => {
            // Render each section based on its id
            switch (section.id) {
              case "overview-cards":
                return (
                  <SharedOverviewCards
                    key={section.id}
                    data={filteredMethodsData}
                    mode="expenses"
                  />
                );

              case "daily-spending":
                return (
                  <div
                    key={section.id}
                    className="chart-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: "24px",
                    }}
                  >
                    <DailySpendingChart
                      data={dailySpendingData}
                      timeframe={chartTimeframe}
                      selectedType={chartSelectedType}
                      hideControls
                      showBothTypesWhenAll
                      height={260}
                      loading={loading}
                      title="📊 Daily Spending Pattern"
                      onPointClick={handleDailyPointClick}
                    />

                    <DailySpendingDrilldownDrawer
                      open={dailyDrawerOpen}
                      onClose={handleCloseDailyDrawer}
                      point={dailySelectedPoint}
                      hideBudgetBreakdown
                      showTypeTabs
                      defaultTypeTab={flowType === "gain" ? "gain" : "loss"}
                    />
                  </div>
                );

              case "category-breakdown":
                // Check if payment-methods is also visible and adjacent
                const categoryIndex = layoutConfig.visibleSections.findIndex(
                  (s) => s.id === "category-breakdown"
                );
                const paymentIndex = layoutConfig.visibleSections.findIndex(
                  (s) => s.id === "payment-methods"
                );
                const isPaymentVisible = paymentIndex !== -1;
                const areAdjacent =
                  isPaymentVisible &&
                  Math.abs(categoryIndex - paymentIndex) === 1;

                // Skip if already rendered with payment-methods (payment came first)
                if (areAdjacent && paymentIndex < categoryIndex) {
                  return null;
                }

                // If payment-methods comes right after, render them together
                if (areAdjacent && paymentIndex > categoryIndex) {
                  return (
                    <div
                      key="category-payment-row"
                      className="chart-row"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "24px",
                      }}
                    >
                      <CategoryBreakdownChart
                        data={categoryDistribution}
                        timeframe={categoryTimeframe}
                        onTimeframeChange={setCategoryTimeframe}
                        flowType={categoryFlowType}
                        onFlowTypeChange={setCategoryFlowType}
                        loading={categoryLoading}
                        skeleton={
                          loading ? (
                            <ChartSkeleton
                              height={480}
                              variant="pie"
                              noHeader
                            />
                          ) : null
                        }
                      />
                      <PaymentMethodChart
                        data={paymentMethodsData}
                        rawData={paymentMethodsRawData}
                        timeframe={paymentMethodTimeframe}
                        onTimeframeChange={setPaymentMethodTimeframe}
                        flowType={paymentMethodFlowType}
                        onFlowTypeChange={setPaymentMethodFlowType}
                        loading={paymentMethodsLoading}
                        skeleton={
                          loading ? (
                            <ChartSkeleton
                              height={480}
                              variant="pie"
                              noHeader
                            />
                          ) : null
                        }
                      />
                    </div>
                  );
                }

                // Render category-breakdown alone
                return (
                  <div
                    key={section.id}
                    className="chart-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: "24px",
                    }}
                  >
                    <CategoryBreakdownChart
                      data={categoryDistribution}
                      timeframe={categoryTimeframe}
                      onTimeframeChange={setCategoryTimeframe}
                      flowType={categoryFlowType}
                      onFlowTypeChange={setCategoryFlowType}
                      loading={categoryLoading}
                      skeleton={
                        loading ? (
                          <ChartSkeleton height={480} variant="pie" noHeader />
                        ) : null
                      }
                    />
                  </div>
                );

              case "payment-methods":
                // Check if already rendered with category-breakdown
                const pmIndex = layoutConfig.visibleSections.findIndex(
                  (s) => s.id === "payment-methods"
                );
                const catIndex = layoutConfig.visibleSections.findIndex(
                  (s) => s.id === "category-breakdown"
                );
                const isCatVisible = catIndex !== -1;
                const alreadyRenderedWithCategory =
                  isCatVisible &&
                  Math.abs(catIndex - pmIndex) === 1 &&
                  catIndex < pmIndex;

                // Skip if already rendered with category-breakdown
                if (alreadyRenderedWithCategory) {
                  return null;
                }

                // Check if category comes right after payment
                const shouldRenderTogether =
                  isCatVisible &&
                  Math.abs(catIndex - pmIndex) === 1 &&
                  pmIndex < catIndex;

                if (shouldRenderTogether) {
                  return (
                    <div
                      key="payment-category-row"
                      className="chart-row"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "24px",
                      }}
                    >
                      <PaymentMethodChart
                        data={paymentMethodsData}
                        rawData={paymentMethodsRawData}
                        timeframe={paymentMethodTimeframe}
                        onTimeframeChange={setPaymentMethodTimeframe}
                        flowType={paymentMethodFlowType}
                        onFlowTypeChange={setPaymentMethodFlowType}
                        loading={paymentMethodsLoading}
                        skeleton={
                          loading ? (
                            <ChartSkeleton
                              height={480}
                              variant="pie"
                              noHeader
                            />
                          ) : null
                        }
                      />
                      <CategoryBreakdownChart
                        data={categoryDistribution}
                        timeframe={categoryTimeframe}
                        onTimeframeChange={setCategoryTimeframe}
                        flowType={categoryFlowType}
                        onFlowTypeChange={setCategoryFlowType}
                        loading={categoryLoading}
                        skeleton={
                          loading ? (
                            <ChartSkeleton
                              height={480}
                              variant="pie"
                              noHeader
                            />
                          ) : null
                        }
                      />
                    </div>
                  );
                }

                // Render payment-methods alone
                return (
                  <div
                    key={section.id}
                    className="chart-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: "24px",
                    }}
                  >
                    <PaymentMethodChart
                      data={paymentMethodsData}
                      rawData={paymentMethodsRawData}
                      timeframe={paymentMethodTimeframe}
                      onTimeframeChange={setPaymentMethodTimeframe}
                      flowType={paymentMethodFlowType}
                      onFlowTypeChange={setPaymentMethodFlowType}
                      loading={paymentMethodsLoading}
                      skeleton={
                        loading ? (
                          <ChartSkeleton height={480} variant="pie" noHeader />
                        ) : null
                      }
                    />
                  </div>
                );

              case "expenses-accordion":
                return (
                  <div
                    key={section.id}
                    className="chart-row full-width"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: "24px",
                    }}
                  >
                    <GroupedExpensesAccordion
                      methods={filteredMethodsData}
                      summary={filteredExpenseSummary}
                    />
                  </div>
                );

              default:
                return null;
            }
          })}
        </div>
      </div>

      {/* Customization Modal */}
      <ExpenseReportCustomizationModal
        open={customizationOpen}
        onClose={() => setCustomizationOpen(false)}
        sections={layoutConfig.sections}
        onToggleSection={layoutConfig.toggleSection}
        onReorderSections={layoutConfig.reorderSections}
        onResetLayout={layoutConfig.resetLayout}
        onSaveLayout={layoutConfig.saveLayout}
      />

      <ReportFilterDrawer
        open={isFilterOpen}
        onClose={closeFilters}
        sections={expenseFilterSections}
        values={filterValues}
        initialValues={baseExpenseFilterDefaults}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </div>
  );
}
