// import React, { useState, useMemo, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import {
//   useReactTable,
//   getCoreRowModel,
//   getSortedRowModel,
//   getPaginationRowModel,
// } from "@tanstack/react-table";
// import { getExpensesByBudgetId } from "../../Redux/Expenses/expense.action";
// import { getBudgetReportById } from "../../Redux/Budget/budget.action";
// import { useMediaQuery } from "@mui/material";

// // BudgetReport component
// const BudgetReport = () => {
//   const { id, friendId } = useParams();
//   const [pageIndex, setPageIndex] = useState(0);
//   const [pageSize, setPageSize] = useState(5);
//   const [sorting, setSorting] = useState([]);
//   const [showTable, setShowTable] = useState(true);

//   // Access budget, budgetExpenses, loading, and error states from Redux state
//   const budget = useSelector((state) => state.budgets.budget);
//   const budgetExpenses = useSelector((state) => state.expenses.budgetExpenses);
//   const isBudgetLoading = useSelector((state) => state.budgets.loading);
//   const isExpensesLoading = useSelector((state) => state.expenses.loading);
//   const budgetError = useSelector((state) => state.budgets.error);
//   const expensesError = useSelector((state) => state.expenses.error);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const isSmallScreen = useMediaQuery("(max-width: 768px)");

//   // Ensure budgetExpenses is an array and log for debugging
//   const safeBudgetExpenses = Array.isArray(budgetExpenses)
//     ? budgetExpenses
//     : [];

//   useEffect(() => {
//     dispatch(getBudgetReportById(id, friendId || ""));
//     dispatch(getExpensesByBudgetId(id, friendId || ""));
//   }, [id, friendId]);

//   // Debug data structure
//   useEffect(() => {
//     console.log("Budget:", budget);
//     console.log("BudgetExpenses:", budgetExpenses);
//     console.log("SafeBudgetExpenses:", safeBudgetExpenses);
//     console.log("Budget Loading:", isBudgetLoading);
//     console.log("Expenses Loading:", isExpensesLoading);
//     console.log("Budget Error:", budgetError);
//     console.log("Expenses Error:", expensesError);
//   }, [
//     budget,
//     budgetExpenses,
//     isBudgetLoading,
//     isExpensesLoading,
//     budgetError,
//     expensesError,
//   ]);

//   useEffect(() => {});

//   // Color palette for charts
//   const colorPalette = ["#8884d8", "#82ca9d", "#ff7300", "#FF6B6B", "#4ECDC4"];

//   // Prepare daily spending data based on startDate and endDate
//   const dailySpendingData = useMemo(() => {
//     const dateRange = [];
//     if (!budget || !budget.startDate || !budget.endDate) {
//       return dateRange;
//     }

//     const start = new Date(budget.startDate);
//     const end = new Date(budget.endDate);

//     // Ensure valid dates
//     if (isNaN(start) || isNaN(end) || start > end) {
//       console.warn("Invalid date range for daily spending calculation");
//       return dateRange;
//     }

//     // Iterate through each day in the range
//     for (
//       let currentDate = new Date(start);
//       currentDate <= end;
//       currentDate.setDate(currentDate.getDate() + 1)
//     ) {
//       const dateStr = currentDate.toISOString().split("T")[0];
//       const spending = safeBudgetExpenses
//         .filter((exp) => {
//           if (!exp || !exp.date || !exp.includeInBudget || !exp.expense) {
//             console.warn("Invalid expense object:", exp);
//             return false;
//           }
//           return exp.date === dateStr && exp.includeInBudget;
//         })
//         .reduce((sum, exp) => sum + (exp.expense.amount || 0), 0);
//       dateRange.push({
//         date: dateStr,
//         spending: Number(spending.toFixed(2)),
//       });
//     }
//     return dateRange;
//   }, [budget, safeBudgetExpenses]);

//   // Prepare pie chart data
//   const pieData = useMemo(() => {
//     const grouped = safeBudgetExpenses
//       .filter((exp) => {
//         if (!exp || !exp.includeInBudget || !exp.expense) {
//           console.warn("Invalid expense object for pie chart:", exp);
//           return false;
//         }
//         return exp.includeInBudget;
//       })
//       .reduce((acc, curr) => {
//         const name = curr.expense.expenseName || "Unknown";
//         acc[name] = (acc[name] || 0) + (curr.expense.amount || 0);
//         return acc;
//       }, {});
//     // Convert to array, sort by value descending, and take top 5
//     return Object.entries(grouped)
//       .map(([name, value]) => ({
//         name,
//         value: Number(value.toFixed(2)),
//       }))
//       .sort((a, b) => b.value - a.value)
//       .slice(0, 7);
//   }, [safeBudgetExpenses]);

