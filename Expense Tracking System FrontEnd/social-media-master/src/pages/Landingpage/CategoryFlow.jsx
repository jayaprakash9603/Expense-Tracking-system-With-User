import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useFriendAccess from "../../hooks/useFriendAccess";
import useCategoryFlowData from "../../hooks/useCategoryFlowData";
import { deleteCategory } from "../../Redux/Category/categoryActions";
import { fetchCategoriesWithExpenses } from "../../Redux/Expenses/expense.action";
import GenericFlowPage from "../../components/common/GenericFlowPage";
import CategoryFlowChart from "../../components/categoryflow/CategoryFlowChart";
import { formatCompactNumber } from "../../utils/numberFormatters";
import CreateCategory from "./CreateCategory";
import { useDispatch } from "react-redux";

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
  } = useCategoryFlowData({ friendId, isFriendView, search });
  const dispatch = useDispatch();
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

  const onRefresh = () => {
    dispatch(
      fetchCategoriesWithExpenses(activeRange, offset, flowTab, friendId)
    );
  };

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
        singular: "Category",
        plural: "categories",
        idKey: "categoryId",
        nameKey: "categoryName",
        routeBase: "category-flow",
        addNewOptions: [
          {
            label: "Add Category",
            route:
              friendId && friendId !== "undefined"
                ? `/category-flow/create/${friendId}`
                : "/category-flow/create",
            color: "#00DAC6",
          },
          {
            label: "Upload File",
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
            label: "Reports",
          },
          { path: "/budget", icon: "budget.png", label: "Budget" },
          { path: "/expenses", icon: "save-money.png", label: "Expenses" },
          {
            path: "/payment-method",
            icon: "payment-method.png",
            label: "Payments",
          },
          { path: "/bill", icon: "bill.png", label: "Bill" },
        ],
        deletionConfirmText: "Are you sure you want to delete this category?",
      }}
      chartComponent={CategoryFlowChart}
      formatCompactNumber={formatCompactNumber}
      friendId={friendId}
      isFriendView={isFriendView}
      hasWriteAccess={hasWriteAccess}
      createDialog={{
        open: createCategoryModalOpen,
        setOpen: setCreateCategoryModalOpen,
        title: "Create Category",
        Component: CreateCategory,
        onCreated: () => {},
      }}
      onDeleteAction={(id, frId) => dispatch(deleteCategory(id, frId))}
      onRefresh={onRefresh}
      navigate={navigate}
      showBackButton={showBackButton}
      onPageBack={handlePageBack}
    />
  );
};

export default CategoryFlow;
