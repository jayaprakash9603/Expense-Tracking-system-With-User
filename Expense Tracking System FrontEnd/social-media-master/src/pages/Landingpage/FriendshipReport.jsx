import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useNavigate } from "react-router-dom";
import useUserSettings from "../../hooks/useUserSettings";
import { useTheme } from "../../hooks/useTheme";
import ReportHeader from "../../components/ReportHeader";
import SharedOverviewCards from "../../components/charts/SharedOverviewCards";
import {
  fetchFriends,
  fetchFriendRequests,
  fetchISharedWith,
  fetchSharedWithMe,
} from "../../Redux/Friends/friendsActions";

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

const LoadingSkeleton = ({ mode }) => (
  <div className={`friendship-report skeleton-mode ${mode}`}>
    <div className="friendship-report-header">
      <div className="header-left">
        <div className="skeleton-back-btn" />
        <div className="skeleton-title large" />
        <div className="skeleton-subtitle" />
      </div>
    </div>

    <div className="overview-cards-skeleton">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="overview-card-skeleton">
          <div className="skeleton-icon" />
          <div className="skeleton-content">
            <div className="skeleton-text" />
            <div className="skeleton-number" />
            <div className="skeleton-subtext" />
          </div>
        </div>
      ))}
    </div>

    <div className="chart-report-grid">
      <div className="chart-container chart-half-width">
        <div className="skeleton-title" />
        <BarChartSkeletonInner mode={mode} />
      </div>
      <div className="chart-container chart-half-width">
        <div className="skeleton-title" />
        <PieChartSkeletonInner mode={mode} />
      </div>
      <div className="chart-container chart-half-width">
        <div className="skeleton-title" />
        <RadialChartSkeletonInner mode={mode} />
      </div>
      <div className="chart-container chart-half-width">
        <div className="skeleton-title" />
        <BarChartSkeletonInner mode={mode} />
      </div>
    </div>
  </div>
);

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
          dataKey="interactions"
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
                    <strong>{friend.name}</strong>
                    <small style={{ color: colors.tertiary_text }}>
                      {friend.email}
                    </small>
                  </div>
                </td>
                <td>
                  <span
                    className={`status-badge ${friend.status.toLowerCase()}`}
                  >
                    {friend.status}
                  </span>
                </td>
                <td>
                  <span
                    className={`access-badge ${friend.myAccess.toLowerCase()}`}
                  >
                    {friend.myAccess}
                  </span>
                </td>
                <td>
                  <span
                    className={`access-badge ${friend.theirAccess.toLowerCase()}`}
                  >
                    {friend.theirAccess}
                  </span>
                </td>
                <td style={{ color: colors.secondary_text }}>
                  {friend.connectedSince}
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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { colors, mode } = useTheme();
  const settings = useUserSettings();

  const [reportActionAnchorEl, setReportActionAnchorEl] = useState(null);

  // Get data from Redux store
  const {
    friends = [],
    loadingFriends = false,
    friendRequests = [],
    loadingRequests = false,
    iSharedWith = [],
    loadingISharedWith = false,
    sharedWithMe = [],
    loadingSharedWithMe = false,
  } = useSelector((state) => state.friends || {});

  const user = useSelector((state) => state.auth.user);
  const token = localStorage.getItem("jwt");

  // Fetch data on mount
  useEffect(() => {
    if (token) {
      dispatch(fetchFriends(token));
      dispatch(fetchFriendRequests(token));
      dispatch(fetchISharedWith(token));
      dispatch(fetchSharedWithMe(token));
    }
  }, [dispatch, token]);

  const loading =
    loadingFriends ||
    loadingRequests ||
    loadingISharedWith ||
    loadingSharedWithMe;

  // COLORS for charts
  const COLORS = [
    "#14b8a6",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
    "#3b82f6",
    "#10b981",
  ];

  // Compute analytics from real data
  const analytics = useMemo(() => {
    const totalFriends = friends.length;
    const pendingRequests = friendRequests.length;
    const sharedWithMeCount = sharedWithMe.length;
    const iSharedWithCount = iSharedWith.length;

    // Count access levels from friends
    const accessLevelCounts = {
      FULL: 0,
      WRITE: 0,
      READ: 0,
      NONE: 0,
    };

    friends.forEach((friendship) => {
      const myAccess = friendship.recipientAccess || "NONE";
      if (accessLevelCounts[myAccess] !== undefined) {
        accessLevelCounts[myAccess]++;
      }
    });

    return {
      totalFriends,
      pendingRequests,
      sharedWithMeCount,
      iSharedWithCount,
      accessLevelCounts,
    };
  }, [friends, friendRequests, sharedWithMe, iSharedWith]);

  // Prepare chart data
  const accessLevelData = useMemo(
    () =>
      [
        { name: "Full Access", value: analytics.accessLevelCounts.FULL },
        { name: "Write Access", value: analytics.accessLevelCounts.WRITE },
        { name: "Read Access", value: analytics.accessLevelCounts.READ },
        { name: "No Access", value: analytics.accessLevelCounts.NONE },
      ].filter((item) => item.value > 0),
    [analytics]
  );

  // Dummy activity data (will be replaced with real API data later)
  const activityData = useMemo(
    () => [
      { month: "Aug", newFriends: 2, requestsSent: 3, requestsReceived: 1 },
      { month: "Sep", newFriends: 1, requestsSent: 2, requestsReceived: 2 },
      { month: "Oct", newFriends: 3, requestsSent: 4, requestsReceived: 3 },
      { month: "Nov", newFriends: 2, requestsSent: 1, requestsReceived: 2 },
      { month: "Dec", newFriends: 4, requestsSent: 5, requestsReceived: 4 },
      {
        month: "Jan",
        newFriends: analytics.totalFriends > 0 ? 1 : 0,
        requestsSent: analytics.pendingRequests,
        requestsReceived: 2,
      },
    ],
    [analytics]
  );

  const sharingStatusData = useMemo(
    () => [
      { name: "I Shared With", count: analytics.iSharedWithCount },
      { name: "Shared With Me", count: analytics.sharedWithMeCount },
      { name: "Pending Requests", count: analytics.pendingRequests },
      { name: "Total Friends", count: analytics.totalFriends },
    ],
    [analytics]
  );

  // Top friends data (dummy for now)
  const topFriendsData = useMemo(() => {
    return friends.slice(0, 5).map((friendship, index) => {
      const friend = friendship.recipient || friendship.requester || {};
      return {
        name: `${friend.firstName || "Friend"} ${
          friend.lastName || index + 1
        }`.substring(0, 12),
        interactions: Math.floor(Math.random() * 50) + 10,
        fill: COLORS[index % COLORS.length],
      };
    });
  }, [friends]);

  // Friends table data
  const friendsTableData = useMemo(() => {
    return friends.map((friendship) => {
      const friend = friendship.recipient || friendship.requester || {};
      return {
        id: friendship.id,
        name: `${friend.firstName || "Unknown"} ${friend.lastName || ""}`,
        email: friend.email || "N/A",
        status: friendship.status || "ACCEPTED",
        myAccess: friendship.recipientAccess || "NONE",
        theirAccess: friendship.requesterAccess || "NONE",
        connectedSince: friendship.createdAt
          ? new Date(friendship.createdAt).toLocaleDateString()
          : "N/A",
      };
    });
  }, [friends]);

  const handleBack = () => {
    navigate("/friends");
  };

  const handleReportActionClick = (event) => {
    setReportActionAnchorEl(event.currentTarget);
  };

  const handleReportActionClose = () => {
    setReportActionAnchorEl(null);
  };

  const handleReportMenuItemClick = (action) => {
    if (action === "refresh") {
      if (token) {
        dispatch(fetchFriends(token));
        dispatch(fetchFriendRequests(token));
        dispatch(fetchISharedWith(token));
        dispatch(fetchSharedWithMe(token));
      }
    } else if (action === "export") {
      console.log("Export CSV requested");
    } else if (action === "pdf") {
      console.log("Download PDF requested");
    }
    handleReportActionClose();
  };

  // Prepare overview cards data for SharedOverviewCards component
  const overviewCardsData = useMemo(
    () => [
      {
        totalFriends: analytics.totalFriends,
        pendingRequests: analytics.pendingRequests,
        iSharedWithCount: analytics.iSharedWithCount,
        sharedWithMeCount: analytics.sharedWithMeCount,
      },
    ],
    [analytics]
  );

  if (loading) {
    return <LoadingSkeleton mode={mode} />;
  }

  const reportHeaderActions = (
    <>
      <IconButton
        onClick={handleReportActionClick}
        sx={{ color: colors.secondary_accent }}
        size="small"
        aria-label="More actions"
      >
        <MoreVertIcon />
      </IconButton>
      {Boolean(reportActionAnchorEl) && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={handleReportActionClose}
          />
          <div
            style={{
              position: "fixed",
              top:
                reportActionAnchorEl?.getBoundingClientRect().bottom + 6 || 0,
              left:
                reportActionAnchorEl?.getBoundingClientRect().left - 100 || 0,
              backgroundColor: colors.primary_bg,
              border: `1px solid ${colors.primary_accent}`,
              borderRadius: "8px",
              boxShadow: `0 4px 20px rgba(0,0,0,${
                mode === "dark" ? 0.3 : 0.15
              })`,
              zIndex: 1000,
              minWidth: "160px",
            }}
          >
            <div style={{ padding: "8px 0" }}>
              <div
                onClick={() => handleReportMenuItemClick("refresh")}
                style={{
                  color: colors.primary_text,
                  padding: "10px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = colors.hover_bg)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <span style={{ marginRight: 10 }}>🔄</span>
                <span style={{ fontSize: 14 }}>Refresh</span>
              </div>
              <div
                onClick={() => handleReportMenuItemClick("export")}
                style={{
                  color: colors.primary_text,
                  padding: "10px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = colors.hover_bg)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <span style={{ marginRight: 10 }}>📤</span>
                <span style={{ fontSize: 14 }}>Export CSV</span>
              </div>
              <div
                onClick={() => handleReportMenuItemClick("pdf")}
                style={{
                  color: colors.primary_text,
                  padding: "10px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = colors.hover_bg)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <span style={{ marginRight: 10 }}>📥</span>
                <span style={{ fontSize: 14 }}>Download PDF</span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );

  return (
    <div className={`friendship-report ${mode}`}>
      <ReportHeader
        title="👥 Friendship Report"
        subtitle="Analytics and insights about your connections"
        onBack={handleBack}
        rightActions={reportHeaderActions}
        showFilterButton={false}
        showExportButton={false}
      />

      {/* Overview Cards */}
      <SharedOverviewCards data={overviewCardsData} mode="friendship" />

      {analytics.totalFriends === 0 && analytics.pendingRequests === 0 ? (
        <NoDataMessage colors={colors} />
      ) : (
        <>
          <div className="chart-report-grid">
            {accessLevelData.length > 0 && (
              <AccessLevelChart
                data={accessLevelData}
                COLORS={COLORS}
                colors={colors}
              />
            )}
            <FriendshipActivityChart data={activityData} colors={colors} />
            <SharingStatusChart data={sharingStatusData} colors={colors} />
            {topFriendsData.length > 0 && (
              <TopFriendsChart data={topFriendsData} colors={colors} />
            )}
          </div>

          <FriendsTable friends={friendsTableData} colors={colors} />
        </>
      )}
    </div>
  );
};

export default FriendshipReport;
