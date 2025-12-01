import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Button,
  IconButton,
  TextField,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import { getThemeColors } from "../../../config/themeConfig";

const RoleManagement = () => {
  const { mode } = useSelector((state) => state.theme || {});
  const themeColors = getThemeColors(mode);

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

  const getRoleColor = (roleName) => {
    switch (roleName) {
      case "ADMIN":
        return "#e91e63";
      case "MODERATOR":
        return "#9c27b0";
      case "USER":
        return "#2196f3";
      case "VIEWER":
        return "#ff9800";
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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: themeColors.primary_text }}
          >
            Role Management
          </h1>
          <p style={{ color: themeColors.secondary_text }}>
            Define and manage user roles and permissions
          </p>
        </div>
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
            Total Roles
          </p>
          <p
            className="text-2xl font-bold"
            style={{ color: themeColors.primary_text }}
          >
            {roles.length}
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
            Custom Roles
          </p>
          <p className="text-2xl font-bold" style={{ color: "#9c27b0" }}>
            1
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
            Total Users
          </p>
          <p className="text-2xl font-bold" style={{ color: "#2196f3" }}>
            {roles.reduce((sum, role) => sum + role.userCount, 0)}
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
            Permissions
          </p>
          <p className="text-2xl font-bold" style={{ color: "#4caf50" }}>
            12
          </p>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className="p-6 rounded-lg"
            style={{ backgroundColor: themeColors.card_bg }}
          >
            {/* Role Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3
                    className="text-xl font-bold"
                    style={{ color: themeColors.primary_text }}
                  >
                    {role.name}
                  </h3>
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
                <p
                  className="text-sm mb-2"
                  style={{ color: themeColors.secondary_text }}
                >
                  {role.description}
                </p>
                <p
                  className="text-xs"
                  style={{ color: themeColors.secondary_text }}
                >
                  Created: {role.createdAt}
                </p>
              </div>
              <div className="flex gap-2">
                <IconButton
                  size="small"
                  style={{ color: themeColors.primary_text }}
                >
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
              <p
                className="text-sm font-semibold mb-3"
                style={{ color: themeColors.primary_text }}
              >
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
                      color: themeColors.primary_text,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Available Permissions */}
      <div
        className="mt-6 p-6 rounded-lg"
        style={{ backgroundColor: themeColors.card_bg }}
      >
        <h3
          className="text-xl font-bold mb-4"
          style={{ color: themeColors.primary_text }}
        >
          Available Permissions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
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
          ].map((permission, index) => (
            <div
              key={index}
              className="p-3 rounded border"
              style={{
                borderColor: themeColors.border,
                backgroundColor: themeColors.primary_bg,
              }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: themeColors.primary_text }}
              >
                {permission}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
