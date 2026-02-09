import React, { useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  LineChart,
  Line,
} from "recharts";
import "./FriendshipReport.css";
import { useNavigate } from "react-router-dom";
import useUserSettings from "../../hooks/useUserSettings";
import { useTheme } from "../../hooks/useTheme";
import ReportHeader from "../../components/ReportHeader";
import SharedOverviewCards from "../../components/charts/SharedOverviewCards";
import ReportFilterDrawer from "../../components/reportFilters/ReportFilterDrawer";
import useFriendshipReportFilters, {
  FRIENDSHIP_STATUS_OPTIONS,
  ACCESS_LEVEL_OPTIONS,
  FRIENDSHIP_TIMEFRAME_OPTIONS,
} from "../../hooks/reportFilters/useFriendshipReportFilters";
import useFriendshipReportLayout from "../../hooks/useFriendshipReportLayout";
import FriendshipReportCustomizationModal from "../../components/FriendshipReportCustomizationModal";
import AllSectionsHiddenCard from "../../components/common/AllSectionsHiddenCard";
import ReportActionsMenu, {
  createDefaultReportMenuItems,
} from "../../components/common/ReportActionsMenu";
import {
  ReportHeaderSkeleton,
  OverviewCardSkeleton,
  ChartSkeleton,
  PieChartSkeleton,
} from "../../components/skeletons/CommonSkeletons";

// Skeleton Components with theme support
const BarChartSkeletonInner = ({ mode }) => (
  <div className={`skeleton-chart ${mode}`}>
    <div className="skeleton-bars">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="skeleton-bar"
          style={{ height: `${30 + Math.random() * 60}%` }}
        />
      ))}
    </div>
  </div>
);

const PieChartSkeletonInner = ({ mode }) => (
  <div className={`skeleton-pie ${mode}`}>
    <div className="skeleton-pie-ring" />
    <div className="skeleton-pie-center" />
  </div>
);

const RadialChartSkeletonInner = ({ mode }) => (
  <div className={`skeleton-radial ${mode}`}>
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="skeleton-radial-bar"
        style={{ transform: `rotate(${i * 90}deg) translate(0, -10%)` }}
      />
    ))}
    <div className="skeleton-pie-center" />
  </div>
);

const TableSkeleton = ({ mode }) => (
  <div className={`chart-container full-width ${mode}`}>
    <div className="skeleton-title large" style={{ marginBottom: "16px" }} />
    <div className="skeleton-table">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="skeleton-table-row"
          style={{ display: "flex", gap: "16px", marginBottom: "12px" }}
        >
          <div className="skeleton-text" style={{ flex: 2 }} />
          <div className="skeleton-text" style={{ flex: 1 }} />
          <div className="skeleton-text" style={{ flex: 1 }} />
          <div className="skeleton-text" style={{ flex: 1 }} />
          <div className="skeleton-text" style={{ flex: 1 }} />
        </div>
      ))}
    </div>
  </div>
);

