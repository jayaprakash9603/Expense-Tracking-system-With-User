import React, { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { fetchAllPaymentMethods } from "../../../Redux/Payment Method/paymentMethod.action";

const PaymentMethodAutocomplete = ({ value, onChange, billType, friendId }) => {
  const dispatch = useDispatch();
  const [localPaymentMethods, setLocalPaymentMethods] = useState([]);
  const [localPaymentMethodsLoading, setLocalPaymentMethodsLoading] =
    useState(false);
  const [localPaymentMethodsError, setLocalPaymentMethodsError] =
    useState(null);

  const formatPaymentMethodName = (name) => {
    switch (name.toLowerCase()) {
      case "cash":
        return "Cash";
      case "creditNeedToPaid":
        return "Credit Due";
      case "creditPaid":
        return "Credit Paid";
      default:
        return name
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .trim();
    }
  };

  const defaultPaymentMethods = [
    { name: "cash", label: "Cash", type: "expense" },
    { name: "creditNeedToPaid", label: "Credit Due", type: "expense" },
    { name: "creditPaid", label: "Credit Paid", type: "expense" },
    { name: "cash", label: "Cash", type: "income" },
    { name: "creditPaid", label: "Credit Paid", type: "income" },
    { name: "creditNeedToPaid", label: "Credit Due", type: "income" },
  ];

  // Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLocalPaymentMethodsLoading(true);
        setLocalPaymentMethodsError(null);

        const resultAction = await dispatch(
          fetchAllPaymentMethods(friendId || "")
        );

        if (resultAction) {
          const paymentMethodsData = resultAction || [];
          setLocalPaymentMethods(
            Array.isArray(paymentMethodsData) ? paymentMethodsData : []
          );
        } else {
          const errorMessage = "Failed to fetch payment methods";
          setLocalPaymentMethodsError(errorMessage);
        }
      } catch (error) {
        setLocalPaymentMethodsError(
          error.message || "Failed to fetch payment methods"
        );
      } finally {
        setLocalPaymentMethodsLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [dispatch, friendId]);

  // Process payment methods based on bill type
  const processedPaymentMethods = useMemo(() => {
    let availablePaymentMethods = [];

    if (Array.isArray(localPaymentMethods) && localPaymentMethods.length > 0) {
      const filteredMethods = localPaymentMethods.filter((pm) => {
        if (billType === "loss") {
          return pm.type && pm.type.toLowerCase() === "expense";
        } else if (billType === "gain") {
          return pm.type && pm.type.toLowerCase() === "income";
        }
        return true;
      });

      availablePaymentMethods = filteredMethods.map((pm) => ({
        value: pm.name,
        label: formatPaymentMethodName(pm.name),
        ...pm,
      }));
    }

    if (availablePaymentMethods.length === 0) {
      const defaultMethodsForType = defaultPaymentMethods.filter((pm) => {
        if (billType === "loss") {
          return pm.type === "expense";
        } else if (billType === "gain") {
          return pm.type === "income";
        }
        return true;
      });

      availablePaymentMethods = defaultMethodsForType.map((pm) => ({
        value: pm.name,
        label: pm.label,
        type: pm.type,
      }));
    }

    return availablePaymentMethods;
  }, [localPaymentMethods, billType]);

  // Update payment method when type changes and options are available
  useEffect(() => {
    if (processedPaymentMethods.length > 0) {
      const currentMethodValid = processedPaymentMethods.some(
        (pm) => pm.value === value
      );

      if (!currentMethodValid) {
        onChange(processedPaymentMethods[0]?.value || "cash");
      }
    }
  }, [processedPaymentMethods, value, onChange]);

  const handleChange = (event, newValue) => {
    onChange(newValue ? newValue.value : "cash");
  };

  return (
    <div className="flex flex-col w-full">
      {/* Mobile/Tablet: Stack vertically, Desktop: Side by side */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <label
          htmlFor="paymentMethod"
          className="text-white text-sm sm:text-base font-semibold sm:min-w-[150px] sm:w-[150px]"
        >
          Payment Method
        </label>
        <div className="flex-1 w-full">
          <Autocomplete
            autoHighlight
            options={processedPaymentMethods}
            getOptionLabel={(option) => option.label || option}
            value={
              processedPaymentMethods.find((pm) => pm.value === value) || null
            }
            onChange={handleChange}
            loading={localPaymentMethodsLoading}
            noOptionsText={
              billType
                ? `No ${
                    billType === "loss" ? "expense" : "income"
                  } payment methods available`
                : "No payment methods available"
            }
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select payment method"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {localPaymentMethodsLoading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    backgroundColor: "#29282b",
                    color: "#fff",
                    height: { xs: "48px", sm: "56px" },
                    fontSize: { xs: "14px", sm: "16px" },
                  },
                  "& .MuiInputBase-input": {
                    color: "#fff",
                    "&::placeholder": {
                      color: "#9ca3af",
                      opacity: 1,
                    },
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgb(75, 85, 99)",
                      borderWidth: "1px",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgb(75, 85, 99)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#00dac6",
                      borderWidth: "2px",
                    },
                  },
                }}
              />
            )}
            sx={{
              width: "100%",
              maxWidth: { xs: "100%", sm: "300px" },
            }}
          />
        </div>
      </div>

      {localPaymentMethodsError && (
        <div className="text-red-400 text-xs mt-1 ml-0 sm:ml-[154px]">
          Error: {localPaymentMethodsError}
        </div>
      )}
    </div>
  );
};

export default PaymentMethodAutocomplete;
