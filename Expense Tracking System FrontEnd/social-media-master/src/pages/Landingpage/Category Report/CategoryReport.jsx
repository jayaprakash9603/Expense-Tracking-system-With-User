import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ReportHeaderSkeleton,
  OverviewCardSkeleton,
  ChartSkeleton,
  PieChartSkeleton,
  AccordionSkeleton,
} from "../../../components/skeletons/CommonSkeletons";
import { DailySpendingSkeleton } from "../../Dashboard";
import "./CategoryReport.css";
import useCategoryReportData from "../../../hooks/useCategoryReportData";
import useCategoryReportLayout from "../../../hooks/useCategoryReportLayout";
import CategoryExpensesAccordion from "../../../components/CategoryExpensesAccordion";
import ReportHeader from "../../../components/ReportHeader";
import PaymentUsageChart from "../../../components/charts/PaymentUsageChart";
import SharedOverviewCards from "../../../components/charts/SharedOverviewCards";
import SharedDistributionChart from "../../../components/charts/SharedDistributionChart";
import CategoryReportCustomizationModal from "../../../components/CategoryReportCustomizationModal";
import AllSectionsHiddenCard from "../../../components/common/AllSectionsHiddenCard";
import ReportActionsMenu, {
  createDefaultReportMenuItems,
} from "../../../components/common/ReportActionsMenu";
import { getChartColors } from "../../../utils/chartColors";
import { useTheme } from "../../../hooks/useTheme";
import ReportFilterDrawer from "../../../components/reportFilters/ReportFilterDrawer";
import useCategoryReportFilters from "../../../hooks/reportFilters/useCategoryReportFilters";
import CategoryDailySpendingChart from "../../../components/category/CategoryDailySpendingChart";

const COLORS = getChartColors(10); // limit to first 10 for category distribution

// COLORS used for fallback pie slice coloring

// Main Category Report Component
const CategoryReport = () => {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const { colors, mode } = useTheme();

  // Layout configuration for section customization
  const layoutConfig = useCategoryReportLayout();

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
    categories: categorySpending,
    refresh,
  } = useCategoryReportData({ friendId, skip: allSectionsHidden });

  const {
    filterDefaults: baseCategoryFilterDefaults,
    filterValues,
    sections: categoryFilterSections,
    isFilterOpen,
    openFilters,
    closeFilters,
    handleApplyFilters,
    handleResetFilters,
    filtersActive,
    filteredCategories,
  } = useCategoryReportFilters({
    timeframe,
    flowType,
    setTimeframe,
    setFlowType,
    dateRange,
    setCustomDateRange,
    resetDateRange,
    isCustomRange,
    categorySpending,
  });

  const handleExport = () => {
    console.log("Exporting category report...");
  };

  const handleTimeframeChange = (newTimeframe) => setTimeframe(newTimeframe);
  const handleFlowTypeChange = (newFlow) => setFlowType(newFlow);

  const handleBack = () => {
    if (friendId && friendId !== "undefined") {
      navigate(`/friends/expenses/${friendId}`);
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/expenses");
    }
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
        className={`category-report ${mode}`}
        style={{
          background: colors.secondary_bg,
          color: colors.primary_text,
        }}
      >
        <ReportHeader
          className="category-report-header"
          title="📊 Category Analytics"
          subtitle="Comprehensive spending analysis by categories"
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
            message="You've hidden all sections from this category report. Click the button below or use the menu to customize and restore sections."
            onCustomize={() => setCustomizationOpen(true)}
            customizeButtonLabel="Customize Report"
            height={280}
          />
        </div>
        {/* Customization Modal */}
        <CategoryReportCustomizationModal
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
        className={`category-report ${mode}`}
        style={{
          background: colors.secondary_bg,
          color: colors.primary_text,
        }}
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
            {layoutConfig.visibleSections.map((section) => {
              switch (section.id) {
                case "overview-cards":
                  return (
                    <div
                      key={section.id}
                      className="category-overview-cards"
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
                      <DailySpendingSkeleton
                        title="📊 Daily Spending Pattern (Categories)"
                        showControls={false}
                      />
                    </div>
                  );
                case "usage-analysis":
                  return (
                    <div key={section.id} className="chart-row full-width">
                      <ChartSkeleton height={430} />
                    </div>
                  );
                case "category-distribution":
                  return (
                    <div key={section.id} className="chart-row full-width">
                      <PieChartSkeleton height={360} chipCount={7} />
                    </div>
                  );
                case "category-accordion":
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
      className={`category-report ${mode}`}
      style={{
        background: colors.secondary_bg,
        color: colors.primary_text,
      }}
    >
      <ReportHeader
        className="category-report-header"
        title="📊 Category Analytics"
        subtitle="Comprehensive spending analysis by categories"
        onFilter={openFilters}
        onTimeframeChange={handleTimeframeChange}
        timeframe={timeframe}
        onBack={handleBack}
        flowType={flowType}
        onFlowTypeChange={handleFlowTypeChange}
        dateRangeProps={
          dateRange
            ? {
                fromDate: dateRange.fromDate,
                toDate: dateRange.toDate,
                onApply: setCustomDateRange,
                onReset: resetDateRange,
              }
            : undefined
        }
        isCustomRangeActive={isCustomRange}
        showFilterButton={categoryFilterSections.length > 0}
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
                : "rgba(255, 107, 107, 0.15)",
            borderRadius: "8px",
            border: `1px solid ${
              mode === "dark"
                ? "rgba(255, 107, 107, 0.3)"
                : "rgba(255, 107, 107, 0.4)"
            }`,
            marginBottom: "16px",
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
        {layoutConfig.visibleSections.map((section) => {
          switch (section.id) {
            case "overview-cards":
              return (
                <SharedOverviewCards
                  key={section.id}
                  data={filteredCategories}
                  mode="category"
                />
              );

            case "daily-spending":
              return (
                <CategoryDailySpendingChart
                  key={section.id}
                  categories={filteredCategories}
                  timeframe={timeframe}
                  flowType={flowType}
                />
              );

            case "usage-analysis":
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
                  <PaymentUsageChart
                    data={filteredCategories.map((c) => ({
                      method: c.name,
                      totalAmount: c.amount,
                      transactions: c.transactions,
                    }))}
                    title="Category Usage Analysis"
                  />
                </div>
              );

            case "category-distribution":
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
                  <SharedDistributionChart
                    data={filteredCategories}
                    mode="category"
                    colorsFallback={COLORS}
                  />
                </div>
              );

            case "category-accordion":
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
                  <CategoryExpensesAccordion categories={filteredCategories} />
                </div>
              );

            default:
              return null;
          }
        })}
      </div>

      {/* Customization Modal */}
      <CategoryReportCustomizationModal
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
        sections={categoryFilterSections}
        values={filterValues}
        initialValues={baseCategoryFilterDefaults}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </div>
  );
};

export default CategoryReport;
