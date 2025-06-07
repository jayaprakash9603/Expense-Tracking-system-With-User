import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Sector,
} from "recharts";
import { fetchCategoriesWithExpenses } from "../../Redux/Expenses/expense.action";
import dayjs from "dayjs";
import {
  IconButton,
  Skeleton,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Fab,
} from "@mui/material";
import { CreateCategory } from "../../components/Category";
import FilterListIcon from "@mui/icons-material/FilterList";
import { createPortal } from "react-dom";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import recentPng from "../../assests/recent.png";
import { useNavigate, useLocation } from "react-router-dom";
import ToastNotification from "./ToastNotification";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import SortIcon from "@mui/icons-material/Sort";
import AddIcon from "@mui/icons-material/Add";
import { DataGrid } from "@mui/x-data-grid";

const rangeTypes = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

const flowTypeCycle = [
  { label: "All Expenses", value: "all", color: "bg-[#5b7fff] text-white" },
  { label: "Income", value: "inflow", color: "bg-[#06D6A0] text-black" },
  { label: "Expenses", value: "outflow", color: "bg-[#FF6B6B] text-white" },
];

const getRangeLabel = (range, offset, flowType) => {
  const now = dayjs();
  let start, end, label;
  if (range === "week") {
    start = now.startOf("week").add(offset, "week");
    end = now.endOf("week").add(offset, "week");
    if (offset === 0) {
      label = `Categories this week`;
    } else {
      label = `Categories ${start.format("D MMM")} - ${end.format(
        "D MMM, YYYY"
      )}`;
    }
  } else if (range === "month") {
    start = now.startOf("month").add(offset, "month");
    end = now.endOf("month").add(offset, "month");
    if (offset === 0) {
      label = `Categories this month`;
    } else {
      label = `Categories ${start.format("MMM YYYY")}`;
    }
  } else if (range === "year") {
    start = now.startOf("year").add(offset, "year");
    end = now.endOf("year").add(offset, "year");
    if (offset === 0) {
      label = `Categories this year`;
    } else {
      label = `Categories ${start.format("YYYY")}`;
    }
  }
  return label;
};

const CategorySearchToolbar = ({
  search,
  setSearch,
  onFilterClick,
  filterRef,
}) => (
  <div style={{ display: "flex", gap: 8, padding: 8 }}>
    <input
      type="text"
      placeholder="Search categories..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{
        backgroundColor: "#1b1b1b",
        color: "#ffffff",
        borderRadius: 8,
        fontSize: "0.75rem",
        border: "1px solid #00dac6",
        padding: "8px 16px",
        minWidth: 220,
        maxWidth: 320,
        width: "100%",
        outline: "none",
      }}
    />
    <IconButton
      sx={{ color: "#00dac6" }}
      onClick={onFilterClick}
      ref={filterRef}
    >
      <FilterListIcon fontSize="small" />
    </IconButton>
  </div>
);