//   // Handle download functionality
//   const handleDownload = (data) => {
//     if (!data) return;
//     const fileName = `budget-report-${data.budgetId}.json`;
//     const json = JSON.stringify(data, null, 2);
//     const blob = new Blob([json], { type: "application/json" });
//     const href = URL.createObjectURL(blob);

//     const link = document.createElement("a");
//     link.href = href;
//     link.download = fileName;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(href);
//   };

//   // Table columns
//   const columns = useMemo(
//     () => [
//       {
//         header: "Expense Name",
//         accessorKey: "expense.expenseName",
//         size: 150,
//         cell: ({ getValue }) => getValue() || "N/A",
//       },
//       {
//         header: "Date",
//         accessorKey: "date",
//         size: 120,
//         cell: ({ getValue }) => getValue() || "N/A",
//       },
//       {
//         header: "Amount",
//         accessorKey: "expense.amount",
//         size: 100,
//         cell: ({ getValue }) => `$${getValue().toFixed(2)}`,
//       },
//       {
//         header: "Payment Method",
//         accessorKey: "expense.paymentMethod",
//         size: 120,
//         cell: ({ getValue }) => getValue() || "N/A",
//       },
//       {
//         header: "Comments",
//         accessorKey: "expense.comments",
//         size: 150,
//         cell: ({ getValue }) => getValue() || "N/A",
//       },
//       {
//         header: "In Budget",
//         accessorKey: "includeInBudget",
//         size: 100,
//         cell: ({ getValue }) => (
//           <input
//             type="checkbox"
//             checked={!!getValue()}
//             // disabled
//             className="h-5 w-5 text-[#00dac6] border-gray-700 rounded focus:ring-[#00dac6]"
//             style={{
//               accentColor: "#00b8a0",
//             }}
//           />
//         ),
//       },
//     ],
//     []
//   );

//   const table = useReactTable({
//     data: safeBudgetExpenses,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     onSortingChange: setSorting,
//     onPaginationChange: (updater) => {
//       const newState =
//         typeof updater === "function"
//           ? updater({ pageIndex, pageSize })
//           : updater;
//       setPageIndex(newState.pageIndex);
//       setPageSize(newState.pageSize);
//     },
//     state: {
//       sorting,
//       pagination: { pageIndex, pageSize },
//     },
//     pageCount: Math.ceil(safeBudgetExpenses.length / pageSize),
//   });

//   const handlePageSizeChange = (e) => {
//     const newSize = Number(e.target.value);
//     setPageSize(newSize);
//     setPageIndex(0);
//   };

//   const handleCloseTable = () => {
//     setShowTable(false);
//   };

//   // Custom tooltip for charts
//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div
//           style={{
//             backgroundColor: "#333",
//             border: "1px solid #444",
//             padding: "8px",
//             color: "#ffffff",
//             borderRadius: "4px",
//           }}
//         >
//           <p>{label}</p>
//           {payload.map((entry, index) => (
//             <p key={index} style={{ color: entry.color || "#ffffff" }}>
//               {`${entry.name}: ${entry.value}`}
//             </p>
//           ))}
//         </div>
//       );
//     }
//     return null;
//   };

//   // Custom label for Pie Chart
//   const renderCustomLabel = ({
//     cx,
//     cy,
//     midAngle,
//     innerRadius,
//     outerRadius,
//     percent,
//     name,
//   }) => {
//     const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
//     const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
//     const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
//     return (
//       <text
//         x={x}
//         y={y}
//         fill="#ffffff"
//         textAnchor={x > cx ? "start" : "end"}
//         dominantBaseline="central"
//         style={{ fontSize: 10 }}
//       >
//         {`${name} (${(percent * 100).toFixed(0)}%)`}
//       </text>
//     );
//   };

