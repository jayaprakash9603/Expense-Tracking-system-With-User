import React from "react";
import CategoryAnalyticsView from "../CategoryAnalytics/CategoryAnalyticsView";
import {
  fetchPaymentMethodAnalytics,
  clearPaymentMethodAnalytics,
} from "../../Redux/Payment Method/paymentMethod.action";

const PaymentMethodAnalyticsView = () => (
  <CategoryAnalyticsView
    entityType="paymentMethod"
    entityIdParam="paymentMethodId"
    entityLabel="Payment Method"
    fetchAnalytics={fetchPaymentMethodAnalytics}
    clearAnalytics={clearPaymentMethodAnalytics}
    analyticsSelector={(state) => state.paymentMethod || {}}
    analyticsKeys={{
      data: "paymentMethodAnalytics",
      loading: "paymentMethodAnalyticsLoading",
      error: "paymentMethodAnalyticsError",
    }}
    editRouteBase="/payment-method/edit"
  />
);

export default PaymentMethodAnalyticsView;
