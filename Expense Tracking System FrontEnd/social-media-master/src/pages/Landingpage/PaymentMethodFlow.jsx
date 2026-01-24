import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useFriendAccess from "../../hooks/useFriendAccess";
import usePaymentMethodFlowData from "../../hooks/usePaymentMethodFlowData";
import { useDispatch } from "react-redux";
import { deletePaymentMethod } from "../../Redux/Payment Method/paymentMethod.action";
import { formatCompactNumber } from "../../utils/numberFormatters";
import CreatePaymentMethod from "./CreatePaymentMethod";
import GenericFlowPage from "../../components/common/GenericFlowPage";
import FlowStackedChart from "../../components/common/FlowStackedChart";
import { useTranslation } from "../../hooks/useTranslation";

const PaymentMethodFlow = () => {
  const { friendId } = useParams();
  const [search] = useState(""); // Local search handled inside GenericFlowPage
  const isFriendView = Boolean(friendId && friendId !== "undefined");
  const { t } = useTranslation();
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
    refreshPaymentMethodFlow,
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
        singular: t("flows.entities.paymentMethod.singular"),
        plural: t("flows.entities.paymentMethod.plural"),
        idKey: "categoryId", // underlying id field name in cards
        nameKey: "categoryName",
        routeBase: "payment-method",
        addNewOptions: [
          {
            label: t("cashflow.addNew.options.addPaymentMethod"),
            route:
              friendId && friendId !== "undefined"
                ? `/payment-method/create/${friendId}`
                : "/payment-method/create",
            color: "#00DAC6",
          },
          {
            label: t("cashflow.addNew.options.uploadFile"),
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
            label: t("navigation.reports"),
          },
          {
            path:
              friendId && friendId !== "undefined"
                ? `/payment-method/calendar/${friendId}`
                : "/payment-method/calendar",
            icon: "calendar.png",
            label: t("cashflow.nav.calendar"),
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
            path: "/category-flow",
            icon: "category.png",
            label: t("navigation.categories"),
          },
          {
            path: "/bill",
            icon: "bill.png",
            label: t("navigation.bill"),
          },
        ],
        deletionConfirmText: t("flows.confirmations.deletePaymentMethod"),
      }}
      chartComponent={FlowStackedChart}
      formatCompactNumber={formatCompactNumber}
      friendId={friendId}
      isFriendView={isFriendView}
      hasWriteAccess={hasWriteAccess}
      createDialog={{
        open: createPaymentMethodModalOpen,
        setOpen: setCreatePaymentMethodModalOpen,
        title: t("flows.paymentMethodFlow.createDialogTitle"),
        Component: CreatePaymentMethod,
        onCreated: () => {},
      }}
      onDeleteAction={(id, frId) => dispatch(deletePaymentMethod(id, frId))}
      onRefresh={refreshPaymentMethodFlow}
      navigate={navigate}
      showBackButton={showBackButton}
      onPageBack={handlePageBack}
    />
  );
};

export default PaymentMethodFlow;
