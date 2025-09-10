import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Alert,
  Backdrop,
  IconButton,
  TextField,
  Button,
  Typography,
  Paper,
} from "@mui/material";
import { useNavigate, useParams } from "react-router";
import PercentageLoader from "../../components/Loaders/PercentageLoader";
import { startTrackedSaveBills } from "../../Redux/Bill/bill.action";
import { api } from "../../config/api";

const UploadBills = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { friendId } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [saveProcessed, setSaveProcessed] = useState(0);
  const [saveTotal, setSaveTotal] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");

  const [rawJson, setRawJson] = useState("");
  const [bills, setBills] = useState([]);

  const parsedOk = useMemo(() => {
    try {
      if (!rawJson.trim()) return false;
      const data = JSON.parse(rawJson);
      return Array.isArray(data);
    } catch (_) {
      return false;
    }
  }, [rawJson]);

  useEffect(() => {
    if (!rawJson.trim()) {
      setBills([]);
      return;
    }
    try {
      const data = JSON.parse(rawJson);
      setBills(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      setBills([]);
      setError("Invalid JSON. Provide an array of bills.");
    }
  }, [rawJson]);

  const handleFileSelect = async (evt) => {
    const file = evt?.target?.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setRawJson(text || "");
    } catch (e) {
      setError("Failed to read file.");
    }
  };

  const startSave = async () => {
    if (!Array.isArray(bills) || bills.length === 0) return;
    setIsLoading(true);
    setLoadingMessage("Saving bills...");
    setSaveProgress(0);
    setSaveProcessed(0);
    setSaveTotal(bills.length);
    try {
      const jobId = await dispatch(startTrackedSaveBills(bills, friendId));

      const poll = async () => {
        try {
          const res = await api.get(
            `/api/bills/add-multiple/progress/${jobId}`
          );
          const payload = res?.data?.data ?? res?.data ?? {};
          const percent =
            typeof payload.percent === "number" ? payload.percent : 0;
          const processed = payload.processed ?? 0;
          const total = payload.total ?? bills.length;
          const status = payload.status ?? "RUNNING";

          setSaveProgress(Math.max(0, Math.min(100, Number(percent) || 0)));
          setSaveProcessed(Number(processed) || 0);
          setSaveTotal(Number(total) || bills.length);

          if (status === "COMPLETED") {
            setIsLoading(false);
            setLoadingMessage("");
            friendId ? navigate(`/bill/${friendId}`) : navigate(`/bill`);
            return;
          }
          if (status === "FAILED") {
            setIsLoading(false);
            setLoadingMessage("Failed to save bills.");
            setError(payload?.message || "Bulk save failed.");
            return;
          }
          setTimeout(poll, 750);
        } catch (e) {
          setTimeout(poll, 1500);
        }
      };
      poll();
    } catch (e) {
      setIsLoading(false);
      setLoadingMessage("");
      setError("Failed to start bulk save.");
    }
  };

  return (
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
        <div style={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}>
          <IconButton
            sx={{
              color: "#00DAC6",
              backgroundColor: "#1b1b1b",
              "&:hover": { backgroundColor: "#28282a" },
              zIndex: 10,
            }}
            onClick={() =>
              friendId && friendId !== "undefined"
                ? navigate(`/bill/${friendId}`)
                : navigate("/bill")
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
            {error}
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "center",
            mt: 8,
          }}
        >
          <Typography variant="h5" sx={{ color: "#00dac6", fontWeight: 700 }}>
            Upload Bills
          </Typography>
          <Typography variant="body2" sx={{ color: "#b0b0b0" }}>
            Paste a JSON array of BillRequestDTO objects or select a .json file
          </Typography>

          <Button
            variant="outlined"
            component="label"
            sx={{ color: "#00dac6", borderColor: "#00dac6" }}
          >
            Select JSON File
            <input
              hidden
              type="file"
              accept="application/json,.json"
              onChange={handleFileSelect}
            />
          </Button>

          <TextField
            multiline
            minRows={12}
            maxRows={24}
            value={rawJson}
            onChange={(e) => setRawJson(e.target.value)}
            placeholder="Enter the bills"
            sx={{
              width: "min(900px, 96%)",
              backgroundColor: "#1b1b1b",
              borderRadius: 2,
              "& .MuiInputBase-input": {
                color: "#fff",
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#33384e" },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#00dac6",
              },
            }}
          />

          <Paper
            sx={{
              p: 2,
              background: "#0b0b0b",
              border: "1px solid #33384e",
              color: "#fff",
              width: "min(900px, 96%)",
            }}
          >
            <Typography variant="body2" sx={{ color: "#b0b0b0" }}>
              Parsed: {bills.length} bills
            </Typography>
          </Paper>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              disabled={!parsedOk || bills.length === 0 || isLoading}
              onClick={startSave}
              sx={{
                background: "#00dac6",
                color: "#000",
                fontWeight: 700,
                px: 3,
              }}
            >
              {isLoading ? "Saving..." : "Save Bills"}
            </Button>
          </Box>
        </Box>
      </div>

      <div className="w-full sm:w-[calc(100vw-400px)] h-[50px] bg-[#1b1b1b] mx-auto"></div>

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
            percentage={saveProgress}
            size="xl"
            trackColor="#2a2a2a"
            progressColor="#14b8a6"
            textColor="#fff"
            showPercentage={true}
            processed={saveProcessed}
            total={saveTotal}
          />
          {loadingMessage && (
            <Box
              sx={{
                color: "#fff",
                fontSize: "1.2rem",
                fontWeight: 500,
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
    </div>
  );
};

export default UploadBills;
