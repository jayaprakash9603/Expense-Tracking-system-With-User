import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useFriendAccess from "../../hooks/useFriendAccess";
import usePaymentMethodFlowData from "../../hooks/usePaymentMethodFlowData";
import {
  deletePaymentMethod,
  fetchPaymentMethodsWithExpenses,
} from "../../Redux/Payment Method/paymentMethod.action";
import { formatCompactNumber } from "../../utils/numberFormatters";
import CreatePaymentMethod from "./CreatePaymentMethod";
import GenericFlowPage from "../../components/common/GenericFlowPage";
import FlowStackedChart from "../../components/common/FlowStackedChart";

const PaymentMethodFlow = () => {
  const { friendId } = useParams();
  const [search] = useState(""); // Local search handled inside GenericFlowPage
  const isFriendView = Boolean(friendId && friendId !== "undefined");
  const {
    activeRange,
    setActiveRange,
    offset,
    setOffset,
    flowTab,
    setFlowTab,
    loading,
    paymentMethodExpenses,
    totals,
    pieData,
    paymentMethodCards,
    barSegments,
    stackedChartData,
    xAxisKey,
    rangeLabel,
  } = usePaymentMethodFlowData({ friendId, isFriendView, search });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  // Back button appears if navigated from another flow (location.state.fromFlow) or in friend view.
  const originFlow = location?.state?.fromFlow;
  const showBackButton = isFriendView || Boolean(originFlow);
  const handlePageBack = () => {
    if (originFlow) {
      // Navigate back to the originating flow route
      navigate(`/${originFlow}`);
      return;
    }
    if (friendId && friendId !== "undefined")
      navigate(`/friends/expenses/${friendId}`);
    else navigate("/expenses");
  };
  const { hasWriteAccess } = useFriendAccess(friendId);
  const [createPaymentMethodModalOpen, setCreatePaymentMethodModalOpen] =
    useState(false);

  const onRefresh = () => {
    dispatch(
      fetchPaymentMethodsWithExpenses(activeRange, offset, flowTab, friendId)
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
        cards: paymentMethodCards,
        barSegments,
        stackedChartData,
        xAxisKey,
        rangeLabel,
        expensesMap: paymentMethodExpenses,
      }}
      entityConfig={{
        singular: "Payment Method",
        plural: "payment methods",
        idKey: "categoryId", // underlying id field name in cards
        nameKey: "categoryName",
        routeBase: "payment-method",
        addNewOptions: [
          {
            label: "Add Payment Method",
            route:
              friendId && friendId !== "undefined"
                ? `/payment-method/create/${friendId}`
                : "/payment-method/create",
            color: "#00DAC6",
          },
          {
            label: "Upload File",
            route:
              friendId && friendId !== "undefined"
                ? `/upload/payments/${friendId}`
                : "/upload/payments",
            color: "#5b7fff",
          },
        ],
        navItems: [
          {
            path: "/payment-method/reports",
            icon: "report.png",
            label: "Reports",
          },
          { path: "/budget", icon: "budget.png", label: "Budget" },
          { path: "/category-flow", icon: "category.png", label: "Categories" },
          { path: "/bill", icon: "bill.png", label: "Bill" },
        ],
        deletionConfirmText:
          "Are you sure you want to delete this payment method?",
      }}
      chartComponent={FlowStackedChart}
      formatCompactNumber={formatCompactNumber}
      friendId={friendId}
      isFriendView={isFriendView}
      hasWriteAccess={hasWriteAccess}
      createDialog={{
        open: createPaymentMethodModalOpen,
        setOpen: setCreatePaymentMethodModalOpen,
        title: "Create Payment Method",
        Component: CreatePaymentMethod,
        onCreated: () => {},
      }}
      onDeleteAction={(id, frId) => dispatch(deletePaymentMethod(id, frId))}
      onRefresh={onRefresh}
      navigate={navigate}
      showBackButton={showBackButton}
      onPageBack={handlePageBack}
    />
  );
};

export default PaymentMethodFlow;
