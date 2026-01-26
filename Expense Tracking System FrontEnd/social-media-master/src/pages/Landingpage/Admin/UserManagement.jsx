import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Chip,
  IconButton,
  TextField,
  Button,
  MenuItem as MuiMenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BlockIcon from "@mui/icons-material/Block";
import { AdminPanelContainer, SectionCard } from "./components";
import ReportHeader from "../../../components/ReportHeader";
import SharedOverviewCards from "../../../components/charts/SharedOverviewCards";
import {
  formatCurrency,
  getStatusColor,
  getRoleColor,
  getInitials,
} from "./utils/adminUtils";
import {
  fetchAllUsers,
  deleteUser,
  updateUserStatus,
  fetchUserStats,
} from "../../../Redux/Admin/admin.action";

const UserManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Safely access admin state with fallbacks
  const adminState = useSelector((state) => state.admin) || {};
  const users = adminState.users || {
    list: [],
    totalCount: 0,
    page: 0,
    loading: false,
    error: null,
  };
  const userStats = adminState.userStats || {
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
    newThisMonth: 0,
    loading: false,
  };
  const loading = users.loading || userStats.loading || false;
  const error = users.error || userStats.error || null;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch users when component mounts or filters change
  useEffect(() => {
    dispatch(
      fetchAllUsers({
        page: currentPage - 1,
        size: pageSize,
        status: filterStatus !== "all" ? filterStatus : null,
        role: filterRole !== "ALL" ? filterRole : null,
        search: searchQuery || null,
      }),
    );
  }, [dispatch, currentPage, filterStatus, filterRole, searchQuery]);

  // Fetch user stats on mount
  useEffect(() => {
    dispatch(fetchUserStats());
  }, [dispatch]);

  const handleDeleteUser = useCallback(
    (userId) => {
      if (window.confirm("Are you sure you want to delete this user?")) {
        dispatch(deleteUser(userId));
      }
    },
    [dispatch],
  );

  const handleSuspendUser = useCallback(
    (userId) => {
      if (window.confirm("Are you sure you want to suspend this user?")) {
        dispatch(updateUserStatus(userId, "suspended"));
      }
    },
    [dispatch],
  );

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (e) => {
    setFilterRole(e.target.value);
    setCurrentPage(1);
  };

  // Use real data from Redux, with fallbacks
  const userList = users.list || [];
  const totalCount = users.totalCount || 0;
  const totalPages = users.totalPages || 1;

  // User stats from API
  const stats = {
    total: userStats?.total || totalCount,
    active: userStats?.active || 0,
    admins: userStats?.byRole?.ADMIN || 0,
    newThisMonth: userStats?.newThisMonth || 0,
  };

  const filteredUsers = userList;

  // Prepare data for SharedOverviewCards
  const overviewData = [
    {
      totalUsers: stats.total,
      activeUsers: stats.active,
      admins: stats.admins,
      newThisMonth: stats.newThisMonth,
    },
  ];

  const [flowType, setFlowType] = useState("all");

  const handleExport = () => {
    console.log("Exporting user data...");
  };

  return (
    <AdminPanelContainer>
      {/* Report Header */}
      <ReportHeader
        title="User Management"
        subtitle="Manage user accounts, roles, and permissions"
        timeframe="all"
        flowType={flowType}
        onFlowTypeChange={setFlowType}
        onExport={handleExport}
        showFilterButton={false}
        timeframeOptions={[{ value: "all", label: "All Time" }]}
        showBackButton={false}
        stickyBackground="inherit"
      />

      {/* Stats Cards using SharedOverviewCards */}
      <SharedOverviewCards data={overviewData} mode="admin-users" />

      {/* Search and Filter Section */}
      <SectionCard
        title="Search & Filter"
        actions={
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            style={{
              backgroundColor: "#14b8a6",
              color: "#fff",
            }}
          >
            Add User
          </Button>
        }
      >
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <TextField
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            className="flex-1"
            InputProps={{
              startAdornment: <SearchIcon className="mr-2" />,
            }}
          />
          <FormControl size="small" style={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={handleStatusFilterChange}
              label="Status"
            >
              <MuiMenuItem value="all">All Status</MuiMenuItem>
              <MuiMenuItem value="active">Active</MuiMenuItem>
              <MuiMenuItem value="inactive">Inactive</MuiMenuItem>
              <MuiMenuItem value="suspended">Suspended</MuiMenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" style={{ minWidth: 150 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={filterRole}
              onChange={handleRoleFilterChange}
              label="Role"
            >
              <MuiMenuItem value="ALL">All Roles</MuiMenuItem>
              <MuiMenuItem value="ADMIN">Admin</MuiMenuItem>
              <MuiMenuItem value="USER">User</MuiMenuItem>
            </Select>
          </FormControl>
        </div>
      </SectionCard>

      {/* Users Table */}
      <SectionCard title={`Users (${totalCount})`} className="mt-6">
        {loading.users && (
          <div className="flex justify-center p-4">
            <CircularProgress />
          </div>
        )}

        {error && (
          <div className="text-red-500 p-4 text-center">
            Error loading users: {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Join Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Last Active
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Total Expenses
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={user.profileImage}
                        sx={{
                          bgcolor: "#14b8a6",
                          width: 40,
                          height: 40,
                        }}
                      >
                        {getInitials(user.fullName || user.name || user.email)}
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.fullName || user.name || "Unknown"}
                        </p>
                        <p className="text-sm opacity-70">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Chip
                      label={
                        user.roles
                          ? user.roles
                              .map((r) => r.replace("ROLE_", ""))
                              .join(", ")
                          : user.role || "USER"
                      }
                      size="small"
                      style={{
                        backgroundColor: getRoleColor(
                          user.roles
                            ? user.roles[0]?.replace("ROLE_", "")
                            : user.role,
                        ),
                        color: "#fff",
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Chip
                      label={user.status || "active"}
                      size="small"
                      style={{
                        backgroundColor: getStatusColor(
                          user.status || "active",
                        ),
                        color: "#fff",
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm opacity-70">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : user.joinDate || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm opacity-70">
                    {user.updatedAt
                      ? new Date(user.updatedAt).toLocaleDateString()
                      : user.lastActive || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {formatCurrency(user.totalExpenses || 0)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                      <IconButton size="small" title="Edit User">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        style={{ color: "#ff9800" }}
                        title="Suspend User"
                        onClick={() => handleSuspendUser(user.id)}
                      >
                        <BlockIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        style={{ color: "#f44336" }}
                        title="Delete User"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && !loading.users && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center opacity-70">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center p-4">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </div>
      </SectionCard>
    </AdminPanelContainer>
  );
};

export default UserManagement;
