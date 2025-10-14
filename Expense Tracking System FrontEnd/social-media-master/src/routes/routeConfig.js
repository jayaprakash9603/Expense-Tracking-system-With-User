import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";

const Home = lazy(() => import("../pages/Landingpage/Home"));
const Chat = lazy(() => import("../services/Chat"));
const ExpenseDashboard = lazy(() =>
  import("../pages/Landingpage/ExpenseDashboard")
);

const Groups = lazy(() => import("../pages/Landingpage/Groups"));
const CreateGroup = lazy(() => import("../pages/Landingpage/CreateGroup"));
const GroupDetail = lazy(() => import("../pages/Landingpage/GroupDetail"));

const Profile = lazy(() => import("../pages/Landingpage/Profile"));
const Friends = lazy(() => import("../pages/Landingpage/Friends"));

const PaymentMethodFlow = lazy(() =>
  import("../pages/Landingpage/PaymentMethodFlow")
);
const CreatePaymentMethod = lazy(() =>
  import("../pages/Landingpage/CreatePaymentMethod")
);
const EditPaymentMethod = lazy(() =>
  import("../pages/Landingpage/EditPaymentMethod")
);
const PaymentMethodsReport = lazy(() =>
  import("../pages/Landingpage/Payment Report/PaymentReport")
);

const Bill = lazy(() => import("../pages/Landingpage/Bills/Bill"));
const ExpenseReport = lazy(() => import("../pages/Landingpage/ExpenseReport"));
const UploadBills = lazy(() => import("../pages/Fileupload/UploadBills"));
const CreateBill = lazy(() => import("../pages/Landingpage/CreateBill"));
const EditBill = lazy(() => import("../pages/Landingpage/EditBill"));
const BillCalendarView = lazy(() =>
  import("../pages/Landingpage/BillCalendarView")
);

const Upload = lazy(() => import("../pages/Fileupload/Upload"));

const Cashflow = lazy(() => import("../pages/Landingpage/CashFlow"));
const NewExpense = lazy(() => import("../pages/Landingpage/NewExpense"));
const EditExpense = lazy(() => import("../pages/Landingpage/EditExpense"));

const CategoryFlow = lazy(() => import("../pages/Landingpage/CategoryFlow"));
const CreateCategory = lazy(() =>
  import("../pages/Landingpage/CreateCategory")
);
const EditCategory = lazy(() => import("../pages/Landingpage/EditCategory"));
const CategoryReport = lazy(() =>
  import("../pages/Landingpage/Category Report/CategoryReport")
);

const TransactionsContent = lazy(() =>
  import("../pages/Landingpage/TransactionsContent")
);
const CreditDueContent = lazy(() =>
  import("../pages/Landingpage/CreditDueContent")
);
const Reports = lazy(() => import("../pages/Landingpage/Reports"));
const ExpensesView = lazy(() => import("../pages/Landingpage/ExpensesView"));

const Budget = lazy(() => import("../pages/Landingpage/Budget"));
const NewBudget = lazy(() => import("../pages/Landingpage/NewBudget"));
const EditBudget = lazy(() => import("../pages/Landingpage/EditBudget"));
const BudgetReport = lazy(() =>
  import("../pages/Landingpage/Budget Report/BudgetReport")
);

const CalendarView = lazy(() => import("../pages/Landingpage/CalendarView"));
const DayTransactionsView = lazy(() =>
  import("../pages/Landingpage/DayTransactionsView")
);
const DayBillsView = lazy(() => import("../pages/Landingpage/DayBillsView"));