// Custom active shape for pie chart
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text
        x={cx}
        y={cy}
        dy={8}
        textAnchor="middle"
        fill={fill}
        fontSize={14}
        fontWeight="bold"
      >
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#b0b6c3"
        fontSize={12}
      >{`₹${value}`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#b0b6c3"
        fontSize={12}
      >
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

const CategoryFlow = () => {
  const [activeRange, setActiveRange] = useState("month"); // Default to month on mount
  const [offset, setOffset] = useState(0);
  const [flowTab, setFlowTab] = useState("all"); // Start with 'all'
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null); // For pie chart selection
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [sortType, setSortType] = useState("high"); // Default to high-to-low for categories
  const [createCategoryModalOpen, setCreateCategoryModalOpen] = useState(false); // State for create category modal
  const [activeIndex, setActiveIndex] = useState(0); // For pie chart active segment
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [expenseSort, setExpenseSort] = useState({
    field: "date",
    direction: "desc",
  });
  const [showExpenseTable, setShowExpenseTable] = useState(false);
  const [selectedCategoryExpenses, setSelectedCategoryExpenses] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const dispatch = useDispatch();
  const { categoryExpenses, loading } = useSelector((state) => state.expenses);
  const filterBtnRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // Fetch data from API with correct flowType
  useEffect(() => {
    dispatch(fetchCategoriesWithExpenses(activeRange, offset, flowTab));
  }, [activeRange, offset, flowTab, dispatch]);

  useEffect(() => {
    setOffset(0);
  }, [activeRange]);

  // Pagination handlers

  // Reset selected items when main view changes
  useEffect(() => {
    setSelectedCategory(null);
    setActiveIndex(0);
    setShowExpenseTable(false);
  }, [activeRange, offset, flowTab]);

  // Popover close on outside click
  useEffect(() => {
    if (!popoverOpen) return;
    function handleClick(e) {
      if (
        filterBtnRef.current &&
        !filterBtnRef.current.contains(e.target) &&
        !document.getElementById("sort-popover")?.contains(e.target)
      ) {
        setPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [popoverOpen]);

  const handleBack = () => setOffset((prev) => prev - 1);
  const handleNext = () => setOffset((prev) => prev + 1);
  const handleSort = (type) => {
    setSortType(type);
    setPopoverOpen(false);
  };

  const rangeLabel = getRangeLabel(activeRange, offset, flowTab);

  // Generate a consistent color based on category name
  function getRandomColor(str) {
    // Predefined colors that work well with dark theme
    const themeColors = [
      "#5b7fff", // Blue
      "#00dac6", // Teal
      "#bb86fc", // Purple
      "#ff7597", // Pink
      "#ffb74d", // Orange
      "#ff5252", // Red
      "#69f0ae", // Green
      "#ff4081", // Bright Pink
      "#64b5f6", // Light Blue
      "#ffd54f", // Yellow
      "#b0bec5", // Gray
      "#e040fb", // Violet
      "#00e676", // Bright Green
      "#ffab40", // Amber
      "#4fc3f7", // Sky Blue
      "#7986cb", // Indigo
      "#9575cd", // Deep Purple
      "#4db6ac", // Teal
      "#81c784", // Light Green
      "#dce775", // Lime
    ];

    // Generate a consistent hash from the string
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Use the hash to select a color from our predefined array
    const index = Math.abs(hash) % themeColors.length;
    return themeColors[index];
  }

  // Process data for pie chart and cards
  const { pieData, categoryCards } = useMemo(() => {
    if (!categoryExpenses || !categoryExpenses.summary) {
      return { pieData: [], categoryCards: [] };
    }

    // Extract category data from the response
    const categories = Object.keys(categoryExpenses)
      .filter((key) => key !== "summary")
      .map((key) => ({
        name: key,
        ...categoryExpenses[key],
        value: categoryExpenses[key].totalAmount, // For pie chart
      }));

    // Create category cards
    const cards = categories.map((category) => ({
      categoryName: category.name,
      categoryId: category.id,
      totalAmount: category.totalAmount,
      expenseCount: category.expenseCount || 0,
      color: category.color || getRandomColor(category.name),
      expenses: category.expenses || [],
    }));

    return {
      pieData: categories.map((cat) => ({
        name: cat.name,
        value: cat.totalAmount,
        color: cat.color || getRandomColor(cat.name),
      })),
      categoryCards: cards,
    };
  }, [categoryExpenses]);

  // Filter category cards by search
  const filteredCategoryCards = useMemo(() => {
    if (!search) return categoryCards;

    const lower = search.toLowerCase();
    return categoryCards.filter(
      (card) =>
        card.categoryName.toLowerCase().includes(lower) ||
        (card.totalAmount + "").includes(lower)
    );
  }, [categoryCards, search]);

  // Sort filtered category cards based on sortType
  const sortedCategoryCards = useMemo(() => {
    let cards = [...filteredCategoryCards];

    if (sortType === "high") {
      cards.sort((a, b) => b.totalAmount - a.totalAmount);
    } else if (sortType === "low") {
      cards.sort((a, b) => a.totalAmount - b.totalAmount);
    } else if (sortType === "recent") {
      cards.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
    }

    return cards;
  }, [filteredCategoryCards, sortType]);

  // Handler for pie segment click
  // Handler for pie segment click
  const handlePieClick = (data, index) => {
    setActiveIndex(index);

    // Find the corresponding category from categoryCards
    const selectedCat = categoryCards.find(
      (cat) => cat.categoryName === data.name
    );

    if (selectedCat) {
      // Set the selected category and show expenses, just like handleCategoryClick
      setSelectedCategory(selectedCat);

      // Get expenses for this category
      let expenses = [];
      if (
        categoryExpenses &&
        categoryExpenses[selectedCat.categoryName] &&
        Array.isArray(categoryExpenses[selectedCat.categoryName].expenses)
      ) {
        expenses = categoryExpenses[selectedCat.categoryName].expenses;
      } else if (Array.isArray(selectedCat.expenses)) {
        expenses = selectedCat.expenses;
      }

      // Filter out null or undefined expenses
      expenses = expenses.filter(
        (expense) => expense !== null && expense !== undefined
      );

      setSelectedCategoryExpenses(expenses);
      setShowExpenseTable(true);
      setPage(0); // Reset pagination
    }
  };

  // Handler for category card click
  // Handler for category card click
  // Handler for category card click
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);

    // Check if the category has expenses data
    let expenses = [];
    if (
      categoryExpenses &&
      categoryExpenses[category.categoryName] &&
      Array.isArray(categoryExpenses[category.categoryName].expenses)
    ) {
      // Use the expenses directly from the categoryExpenses data
      expenses = categoryExpenses[category.categoryName].expenses;
    } else if (Array.isArray(category.expenses)) {
      // Fallback to the expenses in the category object
      expenses = category.expenses;
    }

    // Filter out any null or undefined expenses
    expenses = expenses.filter(
      (expense) => expense !== null && expense !== undefined
    );

    setSelectedCategoryExpenses(expenses);
    setShowExpenseTable(true);
    setPage(0); // Reset pagination when changing category
  };
  // Handler for category card double click
  const handleCategoryDoubleClick = (e, category) => {
    e.stopPropagation();
    navigate(`/categories/edit/${category.categoryId}`);
  };

  // Navigate to CashFlow with category filter
  const navigateToCashFlow = (category) => {
    navigate("/expenses", {
      state: {
        selectedCategory: category.name,
        rangeType: activeRange,
        offset: offset,
        flowType: flowTab,
      },
    });
  };

  // Cycle flowTab on button click
  const handleFlowTabToggle = () => {
    const idx = flowTypeCycle.findIndex((t) => t.value === flowTab);
    const next = flowTypeCycle[(idx + 1) % flowTypeCycle.length];
    setFlowTab(next.value);
    setSelectedCategory(null);
    setShowExpenseTable(false);
  };

  // Handle expense table sorting
  const handleExpenseSort = (field) => {
    setExpenseSort((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Sort expenses based on current sort settings
  // Sort expenses based on current sort settings
  const sortedExpenses = useMemo(() => {
    if (!selectedCategoryExpenses || !Array.isArray(selectedCategoryExpenses))
      return [];

    return [...selectedCategoryExpenses]
      .filter((expense) => expense !== null && expense !== undefined) // Filter out null/undefined expenses
      .sort((a, b) => {
        const { field, direction } = expenseSort;
        const multiplier = direction === "asc" ? 1 : -1;

        // Handle nested structure for both a and b
        const detailsA = a.details || a;
        const detailsB = b.details || b;

        if (field === "date") {
          const dateA = a.date ? new Date(a.date) : new Date(0);
          const dateB = b.date ? new Date(b.date) : new Date(0);
          return multiplier * (dateA - dateB);
        } else if (field === "amount") {
          const amountA = detailsA.amount || 0;
          const amountB = detailsB.amount || 0;
          return multiplier * (amountA - amountB);
        } else if (field === "name") {
          const nameA = detailsA.expenseName || "";
          const nameB = detailsB.expenseName || "";
          return multiplier * nameA.localeCompare(nameB);
        }
        return 0;
      });
  }, [selectedCategoryExpenses, expenseSort]);

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Close expense table
  const handleCloseExpenseTable = () => {
    setShowExpenseTable(false);
    setSelectedCategory(null);
  };

  // Delete category handlers
  const handleDeleteClick = (e, category) => {
    e.stopPropagation();
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // Implement the delete functionality here
    // You would typically dispatch an action to delete the category
    setToastMessage(
      `Category "${categoryToDelete.categoryName}" deleted successfully`
    );
    setToastOpen(true);
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
    // After successful deletion, refresh the categories
    dispatch(fetchCategoriesWithExpenses(activeRange, offset, flowTab));
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  // Handlers for create category modal
  const handleOpenCreateCategoryModal = () => {
    setCreateCategoryModalOpen(true);
  };

  const handleCloseCreateCategoryModal = () => {
    setCreateCategoryModalOpen(false);
    // Refresh categories after a new one is created
    dispatch(fetchCategoriesWithExpenses(activeRange, offset, flowTab));
  };

  useEffect(() => {
    // Show toast if redirected with toastMessage
    if (location.state && location.state.toastMessage) {
      setToastMessage(location.state.toastMessage);
      setToastOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleToastClose = () => {
    setToastOpen(false);
    setToastMessage("");
  };
  // Update the PieChart in the renderPieChart function
  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius={isMobile ? 35 : 50}
          outerRadius={isMobile ? 55 : 70}
          fill="#8884d8"
          dataKey="value"
          onMouseEnter={(data, index) => setActiveIndex(index)}
          onClick={(data) => handlePieClick(data, activeIndex)}
          style={{ cursor: "pointer", outline: "none" }}
          tabIndex={-1} // Remove from tab order to prevent focus
        >
          {pieData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.color ||
                `#${Math.floor(Math.random() * 16777215).toString(16)}`
              }
              stroke="#1b1b1b"
              strokeWidth={2}
              style={{ cursor: "pointer", outline: "none" }}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`₹${value}`, "Amount"]}
          contentStyle={{
            background: "#1b1b1b",
            border: "1px solid #00dac6",
            color: "#fff",
            borderRadius: 8,
            fontWeight: 500,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
          labelStyle={{ color: "#00dac6", fontWeight: 700 }}
          itemStyle={{ color: "#b0b6c3" }}
          cursor={{ fill: "transparent" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  // Render expense table
  // Render expense table
  const renderExpenseTable = () => {
    if (!showExpenseTable || !selectedCategory) return null;

    // Format data for DataGrid
    const rows = Array.isArray(selectedCategoryExpenses)
      ? selectedCategoryExpenses
          .filter((expense) => expense !== null && expense !== undefined)
          .map((expense, index) => {
            // Handle the nested structure of expense data
            const expenseDetails = expense.details || expense;
            return {
              id: expense.id || `expense-${index}`,
              name:
                expenseDetails.expenseName ||
                expense.expenseName ||
                "Unnamed Expense",
              date: expense.date || "No date",
              amount: expenseDetails.amount || expense.amount || 0,
              type: expenseDetails.type || expense.type || "loss",
            };
          })
      : [];

    // Define columns for DataGrid
    const columns = [
      {
        field: "name",
        headerName: "Name",
        flex: 2,
        renderCell: (params) => (
          <div className="text-white truncate" title={params.value}>
            {params.value}
          </div>
        ),
      },
      {
        field: "date",
        headerName: "Date",
        flex: 1,
        renderCell: (params) => (
          <div className="text-white">
            {typeof params.value === "string"
              ? dayjs(params.value).format("DD/MM/YYYY")
              : "No date"}
          </div>
        ),
      },
      {
        field: "amount",
        headerName: "Amount",
        flex: 1,
        renderCell: (params) => {
          const isIncome =
            params.row.type === "gain" || params.row.type === "income";
          return (
            <div
              style={{
                color: isIncome ? "#06D6A0" : "#FF6B6B",
                fontWeight: "bold",
              }}
            >
              ₹{Number(params.value)}
            </div>
          );
        },
      },
      {
        field: "type",
        headerName: "Type",
        flex: 1,
        renderCell: (params) => {
          const isIncome = params.value === "gain" || params.value === "income";
          return (
            <span
              className={`px-2 py-1 rounded text-xs font-bold ${
                isIncome ? "bg-[#06D6A0] text-black" : "bg-[#FF6B6B] text-white"
              }`}
            >
              {isIncome ? "Income" : "Expense"}
            </span>
          );
        },
      },
    ];

    // Calculate appropriate height based on screen size and available space
    const tableHeight = isMobile ? 200 : isTablet ? 250 : 300;

    return (
      <div
        className="w-full rounded-lg p-4 mb-4"
        style={{
          background: "#1b1b1b",
          minWidth: 0,
          maxWidth: "100%",
          boxSizing: "border-box",
          position: "relative",
          maxHeight: `calc(100% - ${isMobile ? 200 : 240}px)`,
          overflow: "hidden",
        }}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-bold">
            {selectedCategory.categoryName} Expenses
          </h3>
          <IconButton
            onClick={handleCloseExpenseTable}
            sx={{ color: "#ff5252" }}
          >
            <CloseIcon />
          </IconButton>
        </div>

        <div style={{ height: tableHeight, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            autoHeight={false}
            hideFooterSelectedRowCount
            disableExtendRowFullWidth={true}
            rowHeight={40} // Consistent row height
            disableColumnMenu
            pageSizeOptions={[5]}
            initialState={{
              pagination: { paginationModel: { pageSize: 5 } },
            }}
            sx={{
              bgcolor: "#1b1b1b",
              color: "#ffffff",
              border: "1px solid #28282a",
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "#333333",
                color: "#ffffff",
              },
              "& .MuiDataGrid-row": {
                maxHeight: "40px !important",
                minHeight: "40px !important",
                borderBottom: "none", // Remove bottom border from rows
              },
              "& .MuiDataGrid-cell": {
                padding: "4px 8px",
                display: "flex",
                alignItems: "center", // Centers content vertically
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
              height: isMobile ? 200 : isTablet ? 250 : 315, // Maintain your responsive heights
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className="bg-[#0b0b0b] p-4 rounded-lg mt-[50px]"
      style={{
        width: isMobile ? "100vw" : isTablet ? "100vw" : "calc(100vw - 370px)",
        height: isMobile ? "auto" : isTablet ? "auto" : "calc(100vh - 100px)",
        marginRight: isMobile ? 0 : isTablet ? 0 : "20px",
        borderRadius: isMobile ? 0 : isTablet ? "8px" : "8px",
        boxSizing: "border-box",
        position: "relative",
        padding: isMobile ? 4 : isTablet ? 8 : 16,
        minWidth: 0,
      }}
    >
      <ToastNotification
        open={toastOpen}
        message={toastMessage}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={5000}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          style: {
            backgroundColor: "#1b1b1b",
            color: "#fff",
            borderRadius: "12px",
          },
        }}
      >
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#b0b6c3" }}>
            Are you sure you want to delete the category "
            {categoryToDelete?.categoryName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} sx={{ color: "#00dac6" }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            sx={{ color: "#ff5252" }}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog
        open={createCategoryModalOpen}
        onClose={() => setCreateCategoryModalOpen(false)}
        PaperProps={{
          style: {
            backgroundColor: "#1b1b1b",
            color: "#fff",
            borderRadius: "12px",
          },
        }}
      >
        <DialogTitle>Create Category</DialogTitle>
        <DialogContent>
          <CreateCategory
            onClose={() => setCreateCategoryModalOpen(false)}
            onCategoryCreated={(newCategory) => {
              setToastMessage(
                `Category "${newCategory.categoryName}" created successfully`
              );
              setToastOpen(true);
              // Refresh categories after creation
              dispatch(
                fetchCategoriesWithExpenses(activeRange, offset, flowTab)
              );
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Flow Type Toggle Button */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          gap: 8,
        }}
      >
        <button
          onClick={handleFlowTabToggle}
          className={`rounded-lg flex items-center justify-center animate-morph-flow-toggle-rect ${
            flowTypeCycle.find((t) => t.value === flowTab)?.color ||
            "bg-[#29282b] text-white"
          }`}
          style={{
            minWidth: isMobile ? 40 : 70,
            minHeight: isMobile ? 32 : 38,
            width: isMobile ? 40 : 70,
            height: isMobile ? 32 : 38,
            padding: 0,
            border: "none",
            outline: "none",
            boxShadow: "0 2px 8px #0002",
            position: "relative",
            transition: "background 0.5s, color 0.5s, box-shadow 0.5s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <img
              src={require("../../assests/unfold.png")}
              alt="Unfold"
              style={{
                width: isMobile ? 20 : 25,
                height: isMobile ? 25 : 25,
                marginRight: isMobile ? 4 : 8,
                verticalAlign: "middle",
              }}
            />
          </span>
        </button>
      </div>

      {/* Range Type Buttons */}
      <div className="flex gap-4 mb-4">
        {rangeTypes.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setActiveRange(tab.value);
            }}
            className={`px-4 py-2 rounded font-semibold flex items-center gap-2 ${
              activeRange === tab.value
                ? "bg-[#00DAC6] text-black"
                : "bg-[#29282b] text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={handleBack}
          disabled={offset <= -52}
          className={`px-3 py-1 rounded text-lg flex items-center ${
            offset <= -52
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-[#00DAC6] text-black hover:bg-[#00b8a0]"
          }`}
          aria-label="Previous"
        >
          &#8592;
        </button>
        <span className="text-white text-sm">{rangeLabel}</span>
        <button
          onClick={handleNext}
          disabled={offset >= 0}
          className={`px-3 py-1 rounded text-lg flex items-center ${
            offset >= 0
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-[#00DAC6] text-black hover:bg-[#00b8a0]"
          }`}
          aria-label="Next"
        >
          &#8594;
        </button>
      </div>

      {/* Pie Chart Container - Always visible */}
      <div
        className="w-full rounded-lg p-4 mb-4"
        style={{
          background: "#1b1b1b",
          height: isMobile ? 180 : isTablet ? 200 : 240,
          minWidth: 0,
          maxWidth: "100%",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Skeleton
            variant="circular"
            width={isMobile ? 140 : 180}
            height={isMobile ? 140 : 180}
            animation="wave"
            sx={{
              bgcolor: "#23243a",
              borderRadius: "50%",
              margin: "0 auto",
            }}
          />
        ) : pieData.length === 0 ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#1b1b1b",
              borderRadius: 8,
              border: "1px solid #23243a",
              position: "relative",
              minWidth: 0,
              boxSizing: "border-box",
            }}
          >
            <span
              style={{
                color: "#5b7fff",
                fontWeight: 600,
                fontSize: isMobile ? "14px" : "18px",
                width: "100%",
                textAlign: "center",
                position: "absolute",
                left: 0,
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              No category data to display
            </span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 35 : 50}
                outerRadius={isMobile ? 55 : 70}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={(data, index) => setActiveIndex(index)}
                onClick={(data) => handlePieClick(data, activeIndex)}
                style={{ cursor: "pointer", outline: "none" }}
                tabIndex={-1} // Remove from tab order to prevent focus
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.color ||
                      `#${Math.floor(Math.random() * 16777215).toString(16)}`
                    }
                    stroke="#1b1b1b"
                    strokeWidth={2}
                    style={{ cursor: "pointer", outline: "none" }}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`₹${value}`, "Amount"]}
                contentStyle={{
                  background: "#1b1b1b",
                  border: "1px solid #00dac6",
                  color: "#fff",
                  borderRadius: 8,
                  fontWeight: 500,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
                labelStyle={{ color: "#00dac6", fontWeight: 700 }}
                itemStyle={{ color: "#b0b6c3" }}
                cursor={{ fill: "transparent" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Expense Table - Show when a category is selected */}
      {showExpenseTable && renderExpenseTable()}

      {/* Only show search bar and category cards when not showing expense table */}
      {!showExpenseTable && (
        <>
          {/* Search Bar */}
          <div
            className="flex justify-start mt-2 mb-2"
            style={{
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? 4 : 8,
              flexWrap: "wrap",
            }}
          >
            <CategorySearchToolbar
              search={search}
              setSearch={setSearch}
              onFilterClick={() => setPopoverOpen((v) => !v)}
              filterRef={filterBtnRef}
            />
            <IconButton
              sx={{ color: "#5b7fff", ml: 1 }}
              onClick={() => navigate("/category-flow/create")}
              aria-label="New Category"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#5b7fff"
                  strokeWidth="2"
                  fill="#23243a"
                />
                <path
                  d="M12 8V16"
                  stroke="#5b7fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M8 12H16"
                  stroke="#5b7fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </IconButton>
          </div>
          {/* Sort Popover */}
          {popoverOpen &&
            filterBtnRef.current &&
            createPortal(
              <div
                id="sort-popover"
                style={{
                  position: "fixed",
                  top:
                    filterBtnRef.current.getBoundingClientRect().top +
                    window.scrollY,
                  left:
                    filterBtnRef.current.getBoundingClientRect().right +
                    8 +
                    window.scrollX,
                  zIndex: 1000,
                  background: "#0b0b0b",
                  border: "1px solid #333",
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                  minWidth: 140,
                  maxWidth: 180,
                  padding: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    padding: 4,
                  }}
                >
                  {/* Alphabetical */}
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      background:
                        sortType === "recent" ? "#5b7fff" : "transparent",
                      color: sortType === "recent" ? "#fff" : "#5b7fff",
                      border: "none",
                      textAlign: "left",
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontWeight: sortType === "recent" ? 700 : 500,
                      borderRadius: 6,
                      transition: "background 0.2s, color 0.2s",
                    }}
                    onClick={() => handleSort("recent")}
                  >
                    <img
                      src={recentPng}
                      alt="Recent"
                      style={{
                        width: 18,
                        height: 18,
                        filter:
                          sortType === "recent"
                            ? "none"
                            : "grayscale(1) brightness(2)",
                        borderRadius: 3,
                        background: "transparent",
                        opacity: 1,
                        ...(sortType === "recent"
                          ? {
                              filter:
                                "invert(1) sepia(1) saturate(5) hue-rotate(200deg)",
                            }
                          : {
                              filter:
                                "invert(34%) sepia(99%) saturate(749%) hue-rotate(200deg) brightness(1.2)",
                            }),
                      }}
                    />
                    <span>Alphabetical</span>
                  </button>
                  {/* High to Low */}
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      background:
                        sortType === "high" ? "#ff4d4f" : "transparent",
                      color: sortType === "high" ? "#fff" : "#ff4d4f",
                      border: "none",
                      textAlign: "left",
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontWeight: sortType === "high" ? 700 : 500,
                      borderRadius: 6,
                      transition: "background 0.2s, color 0.2s",
                    }}
                    onClick={() => handleSort("high")}
                  >
                    <ArrowDownwardIcon
                      fontSize="small"
                      style={{
                        color: sortType === "high" ? "#fff" : "#ff4d4f",
                      }}
                    />
                    <span>High to Low</span>
                  </button>
                  {/* Low to High */}
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      background:
                        sortType === "low" ? "#06d6a0" : "transparent",
                      color: sortType === "low" ? "#232a2f" : "#06d6a0",
                      border: "none",
                      textAlign: "left",
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontWeight: sortType === "low" ? 700 : 500,
                      borderRadius: 6,
                      transition: "background 0.2s, color 0.2s",
                    }}
                    onClick={() => handleSort("low")}
                  >
                    <ArrowUpwardIcon
                      fontSize="small"
                      style={{
                        color: sortType === "low" ? "#232a2f" : "#06d6a0",
                      }}
                    />
                    <span>Low to High</span>
                  </button>
                </div>
              </div>,
              document.body
            )}
          {/* Category Cards */}

          {/* Category Cards */}
          {/* Category Cards */}
          <div
            className="flex flex-wrap justify-start custom-scrollbar"
            style={{
              maxHeight: isMobile ? 200 : isTablet ? 250 : 360,
              overflowY: "auto",
              overflowX: "hidden",
              paddingRight: isMobile ? 4 : isTablet ? 8 : 16,
              gap: isMobile ? 8 : 16,
              width: "100%",
              paddingLeft: "16px", // Add left padding for consistent spacing
            }}
          >
            {loading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton
                  key={idx}
                  variant="rectangular"
                  width={isMobile ? "100%" : 220}
                  height={130}
                  animation="wave"
                  sx={{ bgcolor: "#23243a", borderRadius: 2 }}
                  style={{
                    margin: "0 0 16px 0",
                  }}
                />
              ))
            ) : sortedCategoryCards.length === 0 ? (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div className="text-center text-gray-400 py-4">
                  No categories found
                </div>
              </div>
            ) : (
              sortedCategoryCards.map((category, idx) => (
                <div
                  key={idx}
                  className={`bg-[#1b1b1b] rounded-lg shadow-md flex flex-col justify-between relative group transition-colors duration-200 ${
                    selectedCategory?.categoryId === category.categoryId
                      ? "ring-2 ring-[#5b7fff]"
                      : ""
                  }`}
                  style={{
                    minHeight: "130px",
                    maxHeight: "130px",
                    height: "130px",
                    width: isMobile ? "100%" : 220,
                    padding: "16px 20px",
                    boxSizing: "border-box",
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "#1b1b1b",
                    transition: "background 0.2s, box-shadow 0.2s, border 0.2s",
                    border: "2px solid transparent",
                    borderLeft: `6px solid ${category.color}`,
                    margin: "4px",
                  }}
                  onClick={() => handleCategoryClick(category)}
                  onDoubleClick={(e) => handleCategoryDoubleClick(e, category)}
                >
                  {/* Card content remains the same */}
                  <div
                    className="flex flex-col gap-2"
                    style={{ height: "100%" }}
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between min-w-0">
                      <span
                        className="font-semibold text-base truncate min-w-0 text-white"
                        title={category.categoryName}
                        style={{
                          maxWidth: "70%",
                          fontSize: "15px",
                          fontWeight: 700,
                        }}
                      >
                        {category.categoryName}
                      </span>
                    </div>

                    {/* Amount Display */}
                    <div className="text-base font-bold flex items-center gap-1">
                      <span
                        style={{
                          color: category.color,
                          fontSize: "16px",
                          fontWeight: 700,
                        }}
                      >
                        ₹{category.totalAmount}
                      </span>
                    </div>

                    {/* Category Info */}
                    <div
                      className="text-gray-300 text-sm break-words card-comments-clamp"
                      style={{
                        wordBreak: "break-word",
                        flex: 1,
                        overflow: "hidden",
                      }}
                    >
                      {`${category.expenseCount} expense${
                        category.expenseCount !== 1 ? "s" : ""
                      }`}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* CSS Styles */}
      <style>{`
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    background: #23243a;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: ${
      flowTab === "outflow"
        ? "#ff4d4f"
        : flowTab === "inflow"
        ? "#06d6a0"
        : "#5b7fff"
    };
    border-radius: 6px;
  }
  .card-comments-clamp {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    min-height: 0;
    max-height: 60px;
  }
  .animate-morph-flow-toggle-rect {
    transition: background 0.5s, color 0.5s, box-shadow 0.5s, border-radius 0.5s, width 0.5s, height 0.5s;
    border-radius: 12px;
    will-change: border-radius, background, color, box-shadow, width, height;
    animation: morphInOutRect 0.5s cubic-bezier(0.4,0,0.2,1);
  }
  .animate-morph-flow-toggle-rect:active {
    transform: scale(0.97) rotate(-3deg);
  }
  @keyframes morphInOutRect {
    0% { border-radius: 20%; box-shadow: 0 2px 8px #0002; }
    50% { border-radius: 18px; box-shadow: 0 4px 16px #0004; }
    100% { border-radius: 12px; box-shadow: 0 2px 8px #0002; }
  }
  .group:hover .group-hover\\:opacity-90 {
    opacity: 0.9;
  }
  
  /* Enhanced styles to remove all outlines and focus indicators */
  .recharts-wrapper, 
  .recharts-surface, 
  .recharts-layer, 
  .recharts-sector, 
  .recharts-pie, 
  .recharts-pie-sector {
    outline: none !important;
    -webkit-tap-highlight-color: transparent;
  }
  
  /* Remove focus styles for all chart elements */
  .recharts-wrapper *:focus,
  .recharts-wrapper *:active,
  .recharts-wrapper *:focus-visible {
    outline: none !important;
    box-shadow: none !important;
    border-color: transparent !important;
  }
  
  /* Add pointer cursor to all chart elements */
  .recharts-layer {
    cursor: pointer;
  }
  
  /* Prevent any selection on the chart */
  .recharts-wrapper {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }
`}</style>
    </div>
  );
};

export default CategoryFlow;
