import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ExpenseEmail from "./ExpenseEmail";
import ExpenseTableParent from "../ExpenseTableParent";
import ReportsGeneration from "../ReportsGeneration";
import SearchExpenses from "../SearchExpenses/SearchExpenses";
import SearchAudits from "../SearchAudits/SearchAudits";
import { useNavigate, useParams } from "react-router";

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

const defaultColumns = [
  { field: "id", headerName: "S.No", width: 100 },
  { field: "reportName", headerName: "Report Name", width: 300 },
  { field: "date", headerName: "Date", width: 150 },
];

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState("select");
  const [Url, setUrl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { friendId } = useParams();

  const handleDropdownChange = (event) => {
    setSelectedReport(event.target.value);
    setUrl(null);
  };

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

  // Adjust columns for mobile by removing the "id" column and reducing column widths
  const mobileColumns = defaultColumns
    .filter((col) => col.field !== "id")
    .map((col) => {
      if (col.field === "reportName") {
        return { ...col, width: 200 };
      } else if (col.field === "date") {
        return { ...col, width: 100 };
      }
      return col;
    });

  const columnsToUse = isMobile ? mobileColumns : defaultColumns;

  return (
    <Box sx={{ bgcolor: "#1b1b1b" }}>
      <Box
        sx={{
          width: isMobile ? "100%" : "calc(100vw - 370px)",
          height: "50px",
          bgcolor: "#1b1b1b",
        }}
      />

      <Box
        sx={{
          width: isMobile ? "100%" : "calc(100vw - 370px)",
          height: isMobile ? "auto" : "calc(100vh - 100px)",
          bgcolor: "#0b0b0b",
          borderRadius: "8px",
          border: "1px solid #000",
          mr: isMobile ? 0 : "20px",
          p: 4,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <Box sx={{ width: isMobile ? "100%" : "50%", pr: isMobile ? 0 : 2 }}>
          <IconButton
            sx={{
              color: "#00DAC6",
              backgroundColor: "#1b1b1b",
              "&:hover": {
                backgroundColor: "#28282a",
              },
              zIndex: 10,
            }}
            onClick={() =>
              friendId && friendId !== "undefined"
                ? navigate(`/friends/expenses/${friendId}`)
                : navigate("/expenses")
            }
            aria-label="Back"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="#00DAC6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </IconButton>
          <FormControl
            fullWidth
            sx={{ mb: 6, ml: 10, maxWidth: isMobile ? "100%" : 300 }} // Moved dropdown slightly down
          >
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
          </Box>
        </Box>
        <Box
          sx={{
            width: isMobile ? "100%" : "50%",
            pl: isMobile ? 0 : 2,
            mt: isMobile ? 4 : 0,
          }}
        >
          {selectedReport !== "select" && (
            <>
              {/* Expense Details Table */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" sx={{ color: "#ffffff" }}>
                  Expense Details
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    bgcolor: "#00dac6",
                    color: "#000",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={require("../../assests/download.png")}
                    alt="Download Icon"
                    style={{ width: 24, height: 24, marginRight: 8 }} // Adjusted width and height
                  />
                </Button>
              </Box>
              <DataGrid
                rows={getReportData()} // Replace with API data later
                columns={columnsToUse}
                pageSizeOptions={[5]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 5 } },
                }}
                disableColumnMenu
                rowHeight={40} // Decreased row height
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
                  height: isMobile ? 300 : 320, // Adjusted table height
                }}
              />

              {/* Reports History Table */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                  mt: 4,
                }}
              >
                <Typography variant="h6" sx={{ color: "#ffffff" }}>
                  Reports History
                </Typography>
              </Box>
              <DataGrid
                rows={getReportData()} // Replace with API data later
                columns={columnsToUse}
                pageSizeOptions={[5]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 5 } },
                }}
                disableColumnMenu
                rowHeight={40} // Decreased row height
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
                  height: isMobile ? 300 : 320, // Adjusted table height
                }}
              />
            </>
          )}
        </Box>
      </Box>
      <Box
        sx={{
          width: isMobile ? "100%" : "calc(100vw - 370px)",
          height: "50px",
          bgcolor: "#1b1b1b",
        }}
      />
    </Box>
  );
};

export default Reports;
