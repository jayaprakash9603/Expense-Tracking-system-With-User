import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  useTheme as useMuiTheme,
  useMediaQuery,
} from "@mui/material";
import RangePeriodNavigator from "../common/RangePeriodNavigator";
import DeletionConfirmationWithToast from "../common/DeletionConfirmationWithToast";
import SearchNavigationBar from "../cashflow/SearchNavigationBar";
import SortPopover from "../cashflow/SortPopover";
import FlowToggleButton from "../cashflow/FlowToggleButton";
import FlowEntityCards from "./FlowEntityCards";
import FlowExpenseTable from "./FlowExpenseTable";
import NoDataPlaceholder from "../NoDataPlaceholder";
import FlowChartSkeleton from "../skeletons/FlowChartSkeleton";
import FlowEntityCardsSkeleton from "../skeletons/FlowEntityCardsSkeleton";
import useFlowCards from "../../hooks/useFlowCards";
import {
  getEntityExpenses,
  filterExpensesForRangeBucket,
} from "../../utils/flowEntityUtils";
import { rangeTypes } from "../../utils/flowDateUtils"; // Added missing import
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";

/**
 * GenericFlowPage
 * Reusable layout for entity flows (Category, Payment Method, etc.).
 */
const GenericFlowPage = ({
  flowData, // { activeRange,setActiveRange,offset,setOffset,flowTab,setFlowTab,loading,totals,pieData,cards,barSegments,stackedChartData,xAxisKey,rangeLabel,expensesMap }
  entityConfig, // { singular, plural, idKey, nameKey, routeBase, addNewOptions, navItems, deletionConfirmText }
  chartComponent: ChartComponent,
  formatCompactNumber,
  friendId,
  isFriendView,
  hasWriteAccess,
  createDialog: { open, setOpen, title, Component, onCreated } = {},
  onDeleteAction, // async (entityId, friendId) => Promise
  onRefresh, // () => void
  navigate,
  showBackButton = false,
  onPageBack,
}) => {
  const {
    activeRange,
    setActiveRange,
    offset,
    setOffset,
    flowTab,
    setFlowTab,
    loading,
    totals,
    pieData,
    cards,
    barSegments,
    stackedChartData,
    xAxisKey,
    rangeLabel,
    expensesMap,
  } = flowData;

  const {
    singular,
    idKey,
    nameKey,
    routeBase,
    addNewOptions,
    navItems,
    deletionConfirmText,
  } = entityConfig;

  const [search, setSearch] = useState("");
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [showExpenseTable, setShowExpenseTable] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [shrinkFlowBtn, setShrinkFlowBtn] = useState(false);
  const filterBtnRef = useRef(null);

  const muiTheme = useMuiTheme();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(muiTheme.breakpoints.between("sm", "md"));
  const chartContainerHeight = isMobile ? 120 : isTablet ? 160 : 220;

  useEffect(() => {
    setSelectedEntity(null);
    setShowExpenseTable(false);
  }, [activeRange, offset, flowTab]);

  useEffect(() => {
    if (!popoverOpen) return;
    function handleClick(e) {
      if (
        filterBtnRef.current &&
        !filterBtnRef.current.contains(e.target) &&
        !document.getElementById("sort-popover")?.contains(e.target)
      ) {
        setPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [popoverOpen]);

  const { sortType, setSortType, sortedCards } = useFlowCards(
    cards,
    search,
    "high",
  );

  const handleEntityClick = (entity) => {
    setSelectedEntity(entity);
    const expenses = getEntityExpenses(entity, expensesMap);
    setSelectedExpenses(expenses);
    setShowExpenseTable(true);
  };

  const handleBarSegmentClick = (segment, bucketIdx) => {
    const label = segment.label;
    const ent = cards.find((c) => c[nameKey] === label);
    const all = getEntityExpenses(ent, expensesMap);
    const filtered = filterExpensesForRangeBucket({
      expensesAll: all,
      activeRange,
      offset,
      bucketIdx,
    });
    if (ent) setSelectedEntity(ent);
    setSelectedExpenses(filtered);
    setShowExpenseTable(true);
  };

  const handleEntityDoubleClick = (e, entity) => {
    e.stopPropagation();
    if (!entity?.[idKey]) return;
    navigate(
      friendId && friendId !== "undefined"
        ? `/${routeBase}/edit/${entity[idKey]}/friend/${friendId}`
        : `/${routeBase}/edit/${entity[idKey]}`,
    );
  };

  const handleCloseExpenseTable = () => {
    setShowExpenseTable(false);
    setSelectedEntity(null);
  };

  const handleDeleteConfirm = async () => {
    if (!entityToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteAction(entityToDelete[idKey], friendId || "");
      const entityName = entityToDelete?.[nameKey] || "";
      setToastMessage(
        t("flows.messages.deleteSuccess", {
          entity: singular,
          name: entityName,
        }),
      );
      setToastOpen(true);
      setDeleteDialogOpen(false);
      onRefresh?.();
    } catch (err) {
      setToastMessage(
        t("flows.messages.deleteError", {
          entity: singular,
        }),
      );
      setToastOpen(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToastClose = () => {
    setToastOpen(false);
    setToastMessage("");
  };

  return (
    <div
      style={{
        backgroundColor: colors.secondary_bg,
        padding: isMobile ? 8 : isTablet ? 12 : 16,
        borderRadius: isMobile ? 0 : isTablet ? "8px" : "8px",
        marginTop: 0,
        width: isMobile ? "100vw" : isTablet ? "100vw" : "calc(100vw - 370px)",
        height: isMobile ? "auto" : isTablet ? "auto" : "calc(100vh - 100px)",
        marginRight: isMobile ? 0 : isTablet ? 0 : "20px",
        boxSizing: "border-box",
        position: "relative",
        minWidth: 0,
      }}
    >
      <RangePeriodNavigator
        showBackButton={showBackButton}
        onBackNavigate={onPageBack}
        rangeTypes={rangeTypes.map((rt) => ({
          ...rt,
          label: t(`cashflow.rangeTypes.${rt.value}`),
        }))}
        activeRange={activeRange}
        setActiveRange={setActiveRange}
        offset={offset}
        handleBack={() => setOffset((p) => p - 1)}
        handleNext={() => setOffset((p) => p + 1)}
        rangeLabel={rangeLabel}
        disablePrevAt={-52}
        disableNextAt={0}
        isMobile={isMobile}
        onResetSelection={() => {
          setSelectedEntity(null);
          setSelectedExpenses([]);
        }}
      />
      <DeletionConfirmationWithToast
        toastOpen={toastOpen}
        toastMessage={toastMessage}
        onToastClose={handleToastClose}
        isDeleteModalOpen={deleteDialogOpen}
        isDeleting={isDeleting}
        onApprove={handleDeleteConfirm}
        onDecline={() => setDeleteDialogOpen(false)}
        approveText={t("common.delete")}
        declineText={t("common.cancel")}
        confirmationText={deletionConfirmText}
      />
      {Component && (
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          PaperProps={{
            style: {
              backgroundColor: colors.primary_bg,
              color: colors.primary_text,
              borderRadius: "12px",
            },
          }}
        >
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>
            <Component
              onClose={() => setOpen(false)}
              onCreated={(entity) => {
                onCreated?.(entity);
                const entityName = entity?.[nameKey] || "";
                setToastMessage(
                  t("flows.messages.createSuccess", {
                    entity: singular,
                    name: entityName,
                  }),
                );
                setToastOpen(true);
                onRefresh?.();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 5 }}>
        <FlowToggleButton
          flowTab={flowTab}
          setFlowTab={setFlowTab}
          totals={totals}
          isMobile={isMobile}
          onResetSelections={() => {
            setSelectedEntity(null);
            setSelectedExpenses([]);
            setShowExpenseTable(false);
          }}
          shrinkFlowBtn={shrinkFlowBtn}
          setShrinkFlowBtn={setShrinkFlowBtn}
        />
      </div>
      <div
        className="w-full rounded-lg p-4 mb-4"
        style={{
          background: colors.primary_bg,
          height: chartContainerHeight,
          minWidth: 0,
          maxWidth: "100%",
          boxSizing: "border-box",
          overflow: "visible",
        }}
      >
        {loading ? (
          <FlowChartSkeleton variant="bar" />
        ) : pieData.length === 0 ? (
          <NoDataPlaceholder
            size={isMobile ? "md" : "lg"}
            fullWidth
            message={t("cashflow.messages.noDataChart")}
            subMessage={t("cashflow.messages.adjustFilters")}
          />
        ) : (
          <ChartComponent
            stackedChartData={stackedChartData}
            barSegments={barSegments}
            xAxisKey={xAxisKey}
            isMobile={isMobile}
            isTablet={isTablet}
            formatCompactNumber={formatCompactNumber}
            onSegmentClick={handleBarSegmentClick}
          />
        )}
      </div>
      {showExpenseTable && selectedEntity && (
        <FlowExpenseTable
          title={t("flows.expensesTable.entityTitle", {
            name: selectedEntity[nameKey],
          })}
          expenses={selectedExpenses}
          isMobile={isMobile}
          isTablet={isTablet}
          onClose={handleCloseExpenseTable}
        />
      )}
      {!showExpenseTable && (
        <>
          <SearchNavigationBar
            search={search}
            setSearch={setSearch}
            onFilterToggle={() => setPopoverOpen((v) => !v)}
            filterRef={filterBtnRef}
            isMobile={isMobile}
            isTablet={isTablet}
            placeholder={t("flows.search.placeholder", {
              entityPlural: entityConfig.plural,
            })}
            navItems={navItems}
            friendId={friendId}
            isFriendView={isFriendView}
            hasWriteAccess={hasWriteAccess}
            navigate={navigate}
            addNewOptions={addNewOptions}
            currentFlow={routeBase}
          />
          <SortPopover
            open={popoverOpen}
            anchorRect={filterBtnRef.current?.getBoundingClientRect() || null}
            sortType={sortType}
            onSelect={(type) => {
              setSortType(type);
              setPopoverOpen(false);
            }}
            recentIcon={require("../../assests/recent.png")}
          />
          <FlowEntityCards
            entities={sortedCards}
            loading={loading}
            search={search}
            isMobile={isMobile}
            isTablet={isTablet}
            flowTab={flowTab}
            selectedEntityId={selectedEntity?.[idKey] || null}
            hasWriteAccess={hasWriteAccess}
            friendId={friendId}
            isFriendView={isFriendView}
            onSelect={(ent) => handleEntityClick(ent)}
            onDouble={(ent, e) => handleEntityDoubleClick(e, ent)}
            onEdit={(ent) => {
              navigate(
                friendId && friendId !== "undefined"
                  ? `/${routeBase}/edit/${ent[idKey]}/friend/${friendId}`
                  : `/${routeBase}/edit/${ent[idKey]}`,
              );
            }}
            onDelete={(ent) => {
              setEntityToDelete(ent);
              setDeleteDialogOpen(true);
            }}
            onViewAnalytics={(ent) => {
              navigate(
                friendId && friendId !== "undefined"
                  ? `/${routeBase}/view/${ent[idKey]}/friend/${friendId}`
                  : `/${routeBase}/view/${ent[idKey]}`,
              );
            }}
          />
        </>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; background: ${
          colors.hover_bg
        }; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${
          flowTab === "outflow"
            ? "#ff4d4f"
            : flowTab === "inflow"
              ? "#06d6a0"
              : "#5b7fff"
        }; border-radius: 6px; }
      `}</style>
    </div>
  );
};

export default GenericFlowPage;
