import React from "react";
import {
  Button,
  IconButton,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import {
  AdminPanelContainer,
  AdminPageHeader,
  StatCard,
  SectionCard,
} from "./components";
import { getRoleColor } from "./utils/adminUtils";

const RoleManagement = () => {
  // Static roles data
  const roles = [
    {
      id: 1,
      name: "ADMIN",
      description: "Full system access with all permissions",
      userCount: 2,
      permissions: [
        "Manage Users",
        "Manage Roles",
        "View Analytics",
        "System Settings",
        "Audit Logs",
        "Delete Data",
      ],
      createdAt: "2023-01-01",
    },
    {
      id: 2,
      name: "MODERATOR",
      description: "Limited administrative access",
      userCount: 1,
      permissions: [
        "View Users",
        "Manage Content",
        "View Analytics",
        "Audit Logs",
      ],
      createdAt: "2023-01-01",
    },
    {
      id: 3,
      name: "USER",
      description: "Standard user with basic permissions",
      userCount: 97,
      permissions: [
        "Manage Own Expenses",
        "View Own Reports",
        "Manage Categories",
        "Manage Budgets",
      ],
      createdAt: "2023-01-01",
    },
    {
      id: 4,
      name: "VIEWER",
      description: "Read-only access to the system",
      userCount: 5,
      permissions: ["View Reports", "View Analytics"],
      createdAt: "2024-01-15",
    },
  ];

  const availablePermissions = [
    "Manage Users",
    "Manage Roles",
    "View Analytics",
    "System Settings",
    "Audit Logs",
    "Delete Data",
    "Manage Content",
    "View Users",
    "Manage Own Expenses",
    "View Own Reports",
    "Manage Categories",
    "Manage Budgets",
  ];

  return (
    <AdminPanelContainer>
      {/* Page Header */}
      <AdminPageHeader
        title="Role Management"
        description="Manage roles and permissions for the system"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            style={{
              backgroundColor: "#14b8a6",
              color: "#fff",
            }}
          >
            Create Role
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Roles" value={roles.length.toString()} />
        <StatCard
          label="System Admins"
          value={roles.find((r) => r.name === "ADMIN")?.userCount.toString() || "0"}
          color="#e91e63"
        />
        <StatCard
          label="Regular Users"
          value={roles.find((r) => r.name === "USER")?.userCount.toString() || "0"}
          color="#2196f3"
        />
        <StatCard
          label="Total Permissions"
          value={availablePermissions.length.toString()}
          color="#9c27b0"
        />
      </div>

      {/* Roles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {roles.map((role) => (
          <SectionCard key={role.id}>
            {/* Role Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold">{role.name}</h3>
                  <Chip
                    size="small"
                    label={`${role.userCount} users`}
                    icon={<PeopleIcon />}
                    style={{
                      backgroundColor: getRoleColor(role.name),
                      color: "#fff",
                    }}
                  />
                </div>
                <p className="text-sm mb-2 opacity-70">{role.description}</p>
                <p className="text-xs opacity-70">Created: {role.createdAt}</p>
              </div>
              <div className="flex gap-2">
                <IconButton size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  style={{ color: "#f44336" }}
                  disabled={role.name === "USER" || role.name === "ADMIN"}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <p className="text-sm font-semibold mb-3">
                Permissions ({role.permissions.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((permission, index) => (
                  <Chip
                    key={index}
                    label={permission}
                    size="small"
                    variant="outlined"
                    style={{
                      borderColor: getRoleColor(role.name),
                    }}
                  />
                ))}
              </div>
            </div>
          </SectionCard>
        ))}
      </div>

      {/* Available Permissions */}
      <SectionCard title="Available Permissions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availablePermissions.map((permission, index) => (
            <div
              key={index}
              className="p-3 rounded border border-gray-700 bg-gray-800"
            >
              <p className="text-sm font-medium">{permission}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </AdminPanelContainer>
  );
};

export default RoleManagement;
