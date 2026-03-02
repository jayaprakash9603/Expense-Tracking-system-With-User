import React from "react";
import useApplicationOverview from "../../hooks/useApplicationOverview";
import { Skeleton, useTheme as useMuiTheme, useMediaQuery } from "@mui/material";
import ModernOverviewCard from "../../components/common/ModernOverviewCard";
import WalletIcon from "@mui/icons-material/Wallet";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CreditCardIcon from "@mui/icons-material/CreditCard";

const Overview = () => {
  const { data, loading, error } = useApplicationOverview();

  const totalExpenses = data?.totalExpenses || 0;
  const todayExpenses = data?.todayExpenses || 0;
  const creditDue = -(data?.totalCreditDue || 0);
  const remainingBudget = data?.remainingBudget || 0;

  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const shimmerKeyframes = {
    "@keyframes shimmer": {
      "0%": { backgroundPosition: "-1000px 0" },
      "100%": { backgroundPosition: "1000px 0" },
    },
  };

  const skeletonStyle = {
    ...shimmerKeyframes,
    bgcolor: "rgb(27, 27, 27)",
    backgroundImage:
      "linear-gradient(90deg, rgb(27, 27, 27) 0%, rgb(51, 51, 51) 50%, rgb(27, 27, 27) 100%)",
    backgroundSize: "1000px 100%",
    animation: "shimmer 2s infinite linear",
    borderRadius: "16px",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: isMobile ? "100%" : "640px",
        backgroundColor: "transparent",
        padding: "0",
        color: "#ffffff",
        height: "auto",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ width: "100%", marginBottom: "16px" }}>
        <p
          style={{
            fontWeight: "bold",
            fontSize: "18px",
            marginBottom: "8px",
            color: "var(--primary-text)",
          }}
        >
          Financial Overview
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            width: "100%",
            marginBottom: "12px",
            padding: "8px 12px",
            borderRadius: "6px",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            color: "#fecaca",
            fontSize: "12px",
          }}
        >
          {error}
        </div>
      )}

      {/* Skeleton or Data */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
            gap: "16px",
            width: "100%",
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width="100%"
              height={130}
              sx={skeletonStyle}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
            gap: "16px",
            width: "100%",
            height: "auto",
          }}
        >
          <ModernOverviewCard 
            title="Total Expenses" 
            value={`₹${totalExpenses}`} 
            icon={<WalletIcon fontSize="small" />}
            variant="blue"
            percentage="+5.2%"
            trend="up"
            sparklineData={[5, 6, 4, 7, 8, 5, 9]}
          />
          <ModernOverviewCard 
            title="Remaining" 
            value={`₹${remainingBudget}`} 
            icon={<AccountBalanceWalletIcon fontSize="small" />}
            variant="purple"
            percentage="-1.5%"
            trend="down"
            sparklineData={[9, 8, 7, 9, 6, 5, 4]}
          />
          <ModernOverviewCard 
            title="Today's Expenses" 
            value={`₹${todayExpenses}`} 
            icon={<ReceiptIcon fontSize="small" />}
            variant="yellow"
            percentage="+2.1%"
            trend="up"
            sparklineData={[2, 3, 2, 4, 3, 5, 6]}
          />
          <ModernOverviewCard 
            title="Credit Due" 
            value={`₹${creditDue}`} 
            icon={<CreditCardIcon fontSize="small" />}
            variant="red"
            percentage="+8.4%"
            trend="up"
            sparklineData={[4, 3, 5, 7, 6, 8, 9]}
          />
        </div>
      )}
    </div>
  );
};

export default Overview;
