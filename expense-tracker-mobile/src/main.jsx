import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/app/App";
import { updateAuthHeader } from "@/config/api";
import { reconcileAuthStorageWithRuntimeMode } from "@/shared/utils/authStorage";
import "@/styles/globals.css";

reconcileAuthStorageWithRuntimeMode();
updateAuthHeader();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
