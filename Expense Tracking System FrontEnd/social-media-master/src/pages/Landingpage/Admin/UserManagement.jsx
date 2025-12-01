import React, { useState } from "react";
import { useSelector } from "react-redux";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { getThemeColors } from "../../../config/themeConfig";

const UserManagement = () => {
  const { mode } = useSelector((state) => state.theme || {});
  const themeColors = getThemeColors(mode);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Static user data
  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "USER",
      status: "active",
      joinDate: "2024-01-15",
      lastActive: "2 hours ago",
      totalExpenses: 1250.5,
      avatar: null,
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "ADMIN",
      status: "active",
      joinDate: "2024-01-10",
      lastActive: "5 minutes ago",
      totalExpenses: 2340.75,
      avatar: null,
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      role: "USER",
      status: "inactive",
      joinDate: "2024-01-05",
      lastActive: "1 week ago",
      totalExpenses: 890.25,
      avatar: null,
    },
    {
      id: 4,
      name: "Sarah Williams",
      email: "sarah.williams@example.com",
      role: "USER",
      status: "active",
      joinDate: "2023-12-20",
      lastActive: "1 day ago",
      totalExpenses: 3120.0,
      avatar: null,
    },
    {
      id: 5,
      name: "David Brown",
      email: "david.brown@example.com",
      role: "MODERATOR",
      status: "active",
      joinDate: "2023-11-15",
      lastActive: "3 hours ago",
      totalExpenses: 1890.5,
      avatar: null,
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#4caf50";
      case "inactive":
        return "#ff9800";
      case "suspended":
        return "#f44336";
      default:
        return "#757575";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "#e91e63";
      case "MODERATOR":
        return "#9c27b0";
      case "USER":
        return "#2196f3";
      default:
        return "#757575";
    }
  };

  return (
    <div
      className="p-6"
      style={{
        backgroundColor: themeColors.primary_bg,
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: themeColors.primary_text }}
        >
          User Management
        </h1>
        <p style={{ color: themeColors.secondary_text }}>
          Manage user accounts, roles, and permissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: themeColors.card_bg }}
        >
          <p
            className="text-sm mb-1"
            style={{ color: themeColors.secondary_text }}
          >
            Total Users
          </p>
          <p
            className="text-2xl font-bold"
            style={{ color: themeColors.primary_text }}
          >
            {users.length}
          </p>
        </div>
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: themeColors.card_bg }}
        >
          <p
            className="text-sm mb-1"
            style={{ color: themeColors.secondary_text }}
          >
            Active Users
          </p>
          <p className="text-2xl font-bold" style={{ color: "#4caf50" }}>
            {users.filter((u) => u.status === "active").length}
          </p>
        </div>
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: themeColors.card_bg }}
        >
          <p
            className="text-sm mb-1"
            style={{ color: themeColors.secondary_text }}
          >
            Admins
          </p>
          <p className="text-2xl font-bold" style={{ color: "#e91e63" }}>
            {users.filter((u) => u.role === "ADMIN").length}
          </p>
        </div>
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: themeColors.card_bg }}
        >
          <p
            className="text-sm mb-1"
            style={{ color: themeColors.secondary_text }}
          >
            New This Month
          </p>
          <p className="text-2xl font-bold" style={{ color: "#2196f3" }}>
            3
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div
        className="p-4 rounded-lg mb-6"
        style={{ backgroundColor: themeColors.card_bg }}
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <TextField
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            size="small"
            className="flex-1"
            InputProps={{
              startAdornment: <SearchIcon className="mr-2" />,
              style: {
                color: themeColors.primary_text,
                backgroundColor: themeColors.primary_bg,
              },
            }}
          />
          <FormControl size="small" style={{ minWidth: 150 }}>
            <InputLabel style={{ color: themeColors.secondary_text }}>
              Status
            </InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
              style={{
                color: themeColors.primary_text,
                backgroundColor: themeColors.primary_bg,
              }}
            >
              <MuiMenuItem value="all">All Status</MuiMenuItem>
              <MuiMenuItem value="active">Active</MuiMenuItem>
              <MuiMenuItem value="inactive">Inactive</MuiMenuItem>
              <MuiMenuItem value="suspended">Suspended</MuiMenuItem>
            </Select>
          </FormControl>
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
        </div>
      </div>

      {/* Users Table */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ backgroundColor: themeColors.card_bg }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: themeColors.primary_bg }}>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold"
                  style={{ color: themeColors.primary_text }}
                >
                  User
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold"
                  style={{ color: themeColors.primary_text }}
                >
                  Role
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold"
                  style={{ color: themeColors.primary_text }}
                >
                  Status
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold"
                  style={{ color: themeColors.primary_text }}
                >
                  Join Date
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold"
                  style={{ color: themeColors.primary_text }}
                >
                  Last Active
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold"
                  style={{ color: themeColors.primary_text }}
                >
                  Total Expenses
                </th>
                <th
                  className="px-6 py-4 text-right text-sm font-semibold"
                  style={{ color: themeColors.primary_text }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr
                  key={user.id}
                  style={{
                    borderTop: `1px solid ${themeColors.border}`,
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        sx={{
                          bgcolor: "#14b8a6",
                          width: 40,
                          height: 40,
                        }}
                      >
                        {user.name.charAt(0)}
                      </Avatar>
                      <div>
                        <p
                          className="font-medium"
                          style={{ color: themeColors.primary_text }}
                        >
                          {user.name}
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: themeColors.secondary_text }}
                        >
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Chip
                      label={user.role}
                      size="small"
                      style={{
                        backgroundColor: getRoleColor(user.role),
                        color: "#fff",
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Chip
                      label={user.status}
                      size="small"
                      style={{
                        backgroundColor: getStatusColor(user.status),
                        color: "#fff",
                      }}
                    />
                  </td>
                  <td
                    className="px-6 py-4 text-sm"
                    style={{ color: themeColors.secondary_text }}
                  >
                    {user.joinDate}
                  </td>
                  <td
                    className="px-6 py-4 text-sm"
                    style={{ color: themeColors.secondary_text }}
                  >
                    {user.lastActive}
                  </td>
                  <td
                    className="px-6 py-4 text-sm font-medium"
                    style={{ color: themeColors.primary_text }}
                  >
                    ${user.totalExpenses.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                      <IconButton
                        size="small"
                        style={{ color: themeColors.primary_text }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        style={{ color: "#f44336" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        style={{ color: themeColors.primary_text }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