const AdminDashboard = lazy(() =>
  import("../pages/Landingpage/Admin/AdminDashboard/AdminDashboard")
);
const InvestmentDashboard = lazy(() =>
  import("../pages/Landingpage/Investement/InvestementDashboard")
);
const Utilities = lazy(() => import("../pages/Landingpage/Utilities"));
const NotFound = lazy(() => import("../components/Not Found/NotFound"));
export const protectedRoutes = [
  {
    path: "/",
    element: <Home />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <ExpenseDashboard /> },
      { path: "chats", element: <Chat /> },
      { path: "component1", element: <AdminDashboard /> },
      { path: "component2", element: <InvestmentDashboard /> },

      {
        path: "groups",
        children: [
          { index: true, element: <Groups /> },
          { path: "create", element: <CreateGroup /> },
          { path: ":id", element: <GroupDetail /> },
        ],
      },

      {
        path: "friends",
        children: [
          { index: true, element: <Friends /> },
          { path: "expenses/:friendId", element: <Cashflow /> },
        ],
      },

      { path: "profile", element: <Profile /> },

      {
        path: "payment-method",
        children: [
          { index: true, element: <PaymentMethodFlow /> },
          { path: ":friendId", element: <PaymentMethodFlow /> },
          { path: "reports", element: <PaymentMethodsReport /> },
          { path: "reports/:friendId", element: <PaymentMethodsReport /> },
          { path: "create", element: <CreatePaymentMethod /> },
          { path: "create/:friendId", element: <CreatePaymentMethod /> },
          { path: "edit/:id", element: <EditPaymentMethod /> },
          { path: "edit/:id/friend/:friendId", element: <EditPaymentMethod /> },
        ],
      },

      {
        path: "bill",
        children: [
          { index: true, element: <Bill /> },
          { path: ":friendId", element: <Bill /> },
          { path: "report", element: <ExpenseReport /> },
          { path: "report/:friendId", element: <ExpenseReport /> },
          { path: "upload", element: <UploadBills /> },
          { path: "upload/:friendId", element: <UploadBills /> },
          { path: "create", element: <CreateBill /> },
          { path: "create/:friendId", element: <CreateBill /> },
          { path: "edit/:id", element: <EditBill /> },
          { path: "edit/:id/friend/:friendId", element: <EditBill /> },
          { path: "calendar", element: <BillCalendarView /> },
          { path: "calendar/:friendId", element: <BillCalendarView /> },
        ],
      },

      {
        path: "upload",
        children: [
          { path: "expenses", element: <Upload /> },
          { path: "expenses/:friendId", element: <Upload /> },
          { path: "categories", element: <Upload /> },
          { path: "categories/:friendId", element: <Upload /> },
          { path: "payments", element: <Upload /> },
          { path: "payments/:friendId", element: <Upload /> },
        ],
      },

      {
        path: "expenses",
        children: [
          { index: true, element: <Cashflow /> },
          { path: "create", element: <NewExpense /> },
          { path: "create/:friendId", element: <NewExpense /> },
          { path: "edit/:id", element: <EditExpense /> },
          { path: "edit/:id/friend/:friendId", element: <EditExpense /> },
        ],
      },

      {
        path: "category-flow",
        children: [
          { index: true, element: <CategoryFlow /> },
          { path: ":friendId", element: <CategoryFlow /> },
          { path: "create", element: <CreateCategory /> },
          { path: "create/:friendId", element: <CreateCategory /> },
          { path: "reports", element: <CategoryReport /> },
          { path: "reports/:friendId", element: <CategoryReport /> },
          { path: "edit/:id", element: <EditCategory /> },
          { path: "edit/:id/friend/:friendId", element: <EditCategory /> },
        ],
      },

      {
        path: "transactions",
        children: [
          { index: true, element: <TransactionsContent /> },
          { path: ":friendId", element: <TransactionsContent /> },
        ],
      },

      {
        path: "insights",
        children: [
          { index: true, element: <CreditDueContent /> },
          { path: ":friendId", element: <CreditDueContent /> },
        ],
      },

      {
        path: "reports",
        children: [
          { index: true, element: <Reports /> },
          { path: ":friendId", element: <Reports /> },
        ],
      },

      {
        path: "cashflow",
        children: [
          { index: true, element: <ExpensesView /> },
          { path: ":friendId", element: <ExpensesView /> },
        ],
      },

      {
        path: "budget",
        children: [
          { index: true, element: <Budget /> },
          { path: ":friendId", element: <Budget /> },
          { path: "create", element: <NewBudget /> },
          { path: "create/:friendId", element: <NewBudget /> },
          { path: "edit/:id", element: <EditBudget /> },
          { path: "edit/:id/friend/:friendId", element: <EditBudget /> },
          { path: "report/:id", element: <BudgetReport /> },
          { path: "report/:id/friend/:friendId", element: <BudgetReport /> },
        ],
      },

      {
        path: "calendar-view",
        children: [
          { index: true, element: <CalendarView /> },
          { path: ":friendId", element: <CalendarView /> },
        ],
      },

      {
        path: "day-view",
        children: [
          { path: ":date", element: <DayTransactionsView /> },
          { path: ":date/friend/:friendId", element: <DayTransactionsView /> },
        ],
      },

      {
        path: "bill-day-view",
        children: [
          { path: ":date", element: <DayBillsView /> },
          { path: ":date/friend/:friendId", element: <DayBillsView /> },
        ],
      },

      { path: "all", element: <Utilities /> },

      { path: "not-found", element: <NotFound /> },

      { path: "*", element: <NotFound /> },
    ],
  },
];

// Recursive builder
export function buildRoutes(nodes) {
  return nodes.map((r, i) => {
    const { children, index, path, element } = r;
    return (
      <Route
        key={path || "index-" + i}
        index={index}
        path={path}
        element={element}
      >
        {children && buildRoutes(children)}
      </Route>
    );
  });
}