// Layout-aware Loading Skeleton - All sections customizable
const LoadingSkeleton = ({ mode, visibleSections = [] }) => {
  // Render skeleton for any section type
  const renderSectionSkeleton = (section) => {
    switch (section.id) {
      case "overview-cards":
        return (
          <div
            key={section.id}
            className="overview-cards-skeleton"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <OverviewCardSkeleton key={i} />
            ))}
          </div>
        );
      case "access-level-chart":
        return (
          <div key={section.id} className="chart-container chart-half-width">
            <div className="skeleton-title" />
            <PieChartSkeletonInner mode={mode} />
          </div>
        );
      case "activity-chart":
        return (
          <div key={section.id} className="chart-container chart-half-width">
            <div className="skeleton-title" />
            <BarChartSkeletonInner mode={mode} />
          </div>
        );
      case "sharing-status-chart":
        return (
          <div key={section.id} className="chart-container chart-half-width">
            <div className="skeleton-title" />
            <BarChartSkeletonInner mode={mode} />
          </div>
        );
      case "top-friends-chart":
        return (
          <div key={section.id} className="chart-container chart-half-width">
            <div className="skeleton-title" />
            <RadialChartSkeletonInner mode={mode} />
          </div>
        );
      case "friends-table":
        return <TableSkeleton key={section.id} mode={mode} />;
      default:
        return null;
    }
  };

  // Group consecutive chart sections for grid layout
  const renderSectionsWithLayout = () => {
    const result = [];
    let chartBuffer = [];
    const chartIds = [
      "access-level-chart",
      "activity-chart",
      "sharing-status-chart",
      "top-friends-chart",
    ];

    const flushChartBuffer = () => {
      if (chartBuffer.length > 0) {
        result.push(
          <div
            key={`chart-grid-${result.length}`}
            className="chart-report-grid"
          >
            {chartBuffer.map((section) => renderSectionSkeleton(section))}
          </div>
        );
        chartBuffer = [];
      }
    };

    visibleSections.forEach((section) => {
      if (chartIds.includes(section.id)) {
        chartBuffer.push(section);
      } else {
        flushChartBuffer();
        result.push(renderSectionSkeleton(section));
      }
    });

    flushChartBuffer();
    return result;
  };

  return (
    <div className={`friendship-report skeleton-mode ${mode}`}>
      <ReportHeaderSkeleton />
      <div style={{ padding: "0 24px 24px 24px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {visibleSections.length > 0 ? (
            renderSectionsWithLayout()
          ) : (
            // Default skeleton if no sections defined yet
            <>
              <div
                className="overview-cards-skeleton"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "16px",
                }}
              >
                {[...Array(4)].map((_, i) => (
                  <OverviewCardSkeleton key={i} />
                ))}
              </div>
              <div className="chart-report-grid">
                <div className="chart-container chart-half-width">
                  <div className="skeleton-title" />
                  <PieChartSkeletonInner mode={mode} />
                </div>
                <div className="chart-container chart-half-width">
                  <div className="skeleton-title" />
                  <BarChartSkeletonInner mode={mode} />
                </div>
                <div className="chart-container chart-half-width">
                  <div className="skeleton-title" />
                  <BarChartSkeletonInner mode={mode} />
                </div>
                <div className="chart-container chart-half-width">
                  <div className="skeleton-title" />
                  <RadialChartSkeletonInner mode={mode} />
                </div>
              </div>
              <TableSkeleton mode={mode} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Access Level Distribution Chart
const AccessLevelChart = ({ data, COLORS, colors }) => (
  <div className="chart-container chart-half-width">
    <h3 style={{ color: colors.primary_text }}>🔐 Access Level Distribution</h3>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: colors.card_bg,
            border: `1px solid ${colors.border_color}`,
            borderRadius: "8px",
            color: colors.primary_text,
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

// Friendship Activity Chart
const FriendshipActivityChart = ({ data, colors }) => (
  <div className="chart-container chart-half-width">
    <h3 style={{ color: colors.primary_text }}>
      📈 Friendship Activity (Last 6 Months)
    </h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.border_color} />
        <XAxis dataKey="month" stroke={colors.secondary_text} />
        <YAxis stroke={colors.secondary_text} />
        <Tooltip
          contentStyle={{
            backgroundColor: colors.card_bg,
            border: `1px solid ${colors.border_color}`,
            borderRadius: "8px",
            color: colors.primary_text,
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="newFriends"
          stroke="#14b8a6"
          strokeWidth={2}
          name="New Friends"
        />
        <Line
          type="monotone"
          dataKey="requestsSent"
          stroke="#f59e0b"
          strokeWidth={2}
          name="Requests Sent"
        />
        <Line
          type="monotone"
          dataKey="requestsReceived"
          stroke="#8b5cf6"
          strokeWidth={2}
          name="Requests Received"
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// Sharing Status Chart
const SharingStatusChart = ({ data, colors }) => (
  <div className="chart-container chart-half-width">
    <h3 style={{ color: colors.primary_text }}>🔄 Sharing Status Overview</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke={colors.border_color} />
        <XAxis type="number" stroke={colors.secondary_text} />
        <YAxis
          dataKey="name"
          type="category"
          stroke={colors.secondary_text}
          width={100}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: colors.card_bg,
            border: `1px solid ${colors.border_color}`,
            borderRadius: "8px",
            color: colors.primary_text,
          }}
        />
        <Bar dataKey="count" fill="#14b8a6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// Top Friends Radial Chart
const TopFriendsChart = ({ data, colors }) => (
  <div className="chart-container chart-half-width">
    <h3 style={{ color: colors.primary_text }}>⭐ Top Active Friends</h3>
    <ResponsiveContainer width="100%" height={300}>
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius="20%"
        outerRadius="90%"
        data={data}
        startAngle={180}
        endAngle={0}
      >
        <RadialBar
          minAngle={15}
          background
          clockWise
          dataKey="interactionScore"
          label={{ fill: colors.primary_text, position: "insideStart" }}
        />
        <Legend
          iconSize={10}
          layout="vertical"
          verticalAlign="middle"
          align="right"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: colors.card_bg,
            border: `1px solid ${colors.border_color}`,
            borderRadius: "8px",
            color: colors.primary_text,
          }}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  </div>
);

// Friends List Table
const FriendsTable = ({ friends, colors }) => (
  <div className="chart-container full-width friends-table-container">
    <div className="table-header">
      <div>
        <h3 style={{ color: colors.primary_text }}>👥 Friends Overview</h3>
        <p style={{ color: colors.secondary_text }}>
          {friends.length} friend{friends.length === 1 ? "" : "s"} total
        </p>
      </div>
    </div>

    {friends.length === 0 ? (
      <div className="empty-state">
        <p style={{ color: colors.secondary_text }}>No friends to display.</p>
      </div>
    ) : (
      <div className="table-wrapper">
        <table className="friends-table">
          <thead>
            <tr>
              <th style={{ color: colors.secondary_text }}>Friend</th>
              <th style={{ color: colors.secondary_text }}>Status</th>
              <th style={{ color: colors.secondary_text }}>My Access</th>
              <th style={{ color: colors.secondary_text }}>Their Access</th>
              <th style={{ color: colors.secondary_text }}>Connected Since</th>
            </tr>
          </thead>
          <tbody>
            {friends.map((friend) => (
              <tr key={friend.id} style={{ borderColor: colors.border_color }}>
                <td style={{ color: colors.primary_text }}>
                  <div className="friend-name">
                    <strong>{friend.friendName}</strong>
                    <small style={{ color: colors.tertiary_text }}>
                      {friend.friendEmail}
                    </small>
                  </div>
                </td>
                <td>
                  <span
                    className={`status-badge ${friend.status?.toLowerCase()}`}
                  >
                    {friend.status}
                  </span>
                </td>
                <td>
                  <span
                    className={`access-badge ${friend.myAccessLevel?.toLowerCase()}`}
                  >
                    {friend.myAccessLevel}
                  </span>
                </td>
                <td>
                  <span
                    className={`access-badge ${friend.theirAccessLevel?.toLowerCase()}`}
                  >
                    {friend.theirAccessLevel}
                  </span>
                </td>
                <td style={{ color: colors.secondary_text }}>
                  {friend.connectedSince
                    ? new Date(friend.connectedSince).toLocaleDateString()
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const NoDataMessage = ({ colors }) => (
  <div className="no-data-message">
    <div className="no-data-icon">👥</div>
    <h3 style={{ color: colors.primary_text }}>No friendship data found</h3>
    <p style={{ color: colors.secondary_text }}>
      Add some friends to see your friendship analytics.
    </p>
  </div>
);

const FriendshipReport = () => {
  const navigate = useNavigate();
  const { colors, mode } = useTheme();
  const settings = useUserSettings();

  // Layout configuration for section customization
  const layoutConfig = useFriendshipReportLayout();

  // Check if all sections are hidden early
  const allSectionsHidden = layoutConfig.visibleSections.length === 0;

  // State for customization modal
  const [customizationOpen, setCustomizationOpen] = useState(false);

  // Use the filters hook
  const {
    friendshipReport,
    loading,
    error,
    timeframe,
    status,
    accessLevel,
    setTimeframe,
    setStatus,
    setAccessLevel,
    isFilterOpen,
    openFilters,
    closeFilters,
    applyFilters,
    resetFilters,
    fetchReport,
    filterValues,
    filtersActive,
    activeDateRange,
    setCustomDateRange,
    resetDateRange,
    isCustomRange,
  } = useFriendshipReportFilters();

  // COLORS for charts
  const COLORS = [
    "#14b8a6",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
    "#3b82f6",
    "#10b981",
  ];

  // Prepare chart data from report
  const accessLevelData = useMemo(() => {
    if (!friendshipReport?.accessLevelDistribution) return [];
    return [
      {
        name: "Full Access",
        value: friendshipReport.accessLevelDistribution.FULL || 0,
      },
      {
        name: "Write Access",
        value: friendshipReport.accessLevelDistribution.WRITE || 0,
      },
      {
        name: "Read Access",
        value: friendshipReport.accessLevelDistribution.READ || 0,
      },
      {
        name: "No Access",
        value: friendshipReport.accessLevelDistribution.NONE || 0,
      },
    ].filter((item) => item.value > 0);
  }, [friendshipReport]);

  const activityData = useMemo(() => {
    return friendshipReport?.monthlyActivity || [];
  }, [friendshipReport]);

  const sharingStatusData = useMemo(() => {
    return friendshipReport?.sharingStatus || [];
  }, [friendshipReport]);

  const topFriendsData = useMemo(() => {
    return friendshipReport?.topFriends || [];
  }, [friendshipReport]);

  const friendsTableData = useMemo(() => {
    return friendshipReport?.friendships || [];
  }, [friendshipReport]);

  // Overview cards data - extract from sharingStatus array
  const overviewCardsData = useMemo(() => {
    const sharingStatus = friendshipReport?.sharingStatus || [];

    // Helper to find value by name in sharingStatus array
    const getCountByName = (name) => {
      const item = sharingStatus.find((s) => s.name === name);
      return item?.count || 0;
    };

    return [
      {
        totalFriends: getCountByName("Total Friends"),
        pendingRequests: getCountByName("Pending Requests"),
        iSharedWithCount: getCountByName("I Shared With"),
        sharedWithMeCount: getCountByName("Shared With Me"),
      },
    ];
  }, [friendshipReport]);

  const handleBack = () => {
    navigate("/friends");
  };

  const handleExport = () => {
    console.log("Export CSV requested");
    // TODO: Implement CSV export
  };

  const handlePdfDownload = () => {
    console.log("Download PDF requested");
    // TODO: Implement PDF download
  };

  // Build filter sections for drawer
  const filterSections = useMemo(
    () => [
      {
        key: "timeframe",
        label: "Time Period",
        type: "select",
        options: FRIENDSHIP_TIMEFRAME_OPTIONS,
      },
      {
        key: "status",
        label: "Friendship Status",
        type: "select",
        options: FRIENDSHIP_STATUS_OPTIONS,
      },
      {
        key: "accessLevel",
        label: "Access Level",
        type: "select",
        options: ACCESS_LEVEL_OPTIONS,
      },
    ],
    []
  );

  const handleApplyFilters = useCallback(
    (newValues) => {
      applyFilters(newValues);
    },
    [applyFilters]
  );

  const handleResetFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  // Report actions menu configuration
  const reportHeaderActions = (
    <ReportActionsMenu
      menuItems={createDefaultReportMenuItems({
        onRefresh: fetchReport,
        onExport: handleExport,
        onPdf: handlePdfDownload,
        onCustomize: () => setCustomizationOpen(true),
        customizeLabel: "Customize Report",
      })}
    />
  );

  // If all sections hidden, show card immediately
  if (allSectionsHidden) {
    return (
      <div className={`friendship-report ${mode}`}>
        <ReportHeader
          title="👥 Friendship Report"
          subtitle="Analytics and insights about your connections"
          onBack={handleBack}
          rightActions={reportHeaderActions}
          showFilterButton={false}
        />
        <AllSectionsHiddenCard
          onCustomize={() => setCustomizationOpen(true)}
          reportName="Friendship Report"
        />
        <FriendshipReportCustomizationModal
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

  if (loading) {
    return (
      <LoadingSkeleton
        mode={mode}
        visibleSections={layoutConfig.visibleSections}
      />
    );
  }

  const totalFriends = friendshipReport?.totalFriends || 0;
  const pendingRequests = friendshipReport?.pendingRequests || 0;

  // Helper function to check if a section is visible
  const isSectionVisible = (sectionId) =>
    layoutConfig.visibleSections.some((s) => s.id === sectionId);

  return (
    <div className={`friendship-report ${mode}`}>
      <ReportHeader
        title="👥 Friendship Report"
        subtitle="Analytics and insights about your connections"
        onBack={handleBack}
        rightActions={reportHeaderActions}
        showFilterButton={true}
        onFilter={openFilters}
        isFilterActive={filtersActive}
        showExportButton={false}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        timeframeOptions={FRIENDSHIP_TIMEFRAME_OPTIONS}
        enableDateRangeBadge={true}
        isCustomRangeActive={isCustomRange}
        dateRangeProps={{
          fromDate: activeDateRange.fromDate,
          toDate: activeDateRange.toDate,
          onApply: setCustomDateRange,
          onReset: resetDateRange,
        }}
      />

      {/* Filter Drawer */}
      <ReportFilterDrawer
        open={isFilterOpen}
        onClose={closeFilters}
        sections={filterSections}
        values={filterValues}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {totalFriends === 0 && pendingRequests === 0 ? (
        <NoDataMessage colors={colors} />
      ) : (
        <>
          {/* Render ALL sections dynamically based on layoutConfig order */}
          {(() => {
            const result = [];
            let chartBuffer = [];
            const chartIds = [
              "access-level-chart",
              "activity-chart",
              "sharing-status-chart",
              "top-friends-chart",
            ];

            const flushChartBuffer = () => {
              if (chartBuffer.length > 0) {
                result.push(
                  <div
                    key={`chart-grid-${result.length}`}
                    className="chart-report-grid"
                  >
                    {chartBuffer}
                  </div>
                );
                chartBuffer = [];
              }
            };

            layoutConfig.visibleSections.forEach((section) => {
              if (section.id === "overview-cards") {
                flushChartBuffer();
                result.push(
                  <SharedOverviewCards
                    key={section.id}
                    data={overviewCardsData}
                    mode="friendship"
                  />
                );
              } else if (section.id === "friends-table") {
                flushChartBuffer();
                result.push(
                  <FriendsTable
                    key={section.id}
                    friends={friendsTableData}
                    colors={colors}
                  />
                );
              } else if (chartIds.includes(section.id)) {
                // Buffer chart sections to group them in a grid
                let chartComponent = null;
                switch (section.id) {
                  case "access-level-chart":
                    chartComponent =
                      accessLevelData.length > 0 ? (
                        <AccessLevelChart
                          key={section.id}
                          data={accessLevelData}
                          COLORS={COLORS}
                          colors={colors}
                        />
                      ) : null;
                    break;
                  case "activity-chart":
                    chartComponent =
                      activityData.length > 0 ? (
                        <FriendshipActivityChart
                          key={section.id}
                          data={activityData}
                          colors={colors}
                        />
                      ) : null;
                    break;
                  case "sharing-status-chart":
                    chartComponent =
                      sharingStatusData.length > 0 ? (
                        <SharingStatusChart
                          key={section.id}
                          data={sharingStatusData}
                          colors={colors}
                        />
                      ) : null;
                    break;
                  case "top-friends-chart":
                    chartComponent =
                      topFriendsData.length > 0 ? (
                        <TopFriendsChart
                          key={section.id}
                          data={topFriendsData}
                          colors={colors}
                        />
                      ) : null;
                    break;
                  default:
                    break;
                }
                if (chartComponent) {
                  chartBuffer.push(chartComponent);
                }
              }
            });

            // Flush any remaining charts
            flushChartBuffer();

            return result;
          })()}
        </>
      )}

      {/* Customization Modal */}
      <FriendshipReportCustomizationModal
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
};

export default FriendshipReport;
