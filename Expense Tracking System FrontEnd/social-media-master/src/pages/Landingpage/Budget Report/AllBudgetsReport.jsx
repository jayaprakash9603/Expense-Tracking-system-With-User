import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../../hooks/useTheme";
import useBudgetReportData from "../../../hooks/useBudgetReportData";
import useBudgetReportLayout from "../../../hooks/useBudgetReportLayout";
import useBudgetReportFilters from "../../../hooks/reportFilters/useBudgetReportFilters";
import ReportHeader from "../../../components/ReportHeader";
import BudgetAccordionGroup from "../../../components/BudgetAccordion";
import SharedOverviewCards from "../../../components/charts/SharedOverviewCards";
import SharedDistributionChart from "../../../components/charts/SharedDistributionChart";
import BudgetOverviewGrid from "../../../components/budget/BudgetOverviewGrid";
import {
  ReportHeaderSkeleton,
  OverviewCardSkeleton,
  ChartSkeleton,
  PieChartSkeleton,
  AccordionSkeleton,
  TopRecurringExpensesSkeleton,
  LossGainBreakdownSkeleton,
} from "../../../components/skeletons/CommonSkeletons";
import { DailySpendingSkeleton } from "../../Dashboard";
import { getChartColors } from "../../../utils/chartColors";
import TopRecurringExpensesCard from "../../../components/budget/TopRecurringExpensesCard";
import LossGainBreakdownCard from "../../../components/budget/LossGainBreakdownCard";
import DailySpendingChart from "../../Dashboard/DailySpendingChart";
import ReportFilterDrawer from "../../../components/reportFilters/ReportFilterDrawer";
import BudgetReportCustomizationModal from "../../../components/BudgetReportCustomizationModal";
import AllSectionsHiddenCard from "../../../components/common/AllSectionsHiddenCard";
import ReportActionsMenu, {
  createDefaultReportMenuItems,
} from "../../../components/common/ReportActionsMenu";
import "../Payment Report/PaymentReport.css";

const COLORS = getChartColors();

/**
 * All Budgets Report Component
 * Displays comprehensive budget analytics with overview, category breakdown, payment method breakdown, and individual budgets
 */
