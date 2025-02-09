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
import EditExpense from "./pages/EditExpenses/EditExpense"
import ReportsGeneration from "./pages/ReportsGeneration";

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
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateExpenses />} />
        <Route path="/edit/:id" element={<EditExpense />} />
        <Route path="/reports" element={<ReportsGeneration />} />
        {/* Add any other routes here that need protection */}
      </Routes>
    </div>
  );
}

export default App;
