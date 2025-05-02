import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import FileUploadModal from "../Fileupload/FileUploadModal";
import { TextField, Box, Alert, CircularProgress } from "@mui/material";
import {
  getExpensesAction,
  saveExpenses,
} from "../../Redux/Expenses/expense.action";
import ExpensesTable from "../Landingpage/ExpensesTable";
import { useNavigate } from "react-router";

const Upload = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setModalOpen] = useState(false);
  const [uploadedData, setUploadedData] = useState([]);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const {
    success = false,
    data = [],
    error = null,
  } = useSelector((state) => state.fileUpload || {});

  const openModal = () => {
    setModalOpen(true);
    setIsLoading(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsLoading(false);
  };

  const hideTable = () => {
    setIsTableVisible(false);
    setUploadedData([]);
    setSearchText("");
  };

  const handleSave = () => {
    console.log("handling the save");
    dispatch(saveExpenses(uploadedData));
    navigate("/");
  };

  useEffect(() => {
    if (success && data?.length) {
      console.log("Uploaded data:", data);
      setUploadedData(data);
      setIsTableVisible(true);
      setIsLoading(false);
      dispatch(getExpensesAction());
    }
    if (error) {
      setIsLoading(false);
    }
  }, [success, data, error, dispatch]);

  const filteredExpenses = useMemo(() => {
    if (!searchText) return uploadedData;
    const filtered = uploadedData.filter(
      (item) =>
        item?.expense?.expenseName &&
        item.expense.expenseName
          .toLowerCase()
          .includes(searchText.toLowerCase())
    );
    console.log("Filtered expenses:", filtered);
    return filtered;
  }, [uploadedData, searchText]);

  return (
    <div className="min-h-screen flex flex-col bg-[#1b1b1b]  sm:px-0">
      <div className="w-full sm:w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b] mx-auto"></div>

      <div
        className="flex flex-col flex-grow   sm:p-6 w-full sm:w-[calc(100vw-400px)] "
        style={{
          backgroundColor: "rgb(11, 11, 11)",
          borderRadius: "8px",
          boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
          border: "1px solid rgb(0, 0, 0)",
          opacity: 1,
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || "Failed to upload file. Please try again."}
          </Alert>
        )}

        {isTableVisible && uploadedData.length > 0 ? (
          <div className="relative">
            <Box sx={{ mb: 2 }}>
              <TextField
                label="Search by Expense Name"
                variant="outlined"
                size="small"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{
                  bgcolor: "#2a2a2a",
                  input: { color: "#fff" },
                  label: { color: "#fff" },
                  width: {
                    xs: "100%", // full width on small screens
                    sm: "60%", // original 60% width on larger
                  },
                  height: "45px",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#14b8a6",
                    },
                    "&:hover fieldset": {
                      borderColor: "#14b8a6",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#14b8a6",
                    },
                  },
                }}
              />
            </Box>

            <ExpensesTable expenses={filteredExpenses} />

            <div className="flex flex-col sm:flex-row justify-between gap-2 mt-[2px]">
              <button
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 z-10"
                onClick={hideTable}
                title="Close Table"
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 z-10"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full">
            {isLoading ? (
              <CircularProgress color="primary" />
            ) : (
              <div className="relative w-full h-[60vh] sm:h-[80vh]">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <button
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700"
                    onClick={openModal}
                  >
                    Upload File
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <FileUploadModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onUploadStart={() => setIsLoading(true)}
        />
      </div>

      <div className="w-full sm:w-[calc(100vw-400px)] h-[50px] bg-[#1b1b1b] mx-auto"></div>
    </div>
  );
};

export default Upload;