//   // Render error state
//   if (budgetError || expensesError) {
//     return (
//       <div className="bg-[#1b1b1b]">
//         {/* <div className="w-[calc(100vw-370px)]  bg-[#1b1b1b]"></div> */}
//         <div
//           className="flex flex-col justify-start items-start flex-shrink-1 flex-grow-1 align-self-stretch"
//           style={{
//             width: "calc(100vw - 370px)",
//             height: "calc(100vh - 100px)",
//             backgroundColor: "rgb(11, 11, 11)",
//             borderRadius: "8px",
//             boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
//             border: "1px solid rgb(0, 0, 0)",
//             opacity: 1,
//             padding: "16px",
//             marginRight: "20px",
//           }}
//         >
//           <div className="text-center text-red-500 py-8 w-full">
//             {budgetError
//               ? `Error loading budget: ${
//                   budgetError.message || "Unknown error"
//                 }`
//               : expensesError
//               ? `Error loading expenses: ${
//                   expensesError.message || "Unknown error"
//                 }`
//               : "An error occurred"}
//             <p className="text-gray-400 text-sm mt-2">
//               Please try refreshing or contact support if the issue persists.
//             </p>
//           </div>
//         </div>
//         <div className="w-[calc(100vw-370px)] h-[50px] bg-[#1b1b1b]"></div>
//       </div>
//     );
//   }

