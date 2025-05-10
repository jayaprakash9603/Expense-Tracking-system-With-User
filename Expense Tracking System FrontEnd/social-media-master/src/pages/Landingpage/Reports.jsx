import React, { useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ExpenseEmail from "./ExpenseEmail";
import ExpenseTableParent from "../ExpenseTableParent";
import ReportsGeneration from "../ReportsGeneration";
import SearchExpenses from "../SearchExpenses/SearchExpenses";
import SearchAudits from "../SearchAudits/SearchAudits";

// Sample data for different report types
const expenseReportData = [
  { id: 1, reportName: "Expense Report Q1 2025", date: "2025-03-15" },
  { id: 2, reportName: "Expense Report Q2 2025", date: "2025-06-20" },
  { id: 3, reportName: "Annual Expense Summary", date: "2025-01-10" },
  { id: 4, reportName: "Compliance Expense Report", date: "2025-02-28" },
  { id: 5, reportName: "Travel Expense Report", date: "2025-04-15" },
  { id: 6, reportName: "Project Expense Report", date: "2025-05-10" },
];

const searchAuditsData = [
  { id: 1, reportName: "Financial Audit Q1 2025", date: "2025-03-20" },
  { id: 2, reportName: "Compliance Audit 2025", date: "2025-04-10" },
  { id: 3, reportName: "Operational Audit Q2", date: "2025-06-25" },
  { id: 4, reportName: "Security Audit Annual", date: "2025-01-15" },
  { id: 5, reportName: "Quarterly Audit Review", date: "2025-05-15" },
  { id: 6, reportName: "Internal Audit Report", date: "2025-02-10" },
];

// Define columns for the DataGrid
const columns = [
  { field: "id", headerName: "S.No", width: 100 },
  { field: "reportName", headerName: "Report Name", width: 300 }, // Increased width
  { field: "date", headerName: "Date", width: 150 },
];

const Reports = () => {
  const [view, setView] = useState("email");
  const [selectedReport, setSelectedReport] = useState("select");
  const [Url, setUrl] = useState(null);

  const handleDropdownChange = (event) => {
    setSelectedReport(event.target.value);
    setUrl(null);
  };

  // Determine which data to display based on selected report
  const getReportData = () => {
    switch (selectedReport) {
      case "expenseReport":
        return expenseReportData;
      case "searchAudits":
        return searchAuditsData;
      default:
        return [];
    }
  };

  return (
    <Box sx={{ bgcolor: "#1b1b1b" }}>
      <Box
        sx={{
          width: "calc(100vw - 370px)",
          height: "50px",
          bgcolor: "#1b1b1b",
        }}
      />
      <Box
        sx={{
          width: "calc(100vw - 370px)",
          height: "calc(100vh - 100px)",
          bgcolor: "#0b0b0b",
          borderRadius: "8px",
          border: "1px solid #000",
          mr: "20px",
          p: 4,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", height: "100%", width: "100%" }}>
          <Box sx={{ width: "50%", pr: 2 }}>
            <FormControl fullWidth sx={{ mb: 4, maxWidth: 300 }}>
              <Select
                value={selectedReport}
                onChange={handleDropdownChange}
                sx={{
                  bgcolor: "#333333",
                  color: "#ffffff",
                  border: "1px solid #28282a",
                  "& .MuiSvgIcon-root": { color: "#ffffff" },
                  "&:hover": { bgcolor: "#444444" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#00dac6",
                  },
                }}
              >
                <MenuItem value="select">Select Report</MenuItem>
                <MenuItem value="expenseReport">Expense Report</MenuItem>
                <MenuItem value="searchAudits">Search Audits</MenuItem>
              </Select>
            </FormControl>
            <Box>
              {selectedReport === "select" && <></>}
              {selectedReport === "expenseReport" && <ExpenseEmail />}
              {/* {selectedReport === "searchAudits" && <E />} */}
            </Box>
          </Box>
          <Box sx={{ width: "50%", pl: 2 }}>
            {selectedReport !== "select" && (
              <DataGrid
                rows={getReportData()}
                columns={columns}
                pageSizeOptions={[5]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 5 } },
                }}
                disableColumnMenu
                sx={{
                  bgcolor: "#1b1b1b",
                  color: "#ffffff",
                  border: "1px solid #28282a",
                  "& .MuiDataGrid-columnHeaders": {
                    bgcolor: "#333333",
                    color: "#ffffff",
                  },
                  "& .MuiDataGrid-cell": {
                    color: "#ffffff",
                  },
                  "& .MuiDataGrid-row:hover": {
                    bgcolor: "#28282a",
                  },
                  "& .MuiDataGrid-footerContainer": {
                    bgcolor: "#333333",
                    color: "#ffffff",
                  },
                  "& .MuiTablePagination-root": {
                    color: "#ffffff",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "#ffffff",
                  },
                  // Set fixed height for 5 rows + header + pagination
                  height: 372, // 52px (header) + 5 * 52px (rows) + 40px (pagination)
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          width: "calc(100vw - 370px)",
          height: "50px",
          bgcolor: "#1b1b1b",
        }}
      />
    </Box>
  );
};

export default Reports;
