import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  LinearProgress,
} from "@mui/material";

const FinancialTab = ({ financialOverview, financialHealthScore }) => (
  <div className="space-y-6">
    {financialOverview}
    {financialHealthScore}
  </div>
);

export default FinancialTab;