//   // Render loading state
//   if (isBudgetLoading || isExpensesLoading) {
//     return (
//       <div className="bg-[#1b1b1b]">
//         {/* <div className="w-[calc(100vw-370px)] h-[50px] bg-[#1b1b1b]"></div> */}
//         <div
//           className="flex flex-col justify-start items-start flex-shrink-1 flex-grow-1 align-self-stretch"
//           style={{
//             width: "calc(100vw - 370px)",
//             height: "calc(100vh - 100px)",
//             backgroundColor: "rgb(11, 11, 11)",
//             borderRadius: "8px",
//             boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
//             border: "1px solid rgb(0, 0, 0)",
//             opacity: 1,
//             padding: "16px",
//             marginRight: "20px",
//           }}
//         >
//           <div className="text-center text-gray-400 py-8 w-full">
//             Loading budget report...
//           </div>
//         </div>
//         <div className="w-[calc(100vw-370px)] h-[50px] bg-[#1b1b1b]"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[#1b1b1b]">
//       {/* <div className="w-[calc(100vw-370px)] h-[50px] bg-[#1b1b1b]"></div> */}
//       <div
//         className="flex flex-col justify-start items-start flex-shrink-1 flex-grow-1 align-self-stretch"
//         style={{
//           width: isSmallScreen ? "100%" : "calc(100vw - 370px)",
//           height: isSmallScreen ? "100%" : "calc(100vh - 100px)",
//           backgroundColor: "rgb(11, 11, 11)",
//           borderRadius: "8px",
//           boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
//           border: "1px solid rgb(0, 0, 0)",
//           opacity: 1,
//           padding: "16px",
//           marginRight: "20px",
//         }}
//       >
//         <div className="w-full flex flex-col">
//           {/* Budget Details and Pie Chart */}
//           <div className="mb-6">
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: isSmallScreen ? "column" : "row",
//                 justifyContent: "space-between",
//                 alignItems: "flex-start",
//                 padding: isSmallScreen ? "0" : "0 8px",
//                 gap: isSmallScreen ? "12px" : "0",
//                 position: "relative",
//                 height: isSmallScreen ? "80vh" : "240px",
//               }}
//             >
//               <div
//                 style={{
//                   flex: isSmallScreen ? "1 1 100%" : "1 1 50%",
//                   width: isSmallScreen ? "100%" : "50%",
//                   minWidth: "0",
//                   padding: isSmallScreen ? "4px" : "8px",
//                   marginRight: isSmallScreen ? "0" : "8px",
//                   marginBottom: isSmallScreen ? "0" : "0",
//                 }}
//               >
//                 <div className="bg-[#29282b] p-3 rounded-lg border border-gray-600 relative">
//                   <h2 className="text-white font-bold text-xl mb-2">
//                     Budget Report (ID: {budget?.budgetId || "N/A"})
//                   </h2>
//                   <button
//                     onClick={() => handleDownload(budget)}
//                     disabled={!budget}
//                     className={`absolute top-3 right-3 text-xs px-3 py-1 rounded shadow ${
//                       budget
//                         ? "bg-blue-600 hover:bg-blue-700 text-white"
//                         : "bg-gray-600 text-gray-400 cursor-not-allowed"
//                     }`}
//                   >
//                     Download
//                   </button>
//                   {budget ? (
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
//                       <p className="text-white text-base">
//                         <span className="font-semibold">Allocated Amount:</span>{" "}
//                         ${budget.allocatedAmount?.toFixed(2) || "0.00"}
//                       </p>
//                       <p className="text-white text-base">
//                         <span className="font-semibold">Remaining Amount:</span>{" "}
//                         ${budget.remainingAmount?.toFixed(2) || "0.00"}
//                       </p>
//                       <p className="text-white text-base">
//                         <span className="font-semibold">Start Date:</span>{" "}
//                         {budget.startDate || "N/A"}
//                       </p>
//                       <p className="text-white text-base">
//                         <span className="font-semibold">End Date:</span>{" "}
//                         {budget.endDate || "N/A"}
//                       </p>
//                       <p className="text-white text-base">
//                         <span className="font-semibold">
//                           Total Cash Losses:
//                         </span>{" "}
//                         ${budget.totalCashLosses?.toFixed(2) || "0.00"}
//                       </p>
//                       <p className="text-white text-base">
//                         <span className="font-semibold">
//                           Total Credit Losses:
//                         </span>{" "}
//                         ${budget.totalCreditLosses?.toFixed(2) || "0.00"}
//                       </p>
//                     </div>
//                   ) : (
//                     <p className="text-gray-400 text-xs mt-2">
//                       No budget details available
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div
//                 style={{
//                   flex: isSmallScreen ? "1 1 100%" : "1 1 50%",
//                   width: isSmallScreen ? "100%" : "50%",
//                   minWidth: isSmallScreen ? "0" : "280px",
//                   height: isSmallScreen ? "200px" : "240px",
//                   display: "flex",
//                   flexDirection: "column",
//                   justifyContent: "center",
//                   alignItems: "center",
//                   padding: isSmallScreen ? "4px" : "8px",
//                   marginLeft: isSmallScreen ? "0" : "8px",
//                   marginTop: isSmallScreen ? "12px" : "0",
//                 }}
//               >
//                 <p
//                   style={{
//                     color: "#ffffff",
//                     fontWeight: "bold",
//                     marginBottom: "8px",
//                     textAlign: "center",
//                     fontSize: "13px",
//                   }}
//                 >
//                   Expense Distribution
//                 </p>
//                 <ResponsiveContainer width="100%" height="85%">
//                   <PieChart>
//                     <Pie
//                       data={
//                         pieData.length > 0
//                           ? pieData
//                           : [{ name: "No Expenses", value: 1 }]
//                       }
//                       dataKey="value"
//                       nameKey="name"
//                       outerRadius={80}
//                       innerRadius={45} // Donut chart: set innerRadius
//                       label={renderCustomLabel}
//                       labelLine={false}
//                     >
//                       {pieData.length > 0 ? (
//                         pieData.map((entry, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={colorPalette[index % colorPalette.length]}
//                           />
//                         ))
//                       ) : (
//                         <Cell fill="#8884d8" />
//                       )}
//                     </Pie>
//                     <Tooltip content={<CustomTooltip />} />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//               {!isSmallScreen && (
//                 <button
//                   onClick={() => navigate("/budget")}
//                   className="absolute top-[=15px] right-[-8px] px-2 py-1 bg-[#29282b] text-white border border-gray-700 rounded hover:bg-[#3a3a3a]"
//                 >
//                   X
//                 </button>
//               )}
//               {isSmallScreen && (
//                 <button
//                   onClick={() => navigate("/budget")}
//                   style={{
//                     position: "absolute",
//                     top: -60,
//                     right: -10,
//                     zIndex: 10,
//                     padding: "4px 10px",
//                     background: "#29282b",
//                     color: "#fff",
//                     border: "1px solid #444",
//                     borderRadius: "6px",
//                   }}
//                 >
//                   X
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Line Chart - Daily Spending */}
//           <div className="mb-6">
//             <div
//               style={{
//                 width: "100%",
//                 height: "180px",
//                 padding: "8px",
//                 display: "flex",
//                 flexDirection: "column",
//                 justifyContent: "center",
//                 alignItems: "center",
//               }}
//               className="bg-[#29282b] rounded-lg border border-gray-600"
//             >
//               <p
//                 style={{
//                   color: "#ffffff",
//                   fontWeight: "bold",
//                   marginBottom: "8px",
//                   textAlign: "center",
//                   fontSize: "13px",
//                 }}
//               >
//                 Daily Spending
//               </p>
//               <ResponsiveContainer width="100%" height="80%">
//                 <LineChart data={dailySpendingData}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#444" />
//                   <XAxis
//                     dataKey="date"
//                     stroke="#ffffff"
//                     tick={{ fill: "#ffffff", fontSize: 9 }}
//                     tickFormatter={(value) => value.split("-")[2]}
//                   />
//                   <YAxis
//                     stroke="#ffffff"
//                     tick={{ fill: "#ffffff", fontSize: 9 }}
//                   />
//                   <Tooltip content={<CustomTooltip />} />
//                   <Line
//                     type="monotone"
//                     dataKey="spending"
//                     stroke="#FF6B6B"
//                     name="Spending"
//                     strokeWidth={2}
//                     dot={{ r: 3 }}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           {/* Expenses Table */}
//           {showTable && (
//             <div>
//               <div className="block sm:hidden space-y-4">
//                 <div className="flex justify-end mb-2">
//                   <button
//                     onClick={handleCloseTable}
//                     className="px-2 py-1 bg-[#29282b] text-white border border-gray-700 rounded hover:bg-[#3a3a3a]"
//                   >
//                     X
//                   </button>
//                 </div>
//                 {safeBudgetExpenses.length === 0 ? (
//                   <div className="text-center text-gray-400 py-8">
//                     No expenses found for this budget. Try adding expenses or
//                     check the budget ID.
//                   </div>
//                 ) : (
//                   table.getRowModel().rows.map((row) => (
//                     <div
//                       key={row.id}
//                       className="bg-[#29282b] border border-gray-600 rounded-lg p-4"
//                     >
//                       <div className="flex justify-between items-center mb-2">
//                         <span className="text-white font-semibold">
//                           {row.original.expense?.expenseName || "N/A"}
//                         </span>
//                         <div className="flex items-center gap-2">
//                           <span className="text-gray-300 text-sm">
//                             In Budget
//                           </span>
//                           <input
//                             type="checkbox"
//                             checked={row.original.includeInBudget}
//                             disabled
//                             className="h-5 w-5 text-[#00dac6] border-gray-700 rounded focus:ring-[#00dac6]"
//                           />
//                         </div>
//                       </div>
//                       <div className="text-gray-300 text-sm space-y-1">
//                         <p>
//                           <span className="font-medium">Date:</span>{" "}
//                           {row.original.date}
//                         </p>
//                         <p>
//                           <span className="font-medium">Amount:</span> $
//                           {(row.original.expense?.amount ?? 0).toFixed(2)}
//                         </p>
//                         <p>
//                           <span className="font-medium">Payment Method:</span>{" "}
//                           {row.original.expense?.paymentMethod || "N/A"}
//                         </p>
//                         <p>
//                           <span className="font-medium">Type:</span>{" "}
//                           {row.original.expense?.type || "N/A"}
//                         </p>
//                         <p>
//                           <span className="font-medium">Comments:</span>{" "}
//                           {row.original.expense?.comments || "N/A"}
//                         </p>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//               <div
//                 className="hidden sm:block overflow-x-auto overflow-y-auto border border-gray-600 rounded"
//                 style={{ height: "260px" }}
//               >
//                 <table className="w-full text-white border-collapse">
//                   <thead>
//                     {table.getHeaderGroups().map((headerGroup) => (
//                       <tr key={headerGroup.id}>
//                         {headerGroup.headers.map((header) => (
//                           <th
//                             key={header.id}
//                             className="px-4 py-2 text-left bg-[#29282b] border-b border-gray-600 sticky top-0 z-10 cursor-pointer"
//                             style={{
//                               width: header.column.columnDef.size,
//                               minWidth: header.column.columnDef.size,
//                               maxWidth: header.column.columnDef.size,
//                               whiteSpace: "nowrap",
//                               overflow: "hidden",
//                               textOverflow: "ellipsis",
//                             }}
//                             onClick={header.column.getToggleSortingHandler()}
//                           >
//                             <div className="flex items-center">
//                               {header.column.columnDef.header}
//                               {{
//                                 asc: " ↑",
//                                 desc: " ↓",
//                               }[header.column.getIsSorted()] ?? null}
//                             </div>
//                           </th>
//                         ))}
//                       </tr>
//                     ))}
//                   </thead>
//                   <tbody>
//                     {safeBudgetExpenses.length === 0 ? (
//                       <tr>
//                         <td
//                           colSpan={columns.length}
//                           className="px-4 py-2 text-center text-gray-400 border-b border-gray-600"
//                           style={{ height: "200px" }}
//                         >
//                           No expenses found for this budget. Try adding expenses
//                           or check the budget ID.
//                         </td>
//                       </tr>
//                     ) : (
//                       table.getRowModel().rows.map((row) => (
//                         <tr key={row.id} className="border-b border-gray-600">
//                           {row.getVisibleCells().map((cell) => (
//                             <td
//                               key={cell.id}
//                               className="px-4 py-2"
//                               style={{
//                                 width: cell.column.columnDef.size,
//                                 minWidth: cell.column.columnDef.size,
//                                 maxWidth: cell.column.columnDef.size,
//                                 whiteSpace: "nowrap",
//                                 overflow: "hidden",
//                                 textOverflow: "ellipsis",
//                               }}
//                             >
//                               {cell.column.columnDef.cell
//                                 ? cell.column.columnDef.cell(cell)
//                                 : cell.getValue()}
//                             </td>
//                           ))}
//                         </tr>
//                       ))
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//               <div className="mt-2 flex flex-row justify-between items-center bg-[#0b0b0b] py-2 z-20 relative gap-2">
//                 {/* Centered pagination controls */}
//                 <div className="flex-1 flex justify-center items-center gap-2">
//                   <button
//                     onClick={() => setPageIndex(pageIndex - 1)}
//                     disabled={!table.getCanPreviousPage()}
//                     className={`px-3 py-1 rounded text-sm ${
//                       table.getCanPreviousPage()
//                         ? "bg-[#00DAC6] text-black hover:bg-[#00b8a0]"
//                         : "bg-gray-700 text-gray-400 cursor-not-allowed"
//                     }`}
//                   >
//                     Previous
//                   </button>
//                   <span className="text-white text-sm">
//                     Page{" "}
//                     <strong>
//                       {pageIndex + 1} of {table.getPageCount()}
//                     </strong>
//                   </span>
//                   <button
//                     onClick={() => setPageIndex(pageIndex + 1)}
//                     disabled={!table.getCanNextPage()}
//                     className={`px-3 py-1 rounded text-sm ${
//                       table.getCanNextPage()
//                         ? "bg-[#00DAC6] text-black hover:bg-[#00b8a0]"
//                         : "bg-gray-700 text-gray-400 cursor-not-allowed"
//                     }`}
//                   >
//                     Next
//                   </button>
//                 </div>

