import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// (Removed individual Recharts imports; charts are encapsulated in child components)

// (Removed direct icon imports; header component encapsulates icons internally)
import "./PaymentReport.css";
import usePaymentReportData from "../../../hooks/usePaymentReportData";
import usePaymentReportLayout from "../../../hooks/usePaymentReportLayout";
import ReportHeader from "../../../components/ReportHeader";
import PaymentMethodAccordionGroup from "../../../components/PaymentMethodAccordion";
import {
  ReportHeaderSkeleton,
  OverviewCardSkeleton,
  ChartSkeleton,
  PieChartSkeleton,
  AccordionSkeleton,
} from "../../../components/skeletons/CommonSkeletons";
import { DailySpendingSkeleton } from "../../Dashboard";
import SharedOverviewCards from "../../../components/charts/SharedOverviewCards";
import SharedDistributionChart from "../../../components/charts/SharedDistributionChart";
import PaymentUsageChart from "../../../components/charts/PaymentUsageChart";
import TransactionSizeChart from "../../../components/charts/TransactionSizeChart";
import CategoryPaymentBreakdown from "../../../components/charts/CategoryPaymentBreakdown";
import PaymentReportCustomizationModal from "../../../components/PaymentReportCustomizationModal";
import AllSectionsHiddenCard from "../../../components/common/AllSectionsHiddenCard";
import ReportActionsMenu, {
  createDefaultReportMenuItems,
} from "../../../components/common/ReportActionsMenu";
import { getChartColors } from "../../../utils/chartColors";
import { useTheme } from "../../../hooks/useTheme";
import ReportFilterDrawer from "../../../components/reportFilters/ReportFilterDrawer";
import usePaymentReportFilters from "../../../hooks/reportFilters/usePaymentReportFilters";
import PaymentDailySpendingChart from "../../../components/payment/PaymentDailySpendingChart";

const COLORS = getChartColors();

// Main Payment Methods Report Component
const PaymentMethodsReport = () => {
  const { colors, mode } = useTheme();
  const { friendId } = useParams();
  const navigate = useNavigate();

  // Layout configuration for section customization
  const layoutConfig = usePaymentReportLayout();

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
    methodsData,
    txSizeData,
    categoryBreakdown,
    categories,
    refresh,
  } = usePaymentReportData({ friendId, skip: allSectionsHidden });

  const {
    filterDefaults: basePaymentFilterDefaults,
    filterValues,
    sections: paymentFilterSections,
    isFilterOpen,
    openFilters,
    closeFilters,
    handleApplyFilters,
    handleResetFilters,
    filtersActive,
    filteredMethodsData,
    filteredCategoryBreakdown,
    filteredTxSizeData,
  } = usePaymentReportFilters({
    timeframe,
    flowType,
    setTimeframe,
    setFlowType,
    dateRange,
    setCustomDateRange,
    resetDateRange,
    isCustomRange,
    methodsData,
    txSizeData,
    categoryBreakdown,
    categories,
  });

  // Responsive detection
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  const handleExport = () => {
    console.log("Exporting payment methods report...");
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
          title="💳 Payment Methods Analytics"
          subtitle="Comprehensive analysis of payment method usage and trends"
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
            message="You've hidden all sections from this payment report. Click the button below or use the menu to customize and restore sections."
            onCustomize={() => setCustomizationOpen(true)}
            customizeButtonLabel="Customize Report"
            height={280}
          />
        </div>
        {/* Customization Modal */}
        <PaymentReportCustomizationModal
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
                  // Render two half-width skeletons in same row
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
                        className="payment-overview-cards"
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
                          title="📊 Daily Spending Pattern (Payment Methods)"
                          showControls={false}
                        />
                      </div>
                    );
                  case "payment-distribution":
                    return (
                      <div key={sec.id} className="chart-row full-width">
                        <PieChartSkeleton height={360} chipCount={7} />
                      </div>
                    );
                  case "usage-analysis":
                    return (
                      <div key={sec.id} className="chart-row full-width">
                        <ChartSkeleton height={430} />
                      </div>
                    );
                  case "transaction-sizes":
                    return (
                      <div
                        key={sec.id}
                        className="chart-row"
                        style={{ width: "100%" }}
                      >
                        <ChartSkeleton height={400} />
                      </div>
                    );
                  case "category-breakdown":
                    return (
                      <div
                        key={sec.id}
                        className="chart-row"
                        style={{ width: "100%" }}
                      >
                        <ChartSkeleton height={400} />
                      </div>
                    );
                  case "payment-accordion":
                    return (
                      <div key={sec.id} className="chart-row full-width">
                        <AccordionSkeleton items={8} />
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
        title="💳 Payment Methods Analytics"
        subtitle="Comprehensive analysis of payment method usage and trends"
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
        showFilterButton={paymentFilterSections.length > 0}
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

            // Check if current and next sections are both half-width
            const nextSection = visibleSections[i + 1];
            const isHalf = section.type === "half";
            const nextIsHalf = nextSection?.type === "half";

            if (isHalf && nextIsHalf) {
              // Render two half-width sections in same row
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
              i += 2; // Skip next section as it's already rendered
            } else {
              // Render full-width or single half-width section
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
                    data={filteredMethodsData}
                    mode="payment"
                  />
                );

              case "daily-spending":
                return (
                  <PaymentDailySpendingChart
                    key={sec.id}
                    methods={filteredMethodsData}
                    timeframe={timeframe}
                    flowType={flowType}
                  />
                );

              case "payment-distribution":
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
                      data={filteredMethodsData}
                      mode="payment"
                      colorsFallback={COLORS}
                    />
                  </div>
                );

              case "usage-analysis":
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
                    <PaymentUsageChart data={filteredMethodsData} />
                  </div>
                );

              case "transaction-sizes":
                if (filteredTxSizeData.length === 0) return null;
                return (
                  <div
                    key={sec.id}
                    className="chart-row"
                    style={{ width: "100%" }}
                  >
                    <TransactionSizeChart
                      data={filteredTxSizeData}
                      methodsColors={filteredMethodsData.map(
                        ({ method, color }) => ({
                          method,
                          color,
                        })
                      )}
                    />
                  </div>
                );

              case "category-breakdown":
                if (filteredCategoryBreakdown.length === 0) return null;
                return (
                  <div
                    key={sec.id}
                    className="chart-row"
                    style={{ width: "100%" }}
                  >
                    <CategoryPaymentBreakdown
                      data={filteredCategoryBreakdown}
                      methodsColors={filteredMethodsData.map(
                        ({ method, color }) => ({
                          method,
                          color,
                        })
                      )}
                    />
                  </div>
                );

              case "payment-accordion":
                return (
                  <div key={sec.id} className="chart-row full-width">
                    <div
                      className="chart-container"
                      style={{
                        background: colors.secondary_bg,
                        border: `1px solid ${colors.border_color}`,
                        borderRadius: "12px",
                        padding: "20px",
                      }}
                    >
                      <div className="chart-header">
                        <h3 style={{ color: colors.primary_text }}>
                          📂 Payment Method Expenses
                        </h3>
                        <div
                          className="chart-subtitle"
                          style={{
                            color: mode === "dark" ? "#9ca3af" : "#6b7280",
                          }}
                        >
                          Expand a method to view individual expenses (Loss /
                          Gain tabs)
                        </div>
                      </div>
                      <PaymentMethodAccordionGroup
                        methods={filteredMethodsData}
                      />
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
      <PaymentReportCustomizationModal
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
        sections={paymentFilterSections}
        values={filterValues}
        initialValues={basePaymentFilterDefaults}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </div>
  );
};

export default PaymentMethodsReport;
