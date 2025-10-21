import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import "./App.css";
import Authentication from "./pages/Authentication/Authentication";
import HomePage from "./pages/Home/HomePage";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getProfileAction } from "./Redux/Auth/auth.action";
import Parent from "./pages/DetailedExpensesTable/Parent";
import Loader from "./components/Loaders/Loader";
import CreateExpenses from "./components/CreateExpenses/CreateExpenses";
import ReportsGeneration from "./pages/ReportsGeneration";
import Upload from "./pages/Fileupload/Upload"; // Existing expenses upload
import UploadBills from "./pages/Fileupload/UploadBills"; // New bills upload
import Home from "./pages/Landingpage/Home";
import HomeContent from "./pages/Landingpage/HomeContent";
import ExpensesContent from "./pages/Landingpage/ExpensesContent";
import TransactionsContent from "./pages/Landingpage/TransactionsContent";
import CreditDueContent from "./pages/Landingpage/CreditDueContent";
import Budget from "./pages/Landingpage/Budget";
import EditExpense from "./pages/Landingpage/EditExpense";
import NewExpense from "./pages/Landingpage/NewExpense";
import Profile from "./pages/Landingpage/Profile";
import NewBudget from "./pages/Landingpage/NewBudget";
import EditBudget from "./pages/Landingpage/EditBudget";
import Reports from "./pages/Landingpage/Reports";
import Cashflow from "./pages/expenses-view/CashFlow";
import CalendarView from "./pages/Landingpage/CalendarView";
import DayTransactionsView from "./pages/Landingpage/DayTransactionsView";
import CategoryFlow from "./pages/Landingpage/CategoryFlow";
import CreateCategory from "./pages/Landingpage/CreateCategory";
import EditCategory from "./pages/Landingpage/EditCategory";
import Utilities from "./pages/Landingpage/Utilities";
import Friends from "./pages/Landingpage/Friends";
import ExpensesView from "./pages/Landingpage/ExpensesView";

import PaymentMethodFlow from "./pages/Landingpage/PaymentMethodFlow";
import CreatePaymentMethod from "./pages/Landingpage/CreatePaymentMethod";
import EditPaymentMethod from "./pages/Landingpage/EditPaymentMethod";

import CreateBill from "./pages/Landingpage/CreateBill";
import EditBill from "./pages/Landingpage/EditBill";
import BillCalendarView from "./pages/Landingpage/BillCalendarView";
import DayBillsView from "./pages/Landingpage/DayBillsView";
import AuditLogs from "./pages/Landingpage/AuditLogs";
import GlobalErrorHandler from "./pages/Landingpage/Errors/GlobalErrorHandler";
import Groups from "./pages/Landingpage/Groups";
import CreateGroup from "./pages/Landingpage/CreateGroup";

