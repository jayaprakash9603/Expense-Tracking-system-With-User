import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import FileUploadModal from "../Fileupload/FileUploadModal";
import {
  TextField,
  Box,
  Alert,
  CircularProgress,
  Backdrop,
  IconButton,
  Switch,
} from "@mui/material";
import PreviewDataGrid from "../../components/PreviewDataGrid";
import {
  getExpensesAction,
  saveExpenses,
  startTrackedSaveExpenses,
  uploadCategoriesFile,
} from "../../Redux/Expenses/expense.action";
import ExpensesTable from "../Landingpage/ExpensesTable";
import { useNavigate, useParams, useLocation } from "react-router";
import useFriendAccess from "../../hooks/useFriendAccess";
import useRedirectIfReadOnly from "../../hooks/useRedirectIfReadOnly";
import PercentageLoader from "../../components/Loaders/PercentageLoader";
import PulseLoader from "../../components/Loaders/Loader"; // added
import { api, API_BASE_URL } from "../../config/api";

const Upload = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("expenses");
  const [uploadedData, setUploadedData] = useState([]);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [isCatTableVisible, setIsCatTableVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [categorySearchText, setCategorySearchText] = useState("");
  const [saveProgress, setSaveProgress] = useState(0);
  const [saveProcessed, setSaveProcessed] = useState(0);
  const [saveTotal, setSaveTotal] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [uploadedCategories, setUploadedCategories] = useState([]);
  const catFileInputRef = useRef(null);
  const navigate = useNavigate();

  const { friendId } = useParams();
  const location = useLocation();
  const { hasWriteAccess } = useFriendAccess(friendId);
  useRedirectIfReadOnly(friendId, {
    buildFriendPath: (fid) => `/friends/expenses/${fid}`,
    selfPath: "/friends/expenses",
    defaultPath: "/friends/expenses",
  });

  const {
    success = false,
    data = [],
    error = null,
  } = useSelector((state) => state.fileUpload || {});

  const openModal = (mode = "expenses") => {
    if (!hasWriteAccess) return; // safety
    setModalMode(mode);
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

  const hideCategoryTable = () => {
    setIsCatTableVisible(false);
    setUploadedCategories([]);
    setCategorySearchText("");
  };

  const handleSave = async () => {
    if (!hasWriteAccess) return; // safety
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
    if (!hasWriteAccess) return; // safety
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

  const openCategoryFilePicker = () =>
    hasWriteAccess && openModal("categories");

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

  const filteredCategories = useMemo(() => {
    if (!categorySearchText) return uploadedCategories;
    return uploadedCategories.filter((c) =>
      (c?.name || "").toLowerCase().includes(categorySearchText.toLowerCase())
    );
  }, [uploadedCategories, categorySearchText]);

  // (Manual redirect effect removed; handled by generic hook)

  return (
    <>
      <div className=" bg-[#1b1b1b]">
        <div
          className="flex lg:w-[calc(100vw-370px)] flex-col justify-between sm:w-full"
          style={{
            height: "auto",
            minHeight: "calc(100vh - 100px)",
            backgroundColor: "rgb(11, 11, 11)",
            borderRadius: "8px",
            boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
            border: "1px solid rgb(0, 0, 0)",
            opacity: 1,
            position: "relative",
            marginRight: "20px",
            padding: "16px",
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
            <div className="relative mt-[50px]">
              <ExpensesTable expenses={filteredExpenses} />

              {hasWriteAccess && (
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
              )}
            </div>
          ) : isCatTableVisible && uploadedCategories.length > 0 ? (
            <PreviewDataGrid
              rows={filteredCategories || []}
              columns={[
                {
                  field: "displayId",
                  headerName: "ID",
                  width: 90,
                  valueGetter: (value, row, column, apiRef) => {
                    const fn =
                      apiRef?.current?.getRowIndexRelativeToVisibleRows ||
                      apiRef?.current?.getRowIndex;
                    const idx = typeof fn === "function" ? fn(row?.id) : 0;
                    return (typeof idx === "number" ? idx : 0) + 1;
                  },
                  sortable: false,
                },
                {
                  field: "name",
                  headerName: "Name",
                  flex: 1,
                  minWidth: 140,
                  editable: true,
                },
                {
                  field: "color",
                  headerName: "Color",
                  flex: 1,
                  minWidth: 140,
                  editable: true,
                  renderCell: (params) => (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 3,
                          background: params.value || "#999",
                          border: "1px solid #444",
                          display: "inline-block",
                        }}
                      />
                      <span>{params.value || ""}</span>
                    </div>
                  ),
                },
                {
                  field: "icon",
                  headerName: "Icon",
                  width: 110,
                  minWidth: 100,
                  editable: true,
                },
                {
                  field: "description",
                  headerName: "Description",
                  flex: 2,
                  minWidth: 280,
                  editable: true,
                },

                {
                  field: "global",
                  headerName: "Global",
                  width: 140,
                  renderCell: (params) => {
                    const checked = !!(
                      params.row?.global ?? params.row?.isGlobal
                    );
                    return (
                      <Switch
                        size="small"
                        checked={checked}
                        onChange={(e) => {
                          const value = e.target.checked;
                          setUploadedCategories((prev) =>
                            (prev || []).map((c) =>
                              c.id === params.row.id
                                ? { ...c, global: value, isGlobal: value }
                                : c
                            )
                          );
                        }}
                        inputProps={{ "aria-label": "Toggle Global" }}
                      />
                    );
                  },
                  sortable: false,
                },
              ]}
              onCancel={hideCategoryTable}
              onSave={null}
              saveDisabled
              saveLabel="Save (coming soon)"
              height={700}
              marginTop={50}
              onCellEditCommit={(params) => {
                const { id, field, value } = params || {};
                if (!id || !field) return;
                setUploadedCategories((prev) =>
                  (prev || []).map((c) =>
                    c.id === id ? { ...c, [field]: value } : c
                  )
                );
              }}
            />
          ) : (
            <div className="flex justify-center items-center h-full">
              <div className="relative w-full h-[60vh] sm:h-[80vh]">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  {hasWriteAccess && (
                    <div className="flex flex-col gap-3 items-center">
                      <button
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700"
                        onClick={openModal}
                      >
                        Upload Expenses
                      </button>
                      <button
                        className="bg-emerald-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-emerald-700"
                        onClick={openCategoryFilePicker}
                      >
                        Upload Categories
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <FileUploadModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onUploadStart={handleUploadStart}
            mode={modalMode}
            onSuccess={(cats) => {
              const list = Array.isArray(cats) ? cats : [];
              setUploadedCategories(list);
              setIsCatTableVisible(true);
              setIsLoading(false);
              setUploadProgress(100);
              setLoadingMessage("");
            }}
          />
        </div>
      </div>

      {/* Full Screen Loading Overlay */}

      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1400,
          backgroundColor: "rgba(0, 0, 0, 0.78)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
        open={isLoading}
        role="alert"
        aria-live="assertive"
        aria-label={loadingMessage || "Processing"}
      >
        {/* Show pulse loader for file upload phase (before table visible); show percentage only during save */}
        {!isTableVisible ? (
          <PulseLoader message={loadingMessage || "Processing file..."} />
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              textAlign: "center",
              width: "100%",
              maxWidth: 420,
              mx: "auto",
            }}
          >
            <PercentageLoader
              percentage={saveProgress}
              size="xl"
              trackColor="#2a2a2a"
              progressColor="#14b8a6"
              textColor="#fff"
              showPercentage={true}
              processed={saveProcessed}
              total={saveTotal}
            />
            {saveTotal > 0 && (
              <Box sx={{ color: "#9ca3af", fontSize: "0.8rem" }}>
                {saveProcessed} / {saveTotal} items saved
              </Box>
            )}
            {loadingMessage && (
              <Box
                sx={{
                  color: "#fff",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                {loadingMessage}
              </Box>
            )}
            <Box
              sx={{
                color: "#a0a0a0",
                fontSize: "0.85rem",
                maxWidth: 340,
                lineHeight: 1.5,
              }}
            >
              Please wait while we process your request...
            </Box>
          </Box>
        )}
      </Backdrop>
    </>
  );
};

export default Upload;
