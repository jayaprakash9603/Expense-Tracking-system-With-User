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
import Upload from "./pages/Fileupload/Upload"; // Import Upload component
import Home from "./pages/Landingpage/Home";
import HomeContent from "./pages/Landingpage/HomeContent";
import ExpensesContent from "./pages/Landingpage/ExpensesContent";
import TransactionsContent from "./pages/Landingpage/TransactionsContent";
import CreditDueContent from "./pages/Landingpage/CreditDueContent";
import History from "./pages/Landingpage/History";
import Budget from "./pages/Landingpage/Budget";
import EditExpense from "./pages/Landingpage/EditExpense";
import NewExpense from "./pages/Landingpage/NewExpense";

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
    <div className="">
      <Routes>
        <Route path="/main" element={<HomePage />} />
        <Route path="/" element={<Home />}>
          <Route index element={<Navigate to="/home" />} />
          <Route path="home" element={<HomeContent />} />

          <Route path="upload" element={<Upload />} />
          {/* Nested expenses route */}
          <Route path="expenses">
            <Route index element={<ExpensesContent />} />
            <Route path="create" element={<NewExpense />} />
            <Route path="edit/:id" element={<EditExpense />} />
          </Route>

          <Route path="transactions" element={<TransactionsContent />} />
          <Route path="credit-due" element={<CreditDueContent />} />
          <Route path="settings" element={<History />} />
          <Route path="budget" element={<Budget />} />
        </Route>

        <Route path="/create" element={<CreateExpenses />} />
        <Route path="/reports" element={<ReportsGeneration />} />
      </Routes>
    </div>
  );
}

export default App;