import GroupDetail from "./pages/Landingpage/GroupDetail";
import Chat from "./services/Chat";
import ExpenseReport from "./pages/Landingpage/ExpenseReport";
import ExpenseDashboard from "./features/dashboard/ExpenseDashboard";
import CategoryReport from "./pages/Landingpage/Category Report/CategoryReport";
import PaymentMethodsReport from "./pages/Landingpage/Payment Report/PaymentReport";
import BudgetReport from "./pages/Landingpage/Budget Report/BudgetReport";
import AdminDashboard from "./pages/Landingpage/Admin/AdminDashboard/AdminDashboard";
import InvestmentDashboard from "./pages/Landingpage/Investement/InvestementDashboard";
import Bill from "./pages/Landingpage/Bills/Bill";
import BudgetDashboard from "./pages/Landingpage/Budget/BudgetDashboard";
// import Bill from "./pages/Landingpage/Bills/Bill";
function App() {
  const { auth } = useSelector((store) => store);
  const dispatch = useDispatch();
  const jwt = localStorage.getItem("jwt");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (jwt) {
      dispatch(getProfileAction(jwt)).finally(() => setLoading(false));

      navigate("/");
    } else {
      setLoading(false);
    }
  }, [jwt, dispatch]);

  if (loading) {
    return <Loader />;
  }

  // Redirect if JWT is invalid or not present
  if (!jwt || !auth.user) {
    return (
      <Routes>
        <Route path="/*" element={<Authentication />} />
      </Routes>
    );
  }

  return (
    <>
      <div className="">
        <Routes>
          {/* Other Routes */}

          <Route path="/" element={<Home />}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="/chats" element={<Chat />} />
            <Route path="/component1" element={<AdminDashboard />} />
            <Route path="/component2" element={<InvestmentDashboard />} />
            {/* <Route path="home" element={<HomeContent />} /> */}

            <Route path="dashboard" element={<ExpenseDashboard />} />

            {/* <Route path="home" element={<Loader />} /> */}
            <Route path="groups">
              <Route index element={<Groups />} />
              <Route path="create" element={<CreateGroup />} />
              <Route path=":id" element={<GroupDetail />} />
            </Route>
            <Route path="profile" element={<Profile />} />
            <Route path="friends" element={<Friends />} />
            <Route path="payment-method">
              <Route index element={<PaymentMethodFlow />} />
              <Route path=":friendId" element={<PaymentMethodFlow />} />
              <Route path="reports" element={<PaymentMethodsReport />} />
              <Route
                path="reports/:friendId"
                element={<PaymentMethodsReport />}
              />
              <Route path="create" element={<CreatePaymentMethod />} />
              <Route
                path="create/:friendId"
                element={<CreatePaymentMethod />}
              />
              <Route path="edit/:id" element={<EditPaymentMethod />} />
              <Route
                path="edit/:id/friend/:friendId"
                element={<EditPaymentMethod />}
              />
            </Route>

            <Route path="bill">
              <Route index element={<Bill />} />
              <Route path=":friendId" element={<Bill />} />
              <Route path="report" element={<ExpenseReport />} />
              <Route path="report/:friendId" element={<ExpenseReport />} />
              <Route path="upload" element={<UploadBills />} />
              <Route path="upload/:friendId" element={<UploadBills />} />
              <Route path="create" element={<CreateBill />} />
              <Route path="create/:friendId" element={<CreateBill />} />
              <Route path="edit/:id" element={<EditBill />} />
              <Route path="edit/:id/friend/:friendId" element={<EditBill />} />
              <Route path="calendar" element={<BillCalendarView />} />
              <Route path="calendar/:friendId" element={<BillCalendarView />} />
            </Route>

            <Route path="friends">
              <Route index element={<Friends />} />
              {/* Use unified Cashflow component for friend expenses */}
              <Route path="expenses/:friendId" element={<Cashflow />} />
            </Route>
            <Route path="all" element={<Utilities />} />

            <Route path="upload">
              <Route path="expenses" element={<Upload />} />
              <Route path="categories" element={<Upload />} />
              <Route path="categories/:friendId" element={<Upload />} />
              <Route path="payments" element={<Upload />} />
              <Route path="payments/:friendId" element={<Upload />} />
              <Route path="expenses/:friendId" element={<Upload />} />
            </Route>
            {/* Nested expenses route */}
            <Route path="expenses">
              <Route index element={<Cashflow />} />
              <Route path="create" element={<NewExpense />} />
              <Route path="create/:friendId" element={<NewExpense />} />
              <Route path="edit/:id" element={<EditExpense />} />
              <Route
                path="edit/:id/friend/:friendId"
                element={<EditExpense />}
              />
            </Route>
            <Route path="category-flow">
              <Route index element={<CategoryFlow />} />
              <Route path=":friendId" element={<CategoryFlow />} />
              <Route path="create" element={<CreateCategory />} />
              <Route path="create/:friendId" element={<CreateCategory />} />
              <Route path="reports" element={<CategoryReport />} />
              <Route path="reports/:friendId" element={<CategoryReport />} />
              <Route path="edit/:id" element={<EditCategory />} />
              <Route
                path="edit/:id/friend/:friendId"
                element={<EditCategory />}
              />
              <Route
                path="edit/:id/friend/:friendId"
                element={<EditCategory />}
              />
            </Route>

            <Route path="transactions">
              <Route index element={<TransactionsContent />} />
              <Route path=":friendId" element={<TransactionsContent />} />
            </Route>
            <Route path="insights">
              <Route index element={<CreditDueContent />} />
              <Route path=":friendId" element={<CreditDueContent />} />
            </Route>
            <Route path="reports">
              <Route index element={<Reports />} />
              <Route path=":friendId" element={<Reports />} />
            </Route>
            <Route path="cashflow">
              {/* Directly render Cashflow for both self and friend contexts */}
              <Route index element={<ExpensesView />} />
              <Route path=":friendId" element={<ExpensesView />} />
            </Route>
            <Route path="budget">
              <Route index element={<Budget />} />
              {/* <Route index element={<BudgetDashboard />} /> */}
              <Route path=":friendId" element={<Budget />} />
              <Route path="create" element={<NewBudget />} />
              <Route path="create/:friendId" element={<NewBudget />} />
              <Route path="edit/:id" element={<EditBudget />} />
              <Route
                path="edit/:id/friend/:friendId"
                element={<EditBudget />}
              />
              {/* <Route path="report/:id" element={<BudgetReport />} /> */}
              <Route path="report/:id" element={<BudgetReport />} />
              <Route
                path="report/:id/friend/:friendId"
                element={<BudgetReport />}
              />
            </Route>
            <Route path="/calendar-view">
              <Route index element={<CalendarView />} />
              <Route path=":friendId" element={<CalendarView />} />
            </Route>
            <Route path="/day-view">
              <Route path=":date" element={<DayTransactionsView />} />
              <Route
                path=":date/friend/:friendId"
                element={<DayTransactionsView />}
              />
            </Route>
            <Route path="/bill-day-view">
              <Route path=":date" element={<DayBillsView />} />
              <Route path=":date/friend/:friendId" element={<DayBillsView />} />
            </Route>
          </Route>

          {/* Other Routes */}
        </Routes>
      </div>
      <GlobalErrorHandler />
    </>
  );
}

export default App;