const AllBudgetsReport = () => {
  const { colors, mode } = useTheme();
  const { friendId } = useParams();
  const navigate = useNavigate();

  // Layout configuration for section customization
  const layoutConfig = useBudgetReportLayout();

  // Check if all sections are hidden early
  const allSectionsHidden = layoutConfig.visibleSections.length === 0;

  // State for customization modal
  const [customizationOpen, setCustomizationOpen] = useState(false);

  const {
    timeframe,
    flowType,
    setTimeframe,
    setFlowType,
    dateRange,
    setCustomDateRange,
    resetDateRange,
    isCustomRange,
    loading,
    error,
    budgetsData,
    categoryBreakdown,
    paymentMethodBreakdown,
    topRecurringExpenses,
  } = useBudgetReportData({ friendId, skip: allSectionsHidden });

  const {
    filterDefaults: baseBudgetFilterDefaults,
    filterValues,
    sections: budgetFilterSections,
    isFilterOpen,
    openFilters,
    closeFilters,
    handleApplyFilters,
    handleResetFilters,
    filtersActive,
    filteredBudgets,
    filteredBudgetSummary,
    effectiveCategoryBreakdown,
    effectivePaymentBreakdown,
  } = useBudgetReportFilters({
    timeframe,
    flowType,
    setTimeframe,
    setFlowType,
    dateRange,
    setCustomDateRange,
    resetDateRange,
    isCustomRange,
    budgetsData,
    categoryBreakdown,
    paymentMethodBreakdown,
  });

  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  const dailySpendingData = useMemo(() => {
    const dayTypeMap = new Map();

    const budgetCatalog = (filteredBudgets || []).map((budget) => {
      const budgetId = budget?.budgetId ?? budget?.id;
      const budgetName = String(
        budget?.budgetName ?? budget?.name ?? ""
      ).trim();
      const budgetKey = String((budgetId ?? budgetName) || "Unknown");
      return {
        budgetKey,
        budgetId,
        budgetName: budgetName || "Unknown budget",
      };
    });

    const toIsoDay = (value) => {
      if (!value) return null;
      const str = String(value);
      return str.includes("T") ? str.split("T")[0] : str.slice(0, 10);
    };

    const getExpenseType = (expense) =>
      String(expense?.type ?? expense?.expense?.type ?? "").toLowerCase();

    const getAmount = (expense) => {
      const raw = Number(expense?.amount ?? expense?.expense?.amount ?? 0);
      return Number.isFinite(raw) ? raw : 0;
    };

    for (const budget of filteredBudgets || []) {
      const budgetId = budget?.budgetId ?? budget?.id;
      const budgetName = String(
        budget?.budgetName ?? budget?.name ?? ""
      ).trim();

      const expenses = Array.isArray(budget?.expenses) ? budget.expenses : [];
      for (const expense of expenses) {
        const day = toIsoDay(expense?.date ?? expense?.isoDate ?? expense?.day);
        if (!day) continue;

        const type = getExpenseType(expense);
        if (type !== "loss" && type !== "gain") continue;

        const amount = Math.abs(getAmount(expense));
        if (!amount) continue;

        const key = `${day}|${type}`;
        if (!dayTypeMap.has(key)) {
          dayTypeMap.set(key, {
            isoDate: day,
            type,
            spending: 0,
            budgets: new Map(),
          });
        }

        const entry = dayTypeMap.get(key);
        entry.spending += amount;

        const budgetKey = String((budgetId ?? budgetName) || "Unknown");
        const prev = entry.budgets.get(budgetKey);
        if (prev) {
          prev.total += amount;
        } else {
          entry.budgets.set(budgetKey, {
            budgetId,
            budgetName: budgetName || "Unknown budget",
            total: amount,
          });
        }
      }
    }

    return Array.from(dayTypeMap.values())
      .map((entry) => {
        const budgetTotals = budgetCatalog
          .map((b) => {
            const found = entry.budgets.get(b.budgetKey);
            const total = found?.total ?? 0;
            return {
              budgetId: b.budgetId,
              budgetName: b.budgetName,
              total: Math.round(total * 100.0) / 100.0,
            };
          })
          .sort((a, b) => b.total - a.total);

        return {
          isoDate: entry.isoDate,
          type: entry.type,
          spending: Math.round(entry.spending * 100.0) / 100.0,
          budgetTotals,
        };
      })
      .sort((a, b) => String(a.isoDate).localeCompare(String(b.isoDate)));
  }, [filteredBudgets]);

  const handleExport = () => {
    console.log("Exporting budget report...");
  };

  const handleTimeframeChange = (newTimeframe) => setTimeframe(newTimeframe);
  const handleFlowTypeChange = (newFlow) => setFlowType(newFlow);

  const handleBack = () => {
    if (friendId && friendId !== "undefined") {
      navigate(`/friends/expenses/${friendId}`);
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/budgets");
    }
  };

  // Three-dot menu using reusable component
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
        className={`payment-methods-report ${mode}`}
        style={{ background: colors.secondary_bg }}
      >
        <ReportHeader
          className="payment-methods-header"
          title="💰 Budget Analytics"
          subtitle="Comprehensive analysis of budget allocations and spending trends"
          timeframe={timeframe}
          onTimeframeChange={handleTimeframeChange}
          onBack={handleBack}
          flowType={flowType}
          onFlowTypeChange={handleFlowTypeChange}
          rightActions={reportHeaderActions}
          showExportButton={false}
          showFilterButton={false}
        />
        <div style={{ padding: "24px" }}>
          <AllSectionsHiddenCard
            title="All Report Sections Hidden"
            message="You've hidden all sections from this budget report. Click the button below or use the menu to customize and restore sections."
            onCustomize={() => setCustomizationOpen(true)}
            customizeButtonLabel="Customize Report"
            height={280}
          />
        </div>
        <BudgetReportCustomizationModal
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
        className={`payment-methods-report ${mode}`}
        style={{ background: colors.secondary_bg }}
      >
        <ReportHeaderSkeleton />
        <div style={{ padding: "0 24px 24px 24px" }}>
          <div
            className="charts-grid"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {(() => {
              const elements = [];
              const visibleSections = layoutConfig.visibleSections;
              let i = 0;

              while (i < visibleSections.length) {
                const section = visibleSections[i];
                const nextSection = visibleSections[i + 1];
                const isHalf = section.type === "half";
                const nextIsHalf = nextSection?.type === "half";

                if (isHalf && nextIsHalf) {
                  elements.push(
                    <div
                      key={`half-row-${section.id}-${nextSection.id}`}
                      className="chart-row half-width-row"
                      style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                        gap: isMobile ? 16 : 24,
                        width: "100%",
                      }}
                    >
                      {renderSkeletonSection(section)}
                      {renderSkeletonSection(nextSection)}
                    </div>
                  );
                  i += 2;
                } else {
                  elements.push(renderSkeletonSection(section));
                  i += 1;
                }
              }

              return elements;

              function renderSkeletonSection(sec) {
                switch (sec.id) {
                  case "overview-cards":
                    return (
                      <div
                        key={sec.id}
                        className="budget-overview-cards"
                        style={{
                          display: "grid",
                          gridTemplateColumns: isMobile
                            ? "1fr"
                            : "repeat(4, 1fr)",
                          gap: "16px",
                        }}
                      >
                        {[1, 2, 3, 4].map((idx) => (
                          <OverviewCardSkeleton key={idx} />
                        ))}
                      </div>
                    );
                  case "daily-spending":
                    return (
                      <div key={sec.id} className="chart-row full-width">
                        <DailySpendingSkeleton
                          title="📊 Daily Spending Pattern (Budgets)"
                          showControls={false}
                        />
                      </div>
                    );
                  case "recurring-expenses":
                    return (
                      <div key={sec.id} style={{ width: "100%" }}>
                        <TopRecurringExpensesSkeleton rows={5} />
                      </div>
                    );
                  case "loss-gain-breakdown":
                    return (
                      <div key={sec.id} style={{ width: "100%" }}>
                        <LossGainBreakdownSkeleton />
                      </div>
                    );
                  case "category-distribution":
                    return (
                      <div key={sec.id} className="chart-row full-width">
                        <PieChartSkeleton height={360} chipCount={7} />
                      </div>
                    );
                  case "payment-distribution":
                    return (
                      <div key={sec.id} className="chart-row full-width">
                        <PieChartSkeleton height={360} chipCount={7} />
                      </div>
                    );
                  case "budget-overview-grid":
                    return (
                      <div key={sec.id} className="chart-row full-width">
                        <ChartSkeleton height={350} />
                      </div>
                    );
                  case "budget-accordion":
                    return (
                      <div key={sec.id} className="chart-row full-width">
                        <AccordionSkeleton items={6} />
                      </div>
                    );
                  default:
                    return null;
                }
              }
            })()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`payment-methods-report ${mode}`}
      style={{ background: colors.secondary_bg }}
    >
      <ReportHeader
        className="payment-methods-header"
        title="💰 Budget Analytics"
        subtitle="Comprehensive analysis of budget allocations and spending trends"
        onFilter={openFilters}
        onTimeframeChange={handleTimeframeChange}
        timeframe={timeframe}
        onBack={handleBack}
        flowType={flowType}
        onFlowTypeChange={handleFlowTypeChange}
        dateRangeProps={{
          fromDate: dateRange?.fromDate,
          toDate: dateRange?.toDate,
          onApply: setCustomDateRange,
          onReset: resetDateRange,
        }}
        isCustomRangeActive={isCustomRange}
        showFilterButton={budgetFilterSections.length > 0}
        isFilterActive={filtersActive}
        rightActions={reportHeaderActions}
        showExportButton={false}
      />

      {error ? (
        <div
          style={{
            padding: 16,
            color: "#ff6b6b",
            background:
              mode === "dark"
                ? "rgba(255, 107, 107, 0.1)"
                : "rgba(255, 107, 107, 0.05)",
            borderRadius: "8px",
            margin: "16px",
          }}
        >
          Error: {error}
        </div>
      ) : null}

      {/* Render sections in the order defined by layout config */}
      <div
        className="charts-grid"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {(() => {
          const elements = [];
          const visibleSections = layoutConfig.visibleSections;
          let i = 0;

          while (i < visibleSections.length) {
            const section = visibleSections[i];
            const nextSection = visibleSections[i + 1];
            const isHalf = section.type === "half";
            const nextIsHalf = nextSection?.type === "half";

            if (isHalf && nextIsHalf) {
              elements.push(
                <div
                  key={`half-row-${section.id}-${nextSection.id}`}
                  className="chart-row half-width-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: isMobile ? 16 : 24,
                    width: "100%",
                  }}
                >
                  {renderSection(section)}
                  {renderSection(nextSection)}
                </div>
              );
              i += 2;
            } else {
              elements.push(renderSection(section));
              i += 1;
            }
          }

          return elements;

          function renderSection(sec) {
            switch (sec.id) {
              case "overview-cards":
                return (
                  <SharedOverviewCards
                    key={sec.id}
                    data={[filteredBudgetSummary]}
                    mode="budget"
                  />
                );

              case "daily-spending":
                if (dailySpendingData.length === 0) return null;
                return (
                  <div key={sec.id} className="chart-row full-width">
                    <DailySpendingChart
                      data={dailySpendingData}
                      timeframe={timeframe}
                      selectedType={flowType}
                      showBudgetTotalsInTooltip
                      showBudgetsInTooltip
                      hideControls
                      showBothTypesWhenAll
                    />
                  </div>
                );

              case "recurring-expenses":
                if (
                  filteredBudgets.length === 0 &&
                  topRecurringExpenses.length === 0
                )
                  return null;
                return (
                  <div
                    key={sec.id}
                    className="chart-row"
                    style={{ width: "100%" }}
                  >
                    <TopRecurringExpensesCard
                      budgets={filteredBudgets}
                      items={topRecurringExpenses}
                      layout="gridItem"
                    />
                  </div>
                );

              case "loss-gain-breakdown":
                if (filteredBudgets.length === 0) return null;
                return (
                  <div
                    key={sec.id}
                    className="chart-row"
                    style={{ width: "100%" }}
                  >
                    <LossGainBreakdownCard
                      budgets={filteredBudgets}
                      layout="gridItem"
                    />
                  </div>
                );

              case "category-distribution":
                if (effectiveCategoryBreakdown.length === 0) return null;
                return (
                  <div
                    key={sec.id}
                    className="chart-row full-width"
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr",
                      gap: isMobile ? 16 : 24,
                      width: "100%",
                    }}
                  >
                    <SharedDistributionChart
                      data={effectiveCategoryBreakdown}
                      mode="category"
                      title="Category Distribution"
                      subtitle="Spending breakdown across categories in all budgets"
                      colorsFallback={COLORS}
                    />
                  </div>
                );

              case "payment-distribution":
                if (effectivePaymentBreakdown.length === 0) return null;
                return (
                  <div
                    key={sec.id}
                    className="chart-row full-width"
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr",
                      gap: isMobile ? 16 : 24,
                      width: "100%",
                    }}
                  >
                    <SharedDistributionChart
                      data={effectivePaymentBreakdown}
                      mode="payment"
                      title="Payment Method Distribution"
                      subtitle="How expenses are paid across all budgets"
                      colorsFallback={COLORS}
                    />
                  </div>
                );

              case "budget-overview-grid":
                if (filteredBudgets.length === 0) return null;
                return (
                  <div key={sec.id} className="chart-row full-width">
                    <div
                      className="chart-container"
                      style={{
                        background: colors.primary_bg,
                        border: `1px solid ${colors.border_color}`,
                        borderRadius: "12px",
                        padding: "24px",
                      }}
                    >
                      <div
                        className="chart-header"
                        style={{ marginBottom: "20px" }}
                      >
                        <h3
                          style={{
                            color: colors.primary_text,
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            margin: "0 0 4px 0",
                          }}
                        >
                          🎯 Budget Overview
                        </h3>
                        <div
                          className="chart-subtitle"
                          style={{
                            color: mode === "dark" ? "#888" : "#666",
                            fontSize: "14px",
                          }}
                        >
                          Visual overview of all budget allocations and
                          utilization
                        </div>
                      </div>
                      <BudgetOverviewGrid budgets={filteredBudgets} />
                    </div>
                  </div>
                );

              case "budget-accordion":
                return (
                  <div key={sec.id} className="chart-row full-width">
                    <div
                      className="chart-container"
                      style={{
                        background: colors.secondary_bg,
                        border: `1px solid ${colors.border_color}`,
                        borderRadius: "12px",
                        padding: "20px",
                        minHeight: "auto",
                        height: "auto",
                      }}
                    >
                      <div className="chart-header">
                        <h3 style={{ color: colors.primary_text }}>
                          📊 Individual Budget Details
                        </h3>
                        <div
                          className="chart-subtitle"
                          style={{
                            color: mode === "dark" ? "#9ca3af" : "#6b7280",
                          }}
                        >
                          Expand a budget to view expenses and detailed
                          breakdown
                        </div>
                      </div>
                      <BudgetAccordionGroup budgets={filteredBudgets} />
                    </div>
                  </div>
                );

              default:
                return null;
            }
          }
        })()}
      </div>

      {/* Customization Modal */}
      <BudgetReportCustomizationModal
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
        sections={budgetFilterSections}
        values={filterValues}
        initialValues={baseBudgetFilterDefaults}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </div>
  );
};

export default AllBudgetsReport;
