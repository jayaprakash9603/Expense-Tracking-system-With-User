import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../../hooks/useTranslation";
import { useStandardExpenseColumns } from "../../../hooks/useStandardExpenseColumns";
import GroupedDataTable from "../GroupedDataTable/GroupedDataTable";

/**
 * Reusable table component for displaying lists of expenses.
 * Uses standard columns definition and consistent styling.
 */
export const ExpenseListTable = ({
  rows = [],
  loading = false,
  error = null,
  showNet = false,
  showCredit = false,
  ...props
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const columns = useStandardExpenseColumns(t, navigate, {
    includeNet: showNet,
    includeCredit: showCredit,
    // Add other options here as needed
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="loader w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <GroupedDataTable
      rows={rows}
      columns={columns}
      activeTab="all" // Default to showing all
      enableSelection={false} // Default to read-only list
      {...props}
    />
  );
};

export default ExpenseListTable;
