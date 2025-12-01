import React, { useState } from "react";
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
import {
  AdminPanelContainer,
  AdminPageHeader,
  StatCard,
  SectionCard,
} from "./components";
import {
  formatCurrency,
  getStatusColor,
  getRoleColor,
  getInitials,
} from "./utils/adminUtils";

const UserManagement = () => {
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

  return (
    <AdminPanelContainer>
      {/* Page Header */}
      <AdminPageHeader
        title="User Management"
        description="Manage user accounts, roles, and permissions"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users" value={users.length.toString()} />
        <StatCard
          label="Active Users"
          value={users.filter((u) => u.status === "active").length.toString()}
          color="#4caf50"
        />
        <StatCard
          label="Admins"
          value={users.filter((u) => u.role === "ADMIN").length.toString()}
          color="#e91e63"
        />
        <StatCard label="New This Month" value="3" color="#2196f3" />
      </div>

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
            onChange={(e) => setSearchQuery(e.target.value)}
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
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
            >
              <MuiMenuItem value="all">All Status</MuiMenuItem>
              <MuiMenuItem value="active">Active</MuiMenuItem>
              <MuiMenuItem value="inactive">Inactive</MuiMenuItem>
              <MuiMenuItem value="suspended">Suspended</MuiMenuItem>
            </Select>
          </FormControl>
        </div>
      </SectionCard>

      {/* Users Table */}
      <SectionCard title="Users" className="mt-6">
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
                        sx={{
                          bgcolor: "#14b8a6",
                          width: 40,
                          height: 40,
                        }}
                      >
                        {getInitials(user.name)}
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm opacity-70">{user.email}</p>
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
                  <td className="px-6 py-4 text-sm opacity-70">
                    {user.joinDate}
                  </td>
                  <td className="px-6 py-4 text-sm opacity-70">
                    {user.lastActive}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {formatCurrency(user.totalExpenses)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" style={{ color: "#f44336" }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </AdminPanelContainer>
  );
};

export default UserManagement;