//                 {/* Right-aligned page size selector */}
//                 <div className="flex items-center pr-4">
//                   <select
//                     value={pageSize}
//                     onChange={handlePageSizeChange}
//                     className="px-3 py-1 bg-[#29282b] text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-[#00dac6] text-sm"
//                   >
//                     {[5, 10, 20].map((size) => (
//                       <option key={size} value={size}>
//                         Show {size}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//       <div className="w-[calc(100vw-370px)] h-[50px] bg-[#1b1b1b]"></div>
//       <style>
//         {`
//           .overflow-y-auto::-webkit-scrollbar {
//             width: 4px;
//           }
//           .overflow-y-auto::-webkit-scrollbar-track {
//             background: #1b1b1b;
//           }
//           .overflow-y-auto::-webkit-scrollbar-thumb {
//             background: #00dac6;
//             border-radius: 4px;
//           }
//           .overflow-y-auto::-webkit-scrollbar-thumb:hover {
//             background: #00b8a0;
//           }
//           .overflow-x-auto::-webkit-scrollbar {
//             height: 4px;
//           }
//           .overflow-x-auto::-webkit-scrollbar-track {
//             background: #1b1b1b;
//           }
//           .overflow-x-auto::-webkit-scrollbar-thumb {
//             background: #00dac6;
//             border-radius: 4px;
//           }
//           .overflow-x-auto::-webkit-scrollbar-thumb:hover {
//             background: #00b8a0;
//           }
//         `}
//       </style>
//     </div>
//   );
// };

// export default BudgetReport;
