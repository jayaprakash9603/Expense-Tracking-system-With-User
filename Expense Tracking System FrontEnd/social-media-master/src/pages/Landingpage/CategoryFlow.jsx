import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useFriendAccess from "../../hooks/useFriendAccess";
import useCategoryFlowData from "../../hooks/useCategoryFlowData";
import { deleteCategory } from "../../Redux/Category/categoryActions";
import GenericFlowPage from "../../components/common/GenericFlowPage";
import CategoryFlowChart from "../../components/categoryflow/CategoryFlowChart";
import { formatCompactNumber } from "../../utils/numberFormatters";
import CreateCategory from "./CreateCategory";
import { useDispatch } from "react-redux";
import { useTranslation } from "../../hooks/useTranslation";

const CategoryFlow = () => {
  // Acquire params & local searchable state BEFORE invoking data hook
  const { friendId } = useParams();
  const [search, setSearch] = useState("");
  const isFriendView = Boolean(friendId && friendId !== "undefined");

  // Orchestrator state now comes from custom hook for parity with CashFlow
  const {
    activeRange,
    setActiveRange,
    offset,
    setOffset,
    flowTab,
    setFlowTab,
    loading,
    categoryExpenses,
    totals,
    pieData,
    categoryCards,
    barSegments,
    stackedChartData,
    xAxisKey,
    rangeLabel,
    refreshCategoryFlow,
  } = useCategoryFlowData({ friendId, isFriendView, search });
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  // Back button appears if navigated from another flow (location.state.fromFlow) or in friend view.
  const originFlow = location?.state?.fromFlow;
  const showBackButton = isFriendView || Boolean(originFlow);
  const handlePageBack = () => {
    if (originFlow) {
      navigate(`/${originFlow}`);
      return;
    }
    if (friendId && friendId !== "undefined")
      navigate(`/friends/expenses/${friendId}`);
    else navigate("/expenses");
  };
  const { hasWriteAccess } = useFriendAccess(friendId);
  const [createCategoryModalOpen, setCreateCategoryModalOpen] = useState(false);

  return (
    <GenericFlowPage
      flowData={{
        activeRange,
        setActiveRange,
        offset,
        setOffset,
        flowTab,
        setFlowTab,
        loading,
        totals,
        pieData,
        cards: categoryCards,
        barSegments,
        stackedChartData,
        xAxisKey,
        rangeLabel,
        expensesMap: categoryExpenses,
      }}
      entityConfig={{
        singular: t("flows.entities.category.singular"),
        plural: t("flows.entities.category.plural"),
        idKey: "categoryId",
        nameKey: "categoryName",
        routeBase: "category-flow",
        addNewOptions: [
          {
            label: t("cashflow.addNew.options.addCategory"),
            route:
              friendId && friendId !== "undefined"
                ? `/category-flow/create/${friendId}`
                : "/category-flow/create",
            color: "#00DAC6",
          },
          {
            label: t("cashflow.addNew.options.uploadFile"),
            route:
              friendId && friendId !== "undefined"
                ? `/upload/categories${friendId}`
                : "/upload/categories",
            color: "#5b7fff",
          },
        ],
        navItems: [
          {
            path: "/category-flow/reports",
            icon: "report.png",
            label: t("navigation.reports"),
          },
          {
            path: "/budget",
            icon: "budget.png",
            label: t("cashflow.nav.budget"),
          },
          {
            path: "/expenses",
            icon: "save-money.png",
            label: t("navigation.expenses"),
          },
          {
            path: "/payment-method",
            icon: "payment-method.png",
            label: t("navigation.payments"),
          },
          {
            path: "/bill",
            icon: "bill.png",
            label: t("navigation.bill"),
          },
        ],
        deletionConfirmText: t("flows.confirmations.deleteCategory"),
      }}
      chartComponent={CategoryFlowChart}
      formatCompactNumber={formatCompactNumber}
      friendId={friendId}
      isFriendView={isFriendView}
      hasWriteAccess={hasWriteAccess}
      createDialog={{
        open: createCategoryModalOpen,
        setOpen: setCreateCategoryModalOpen,
        title: t("flows.categoryFlow.createDialogTitle"),
        Component: CreateCategory,
        onCreated: () => {},
      }}
      onDeleteAction={(id, frId) => dispatch(deleteCategory(id, frId))}
      onRefresh={refreshCategoryFlow}
      navigate={navigate}
      showBackButton={showBackButton}
      onPageBack={handlePageBack}
    />
  );
};

export default CategoryFlow;
