import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CircularProgress, Box, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Close as CloseIcon } from "@mui/icons-material";
import { getListOfBudgetsById } from "../../../Redux/Budget/budget.action";

const BudgetTable = ({
  billData,
  selectedBudgets,
  setSelectedBudgets,
  onClose,
  friendId,
}) => {
  const dispatch = useDispatch();
  const {
    budgets,
    error: budgetError,
    loading: budgetLoading,
  } = useSelector((state) => state.budgets || {});

  const [checkboxStates, setCheckboxStates] = useState([]);

  // Update checkbox states when budgets change
  useEffect(() => {
    setCheckboxStates(budgets.map((budget) => budget.includeInBudget || false));
  }, [budgets]);

  // Update selected budgets when checkbox states change
  useEffect(() => {
    const selected = budgets.filter((_, index) => checkboxStates[index]);
    setSelectedBudgets(selected);
  }, [checkboxStates, budgets, setSelectedBudgets]);

  // Fetch budgets when date changes
  useEffect(() => {
    if (billData.date) {
      dispatch(getListOfBudgetsById(billData.date, friendId || ""));
    }
  }, [dispatch, billData.date, friendId]);

  // DataGrid columns for budgets
  const dataGridColumns = [
    { field: "name", headerName: "Name", flex: 1, minWidth: 120 },
    { field: "description", headerName: "Description", flex: 1, minWidth: 120 },
    { field: "startDate", headerName: "Start Date", flex: 1, minWidth: 100 },
    { field: "endDate", headerName: "End Date", flex: 1, minWidth: 100 },
    {
      field: "remainingAmount",
      headerName: "Remaining Amount",
      flex: 1,
      minWidth: 120,
    },
    { field: "amount", headerName: "Amount", flex: 1, minWidth: 100 },
  ];

  // DataGrid rows for budgets
  const dataGridRows = Array.isArray(budgets)
    ? budgets.map((item, index) => ({
        ...item,
        id: item.id ?? `temp-${index}-${Date.now()}`,
      }))
    : [];

  // Map checkboxStates to DataGrid selection model
  const selectedIds = dataGridRows
    .filter((_, idx) => checkboxStates[idx])
    .map((row) => row.id);

  const handleDataGridSelection = (newSelection) => {
    // Map DataGrid selection to checkboxStates
    const newCheckboxStates = dataGridRows.map((row) =>
      newSelection.includes(row.id)
    );
    setCheckboxStates(newCheckboxStates);
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-xl font-semibold">
          Available Budgets for Selected Date
        </h3>
        <IconButton
          onClick={onClose}
          sx={{
            color: "#ff4444",
            "&:hover": {
              backgroundColor: "#ff444420",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </div>

      {budgetError && (
        <div className="text-red-500 text-sm mb-4">
          Error: {budgetError.message || "Failed to load budgets."}
        </div>
      )}

      {budgetLoading ? (
        <div className="flex justify-center items-center py-8">
          <CircularProgress sx={{ color: "#00DAC6" }} />
        </div>
      ) : budgets.length === 0 ? (
        <div className="text-center text-gray-400 py-8 bg-[#29282b] rounded border border-gray-600">
          No budgets found for the selected date
        </div>
      ) : (
        <Box
          sx={{
            height: 325,
            width: "100%",
            background: "#29282b",
            borderRadius: 2,
            border: "1px solid #444",
          }}
        >
          <DataGrid
            rows={dataGridRows}
            columns={dataGridColumns}
            getRowId={(row) => row.id}
            checkboxSelection
            disableRowSelectionOnClick
            selectionModel={selectedIds}
            onRowSelectionModelChange={handleDataGridSelection}
            pageSizeOptions={[5, 10, 20]}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            rowHeight={42}
            headerHeight={32}
            sx={{
              color: "#fff",
              border: 0,
              "& .MuiDataGrid-columnHeaders": { background: "#222" },
              "& .MuiDataGrid-row": { background: "#29282b" },
              "& .MuiCheckbox-root": { color: "#00dac6 !important" },
              fontSize: "0.92rem",
            }}
          />
        </Box>
      )}
    </div>
  );
};

export default BudgetTable;
