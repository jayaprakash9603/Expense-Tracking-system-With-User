import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import FileUploadModal from "../Fileupload/FileUploadModal";
import {
  TextField,
  Box,
  Alert,
  CircularProgress,
  Backdrop,
  IconButton,
} from "@mui/material";
import {
  getExpensesAction,
  saveExpenses,
  startTrackedSaveExpenses,
} from "../../Redux/Expenses/expense.action";
import ExpensesTable from "../Landingpage/ExpensesTable";
import { useNavigate, useParams } from "react-router";
import PercentageLoader from "../../components/Loaders/PercentageLoader";
import { api, API_BASE_URL } from "../../config/api";

const Upload = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setModalOpen] = useState(false);
  const [uploadedData, setUploadedData] = useState([]);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [saveProgress, setSaveProgress] = useState(0);
  const [saveProcessed, setSaveProcessed] = useState(0);
  const [saveTotal, setSaveTotal] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const navigate = useNavigate();

  const { friendId } = useParams();

  const {
    success = false,
    data = [],
    error = null,
  } = useSelector((state) => state.fileUpload || {});

  const openModal = () => {
    setModalOpen(true);
    setIsLoading(false);
    setUploadProgress(0);
    setLoadingMessage("");
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsLoading(false);
    setUploadProgress(0);
    setLoadingMessage("");
  };

  const hideTable = () => {
    setIsTableVisible(false);
    setUploadedData([]);
    setSearchText("");
  };

  const handleSave = async () => {
    setIsLoading(true);
    setLoadingMessage("Saving expenses...");
    setSaveProgress(0);
    setSaveProcessed(0);
    setSaveTotal(uploadedData?.length || 0);

    try {
      const jobId = await dispatch(
        startTrackedSaveExpenses(uploadedData, friendId)
      );

      // Polling loop
      const poll = async () => {
        try {
          const res = await api.get(
            `/api/expenses/add-multiple/progress/${jobId}`
          );
          // Support either direct payload or wrapped under `data`
          const payload = res?.data?.data ?? res?.data ?? {};
          const percent =
            typeof payload.percent === "number"
              ? payload.percent
              : typeof payload.percentage === "number"
              ? payload.percentage
              : 0;
          const processed = payload.processed ?? payload.completed ?? 0;
          const total = payload.total ?? payload.count ?? 0;
          const status = payload.status ?? payload.state ?? "RUNNING";

          setSaveProgress(Math.max(0, Math.min(100, Number(percent) || 0)));
          setSaveProcessed(Number(processed) || 0);
          setSaveTotal(Number(total) || 0);

          if (status === "COMPLETED") {
            setIsLoading(false);
            setLoadingMessage("");
            // Refresh list
            dispatch(getExpensesAction("desc", friendId));
            friendId
              ? navigate(`/friends/expenses/${friendId}`)
              : navigate("/expenses");
            return;
          }
          if (status === "FAILED") {
            setIsLoading(false);
            setLoadingMessage("Failed to save expenses.");
            return;
          }
          // keep polling
          setTimeout(poll, 750);
        } catch (e) {
          // backoff and retry a few times if wanted; keep simple
          setTimeout(poll, 1500);
        }
      };
      poll();
    } catch (e) {
      setIsLoading(false);
      setLoadingMessage("Failed to start save.");
    }
  };

  const handleUploadStart = () => {
    setIsLoading(true);
    setUploadProgress(0);
    setLoadingMessage("Processing file...");

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90; // Stop at 90% until actual upload completes
        }
        return prev + 5;
      });
    }, 1000);
  };

  useEffect(() => {
    if (success && data?.length) {
      console.log("Uploaded data:", data);
      setUploadedData(data);
      setIsTableVisible(true);
      setIsLoading(false);
      setUploadProgress(100);
      setLoadingMessage("");
      dispatch(getExpensesAction("desc", friendId));
    }
    if (error) {
      setIsLoading(false);
      setUploadProgress(0);
      setLoadingMessage("");
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
    <>
      <div className="min-h-screen flex flex-col bg-[#1b1b1b] sm:px-0">
        <div className="w-full sm:w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b] "></div>

        <div
          className="flex flex-col flex-grow sm:p-6 w-full sm:w-[calc(100vw-370px)]"
          style={{
            position: "relative",
            height: "calc(100vh - 100px)",
            backgroundColor: "rgb(11, 11, 11)",
            borderRadius: "8px",
            boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
            border: "1px solid rgb(0, 0, 0)",
            opacity: 1,
          }}
        >
          {/* Back button - same behaviour as Bill component */}
          <div style={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}>
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
          </div>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || "Failed to upload file. Please try again."}
            </Alert>
          )}

          {isTableVisible && uploadedData.length > 0 ? (
            <div className="relative">
              <ExpensesTable expenses={filteredExpenses} />

              <div className="flex flex-col sm:flex-row justify-between gap-2 mt-[10px]">
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
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-full">
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
            </div>
          )}

          <FileUploadModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onUploadStart={handleUploadStart}
          />
        </div>

        <div className="w-full sm:w-[calc(100vw-400px)] h-[50px] bg-[#1b1b1b] mx-auto"></div>
      </div>

      {/* Full Screen Loading Overlay */}

      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(4px)",
        }}
        open={isLoading}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            textAlign: "center",
          }}
        >
          <PercentageLoader
            percentage={isTableVisible ? saveProgress : uploadProgress}
            size="xl"
            trackColor="#2a2a2a"
            progressColor="#14b8a6"
            textColor="#fff"
            showPercentage={true}
            processed={isTableVisible ? saveProcessed : null}
            total={isTableVisible ? saveTotal : null}
          />

          {loadingMessage && (
            <Box
              sx={{
                color: "#fff",
                fontSize: "1.2rem",
                fontWeight: "500",
                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              {loadingMessage}
            </Box>
          )}

          <Box
            sx={{
              color: "#a0a0a0",
              fontSize: "0.9rem",
              maxWidth: "300px",
              lineHeight: 1.5,
            }}
          >
            Please wait while we process your request...
          </Box>
        </Box>
      </Backdrop>
    </>
  );
};

export default Upload;
