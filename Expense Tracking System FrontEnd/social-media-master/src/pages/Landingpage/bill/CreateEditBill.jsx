import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import dayjs from "dayjs";

import BillForm from "./BillForm";
import { getListOfBudgetsById } from "../../../Redux/Budget/budget.action";
import { fetchCategories } from "../../../Redux/Category/categoryActions";
import {
  createBill,
  updateBill,
  getBillById,
} from "../../../Redux/Bill/bill.action";
import { fetchAllPaymentMethods } from "../../../Redux/Payment Method/paymentMethod.action";

const CreateEditBill = ({
  onClose,
  onSuccess,
  mode = "create",
  billId = null,
}) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const dateFromQuery = searchParams.get("date");
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const dispatch = useDispatch();
  const { friendId } = useParams();

  const { loading: billLoading } = useSelector((state) => state.bills || {});
  const [isLoading, setIsLoading] = useState(mode === "edit" && billId);

  const [billData, setBillData] = useState({
    name: "",
    description: "",
    amount: "",
    paymentMethod: "cash",
    type: "loss",
    date: dateFromQuery || today,
    categoryId: "",
  });

  const [expenses, setExpenses] = useState([]);
  const [selectedBudgets, setSelectedBudgets] = useState([]);
  const [errors, setErrors] = useState({});

  // Load bill data for edit mode
  useEffect(() => {
    if (mode === "edit" && billId) {
      const loadBillData = async () => {
        try {
          setIsLoading(true);
          const result = await dispatch(getBillById(billId, friendId || ""));
          if (result && result.payload) {
            const bill = result.payload;
            setBillData({
              name: bill.name || "",
              description: bill.description || "",
              amount: bill.amount?.toString() || "",
              paymentMethod: bill.paymentMethod || "cash",
              type: bill.type || "loss",
              date: bill.date || today,
              categoryId: bill.categoryId || "",
            });
            setExpenses(bill.expenses || []);
            // Set selected budgets if available
            if (bill.budgetIds && Array.isArray(bill.budgetIds)) {
              // You'll need to fetch budget details based on IDs
              // This is a simplified version
              setSelectedBudgets(bill.budgetIds);
            }
          }
        } catch (error) {
          console.error("Error loading bill data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      loadBillData();
    }
  }, [mode, billId, dispatch, friendId, today]);

  // Fetch initial data
  useEffect(() => {
    dispatch(getListOfBudgetsById(billData.date, friendId || ""));
    dispatch(fetchCategories(friendId || ""));
    dispatch(fetchAllPaymentMethods(friendId || ""));
  }, [dispatch, billData.date, friendId]);

  const handleSubmit = async (formData) => {
    const newErrors = {};
    if (!formData.name) newErrors.name = true;
    if (!formData.date) newErrors.date = true;
    if (!formData.type) newErrors.type = true;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const billPayload = {
      ...formData,
      expenses: expenses,
    };

    try {
      if (mode === "edit") {
        await dispatch(
          updateBill({ ...billPayload, id: billId }, friendId || "")
        );
      } else {
        await dispatch(createBill(billPayload, friendId || ""));
      }

      const successMessage =
        mode === "edit"
          ? "Bill updated successfully!"
          : "Bill created successfully!";

      if (typeof onClose === "function") {
        onClose();
      } else {
        navigate(-1, {
          state: { toastMessage: successMessage },
        });
      }
      if (onSuccess) {
        onSuccess(successMessage);
      }
    } catch (error) {
      console.error(
        `Error ${mode === "edit" ? "updating" : "creating"} bill:`,
        error
      );
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress sx={{ color: "#00DAC6" }} />
      </div>
    );
  }

  return (
    <>
      <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div>
      <div
        className="flex flex-col relative create-bill-container"
        style={{
          width: "calc(100vw - 370px)",
          height: "calc(100vh - 100px)",
          backgroundColor: "rgb(11, 11, 11)",
          borderRadius: "8px",
          border: "1px solid rgb(0, 0, 0)",
          padding: "20px",
          overflowY: "auto",
        }}
      >
        <div className="w-full flex justify-between items-center mb-1">
          <p className="text-white font-extrabold text-4xl">
            {mode === "edit" ? "Edit Bill" : "Create Bill"}
          </p>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-12 h-12 text-[32px] font-bold bg-[#29282b] rounded mt-[-10px]"
            style={{ color: "#00dac6" }}
          >
            ×
          </button>
        </div>
        <hr className="border-t border-gray-600 w-full mt-[-4px]" />

        <BillForm
          billData={billData}
          setBillData={setBillData}
          expenses={expenses}
          setExpenses={setExpenses}
          selectedBudgets={selectedBudgets}
          setSelectedBudgets={setSelectedBudgets}
          errors={errors}
          setErrors={setErrors}
          onSubmit={handleSubmit}
          isLoading={billLoading}
          friendId={friendId}
          mode={mode}
        />
      </div>
    </>
  );
};

export default CreateEditBill;
