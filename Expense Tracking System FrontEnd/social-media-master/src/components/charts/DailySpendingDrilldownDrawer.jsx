import React from "react";
import PropTypes from "prop-types";
import { Divider, Drawer, useMediaQuery } from "@mui/material";

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
}) => {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const isMobile = useMediaQuery("(max-width:600px)");

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
    locale,
    currencySymbol,
    cardHeight,
    listGapPx,
  });

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

      <BreakdownSection
        breakdown={drilldown.breakdown}
        colors={colors}
        formatMoney={drilldown.formatMoney}
      />

      <Divider sx={{ borderColor: colors?.border_color }} />

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
};

export default DailySpendingDrilldownDrawer;
