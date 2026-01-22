import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Box, Divider, Drawer, Tab, Tabs, useMediaQuery } from "@mui/material";

import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";

import { buildScrollbarSx } from "../../utils/dailySpendingDrilldownUtils";

import DrawerHeader from "./dailySpendingDrilldown/DrawerHeader";
import SummarySection from "./dailySpendingDrilldown/SummarySection";
import BreakdownSection from "./dailySpendingDrilldown/BreakdownSection";
import TransactionList from "./dailySpendingDrilldown/TransactionList";
import useDailySpendingDrilldownDrawer from "./dailySpendingDrilldown/useDailySpendingDrilldownDrawer";

const DailySpendingDrilldownDrawer = ({
  open,
  onClose,
  point,
  breakdownLabel,
  breakdownEmptyMessage,
  breakdownItemLabel,
  hideBudgetBreakdown = false,
  showTypeTabs = false,
  defaultTypeTab = "loss",
}) => {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const isMobile = useMediaQuery("(max-width:600px)");

  const canShowTypeTabs = Boolean(showTypeTabs);

  const [activeTab, setActiveTab] = useState(
    String(defaultTypeTab || "loss").toLowerCase() === "gain" ? "gain" : "loss",
  );

  useEffect(() => {
    if (!open) return;
    setActiveTab(
      String(defaultTypeTab || "loss").toLowerCase() === "gain"
        ? "gain"
        : "loss",
    );
  }, [defaultTypeTab, open]);

  const currencySymbol = settings.getCurrency().symbol;
  const locale = settings.language || "en";
  const dateFormat = settings.dateFormat || "DD/MM/YYYY";

  const cardHeight = isMobile ? 148 : 124;
  const listGapPx = 8;

  const drilldown = useDailySpendingDrilldownDrawer({
    point,
    breakdownLabel,
    breakdownEmptyMessage,
    breakdownItemLabel,
    activeListType: canShowTypeTabs ? activeTab : "all",
    locale,
    currencySymbol,
    cardHeight,
    listGapPx,
  });

  // Determine entityType from breakdownLabel
  const entityType = useMemo(() => {
    const labelLower = String(breakdownLabel || "").toLowerCase();
    if (labelLower.includes("categor")) return "category";
    if (labelLower.includes("payment")) return "paymentMethod";
    return undefined;
  }, [breakdownLabel]);

  const shouldRenderTabs = useMemo(() => {
    if (!canShowTypeTabs) return false;
    if (!drilldown.isAllView) return false;
    return (
      drilldown.expenses.loss.length > 0 || drilldown.expenses.gain.length > 0
    );
  }, [
    canShowTypeTabs,
    drilldown.expenses.gain.length,
    drilldown.expenses.loss.length,
    drilldown.isAllView,
  ]);

  useEffect(() => {
    if (!shouldRenderTabs) return;
    if (activeTab === "loss" && drilldown.expenses.loss.length === 0) {
      setActiveTab("gain");
    }
    if (activeTab === "gain" && drilldown.expenses.gain.length === 0) {
      setActiveTab("loss");
    }
  }, [
    activeTab,
    drilldown.expenses.gain.length,
    drilldown.expenses.loss.length,
    shouldRenderTabs,
  ]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? "100%" : 440,
          background: colors?.secondary_bg || "#0b0b10",
          color: colors?.primary_text || "#fff",
          overflowX: "hidden",
          overflowY: "auto",
          ...buildScrollbarSx({ colors }),
        },
      }}
    >
      <DrawerHeader
        title={drilldown.drawerTitle}
        subtitle={drilldown.dateLabel}
        colors={colors}
        onClose={onClose}
        getCopyText={drilldown.copyExport.getCopyText}
        getExportText={drilldown.copyExport.getExportText}
        getExportFilename={drilldown.copyExport.getExportFilename}
      />

      <SummarySection
        isAllView={drilldown.isAllView}
        totals={drilldown.totals}
        breakdown={drilldown.breakdown}
        colors={colors}
        formatMoney={drilldown.formatMoney}
      />

      {!hideBudgetBreakdown ? (
        <BreakdownSection
          breakdown={drilldown.breakdown}
          colors={colors}
          formatMoney={drilldown.formatMoney}
          entityType={entityType}
        />
      ) : null}

      <Divider sx={{ borderColor: colors?.border_color }} />

      {shouldRenderTabs ? (
        <Box sx={{ px: 2, pt: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Box
              component="span"
              sx={{
                fontWeight: 900,
                fontSize: 13,
                color: colors?.primary_text,
              }}
            >
              Transactions
            </Box>
            <Box
              component="span"
              sx={{
                fontWeight: 900,
                fontSize: 12,
                opacity: 0.7,
                color: colors?.secondary_text || colors?.primary_text,
              }}
            >
              {activeTab === "loss" ? "Loss" : "Gain"}
            </Box>
          </Box>
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="fullWidth"
            textColor="inherit"
            TabIndicatorProps={{ style: { display: "none" } }}
            sx={{
              background: colors?.primary_bg,
              border: `1px solid ${colors?.border_color}`,
              borderRadius: 2,
              minHeight: 40,
              overflow: "hidden",
              "& .MuiTab-root": {
                minHeight: 40,
                fontWeight: 900,
                textTransform: "none",
              },
            }}
          >
            <Tab
              value="loss"
              label={`Loss (${drilldown.expenses.loss.length})`}
              disabled={drilldown.expenses.loss.length === 0}
              sx={{
                color:
                  activeTab === "loss"
                    ? "#ff5252"
                    : colors?.secondary_text || colors?.primary_text,
                backgroundColor:
                  activeTab === "loss"
                    ? "rgba(255, 82, 82, 0.12)"
                    : "transparent",
                "&.Mui-disabled": { opacity: 0.35 },
              }}
            />
            <Tab
              value="gain"
              label={`Gain (${drilldown.expenses.gain.length})`}
              disabled={drilldown.expenses.gain.length === 0}
              sx={{
                color:
                  activeTab === "gain"
                    ? "#00d4c0"
                    : colors?.secondary_text || colors?.primary_text,
                backgroundColor:
                  activeTab === "gain"
                    ? "rgba(0, 212, 192, 0.12)"
                    : "transparent",
                "&.Mui-disabled": { opacity: 0.35 },
              }}
            />
          </Tabs>
        </Box>
      ) : null}

      <TransactionList
        title={drilldown.listHeader}
        isEmpty={drilldown.expenses.all.length === 0}
        pagedExpenses={drilldown.pagedExpenses}
        colors={colors}
        dateFormat={dateFormat}
        currencySymbol={currencySymbol}
        locale={locale}
        cardHeight={cardHeight}
        listGapPx={listGapPx}
        listHeightPx={drilldown.listHeightPx}
        useScroll={drilldown.listState.useScroll}
        showListControls={drilldown.listState.showListControls}
        shouldPaginate={drilldown.listState.shouldPaginate}
        rangeText={drilldown.listState.rangeText}
        rowsPerPage={drilldown.listState.rowsPerPage}
        rowsPerPageOptions={drilldown.listState.rowsPerPageOptions}
        onPrevPage={drilldown.actions.onPrevPage}
        onNextPage={drilldown.actions.onNextPage}
        canPrev={drilldown.listState.canPrev}
        canNext={drilldown.listState.canNext}
        onRowsPerPageChange={drilldown.actions.onRowsPerPageChange}
        showScrollHint={drilldown.listState.showScrollHint}
      />
    </Drawer>
  );
};

DailySpendingDrilldownDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  point: PropTypes.object,
  breakdownLabel: PropTypes.string,
  breakdownEmptyMessage: PropTypes.string,
  breakdownItemLabel: PropTypes.string,
  hideBudgetBreakdown: PropTypes.bool,
  showTypeTabs: PropTypes.bool,
  defaultTypeTab: PropTypes.oneOf(["loss", "gain"]),
};

export default DailySpendingDrilldownDrawer;
